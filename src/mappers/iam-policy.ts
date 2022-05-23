import { aws_iam as iam } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as kiampolicies from '../imports/iampolicies-iam.services.k8s.aws';
import * as base from './base';

export class IamPolicyMapper extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::IAM::Policy';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'policyName',
    specPath: '/spec/name',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as iam.CfnPolicyProps;

    return new kiampolicies.Policy(this.chart, logicalId, {
      metadata: { name: properties.policyName },
      spec: {
        name: properties.policyName,
        policyDocument: properties.policyDocument,
      },
    });
  }
}
