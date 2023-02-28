import { aws_iam as iam } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as base from './base';
import * as kiamroles from '../imports/iamroles-iam.services.k8s.aws';

export class IamRoleMapper extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::IAM::Role';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'roleName',
    specPath: '/spec/name',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as iam.CfnRoleProps;

    const cfnPolicies = properties.policies as Array<iam.CfnRole.PolicyProperty>;
    return new kiamroles.Role(this.chart, logicalId, {
      metadata: { name: properties.roleName },
      spec: {
        assumeRolePolicyDocument: properties.assumeRolePolicyDocument,
        name: properties.roleName!,
        policies: cfnPolicies ? cfnPolicies.map(p => p.policyName) : undefined,
      },
    });
  }
}
