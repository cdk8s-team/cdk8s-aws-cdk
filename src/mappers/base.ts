import * as k from 'cdk8s';

export interface CloudFormationMapperNameMapping {

  readonly specPath: string;

  readonly cfnProperty: string;

}

export interface CloudFormationMapperExportMapping {

  readonly field: string;

  readonly attribute: string;

}

export enum CloudFormationMapperRefMapping {
  NAME = 'name',
  ARN = 'arn'
}

export abstract class CloudFormationResourceMapper {

  public abstract readonly type: string;

  public abstract readonly exportMappings: CloudFormationMapperExportMapping[];

  public abstract readonly nameMapping: CloudFormationMapperNameMapping;

  public readonly refMapping: CloudFormationMapperRefMapping = CloudFormationMapperRefMapping.NAME;

  public constructor(protected readonly chart: k.Chart) {}

  public abstract map(logicalId: string, cfnProperties: any): k.ApiObject;

}
