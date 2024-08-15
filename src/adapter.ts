import * as aws from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as kplus from 'cdk8s-plus-28';
import { Construct } from 'constructs';
import * as kfieldexports from './imports/fieldexports-services.k8s.aws';
import * as k8s from './imports/k8s';
import * as mappers from './mappers';

export interface AwsCdkAdapterProps extends aws.StackProps {

  readonly chart: k.Chart;
}

export class AwsCdkAdapater extends aws.Stack {

  private readonly chart: k.Chart;

  private readonly _mappers: Record<string, mappers.CloudFormationResourceMapper> = {};

  constructor(scope: Construct, id: string, props: AwsCdkAdapterProps) {
    super(scope, id, props);
    this.chart = props.chart;

    this.registerMapper(new mappers.RdsDBInstanceMapper(this.chart));
    this.registerMapper(new mappers.Ec2SecurityGroupMapper(this.chart));
    this.registerMapper(new mappers.RdsDBSubnetGroup(this.chart));
    this.registerMapper(new mappers.IamPolicyMapper(this.chart));
    this.registerMapper(new mappers.IamRoleMapper(this.chart));
    this.registerMapper(new mappers.LambdaFunctionMapper(this.chart));
    this.registerMapper(new mappers.S3BucketMapper(this.chart));
  }

  /**
   * Register a mapper that can transform a specific CloudFormation resource type.
   */
  public registerMapper(mapper: mappers.CloudFormationResourceMapper) {
    this._mappers[mapper.type] = mapper;
  }

  /**
   * Transform CloudFormation resources to ACK resources.
   */
  public transformResources(cfnResources: aws.CfnResource[]) {

    for (const cfnResource of cfnResources) {
      const logicalId = this.getLogicalId(cfnResource);
      const cfnType = cfnResource.cfnResourceType;

      const mapper = this.tryFindMapper(cfnType);

      if (!mapper) {
        throw new Error(`Unable to transform resource of type '${cfnType}'. Mapper is not registered`);
      }

      const cfnTemplateResources = Object.values((cfnResource._toCloudFormation() as any).Resources) as any[];
      const cfnProperties = this.resolveIntrinsics(logicalId, this.resolve(cfnTemplateResources[0].value.Properties.value), mapper);

      const resource = mapper.map(logicalId, cfnProperties);

      // for each resource we patch its name if needed
      if (!cfnProperties[mapper.nameMapping.cfnProperty]) {
        resource.addJsonPatch(k.JsonPatch.add(mapper.nameMapping.specPath, resource.name));
        resource.addJsonPatch(k.JsonPatch.add('/metadata', { name: resource.name }));
      }

      // for each resource we create a config map that will hold its field exports.
      // i.e runtime attributes. these will later be used to transform CloudFormation
      // attributes.
      const configMap = new kplus.ConfigMap(this.chart, `${logicalId}ConfigMap`);

      for (const exportMapping of mapper.exportMappings) {
        new kfieldexports.FieldExport(this.chart, this.fieldExportId(logicalId, exportMapping.attribute), {
          spec: {
            from: {
              path: this.fieldExportPath(exportMapping.field),
              resource: { group: resource.apiGroup, kind: resource.kind, name: resource.name },
            },
            to: {
              kind: kfieldexports.FieldExportSpecToKind.CONFIGMAP,
              name: configMap.name,
            },
          },
        });
      }
    }
  }

  /**
   * Transform CloudFormation attributes into ACK field exports.
   *
   * Note that this is only supported for container environment variables,
   * as only they allow referencing fields from config maps, which the field exports export to.
   *
   * If an ApiObject contains a CloudFormation attribute in any other definition, it will remain
   * as is, it will remain in-place.
   */
  public transformAttributes(apiObjects: k.ApiObject[]) {

    for (const apiObject of apiObjects) {

      const spec: any = apiObject.toJson().spec;

      switch (apiObject.kind) {
        case 'Deployment':
        case 'StatefulSet':
        case 'DaemonSet':
        case 'Job':
          this.patchContainerEnvironment(apiObject, spec?.template?.spec?.containers ?? [], '/spec/template/spec/containers');
          break;
        case 'Pod':
          this.patchContainerEnvironment(apiObject, spec?.containers ?? [], '/spec/containers');
          break;
        default:
          break;
      }
    }
  }

  private patchContainerEnvironment(resource: k.ApiObject, containers: k8s.Container[], path: string) {

    for (let i = 0; i < containers.length; i++) {

      const container = containers[i];
      const envVars = container.env ?? [];

      for (let j = 0; j < envVars.length; j++) {

        const envVar = envVars[j];

        if (!envVar.value) {
          // we only conver value --> valueFrom
          continue;
        }

        if (!aws.Token.isUnresolved(envVar.value)) {
          // no conversion necessary
          continue;
        }

        const resolved = this.resolve(envVar.value);

        if (typeof(resolved) !== 'object') {
          // not sure what this means...skip in the meantime
          continue;
        }

        const key = Object.keys(resolved)[0];
        if (!key.startsWith('Fn::GetAtt')) {
          // not sure what this means...skip in the meantime
          continue;
        }

        const value = Object.values(resolved)[0] as string[];
        const logicalId = value[0];
        const attribute = value[1];

        // locate the field exports that is mapped to this attribute.
        const fieldExport = this.tryFindFieldExport(logicalId, attribute);
        if (!fieldExport) {
          throw new Error(`Unable to transform attribute '${JSON.stringify(resolved)}' for env variable '${envVar.name}' in resource '${resource.name}': Field export not registered.`);
        }

        const fieldExportSpec: kfieldexports.FieldExportSpec = fieldExport.toJson().spec;
        const namespace = fieldExport.metadata.namespace ?? 'default';

        resource.addJsonPatch(k.JsonPatch.remove(`${path}/${i}/env/${j}`));
        resource.addJsonPatch(k.JsonPatch.add(`${path}/${i}/env/${j}`, {
          name: envVar.name,
          valueFrom: {
            configMapKeyRef: {
              key: `${namespace}.${fieldExport.name}`,
              name: fieldExportSpec.to.name,
            },
          },
        }));
      }
    }
  }

  private resolveIntrinsics(logicalId: string, properties: any, mapper: mappers.CloudFormationResourceMapper) {

    const resolved = JSON.stringify(properties, (key, value) => {

      if (typeof(value) !== 'object') {
        // not an attribute
        return value;
      }

      if (Object.keys(value).length !== 1) {
        // definitely not an intrinsic, which takes the form '{ key: value }'
        return value;
      }

      const attribute = Object.keys(value)[0];
      const refLogicalId = Object.values(value)[0];

      if (attribute.startsWith('Fn::')) {
        // ACK doesn't have support for Fn:: intrinsics at the moment.
        // actually -- thats not entirely true, some resources do have a way to pass
        // values by referencing other resources. For example, you can pass a `vpcRef`
        // to a security group, instead of the actual vpc id. but I have yet to list those out,
        // and understand how they work.
        throw new Error(`Unable to resolve intrinsic function '${JSON.stringify(value)}' in property '${key}' of resource '${logicalId}'`);
      }

      if (attribute !== 'Ref') {
        // probably just a complext value, move on...
        return value;
      }

      // we can resolve 'Ref' because we know all resource names at synth time.
      const reference = this.chart.node.findChild(refLogicalId as string);
      switch (mapper.refMapping) {
        case mappers.CloudFormationMapperRefMapping.NAME:
          return k.ApiObject.of(reference).name;
        default:
          throw new Error(`Unsupported ref mapping: ${mapper.refMapping}`);
      }
    });

    return JSON.parse(resolved);

  }

  private tryFindMapper(cfnType: string): mappers.CloudFormationResourceMapper {
    return this._mappers[cfnType];
  }

  private tryFindFieldExport(logicalId: string, attr: string): kfieldexports.FieldExport {
    return this.chart.node.tryFindChild(this.fieldExportId(logicalId, attr)) as kfieldexports.FieldExport;
  }

  private fieldExportId(logicalId: string, attribute: string) {
    return `${logicalId}${attribute}`;
  }

  private fieldExportPath(field: string) {
    return `.status.${field}`;
  }

}
