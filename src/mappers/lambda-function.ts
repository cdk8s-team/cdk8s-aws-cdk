import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as klambdafunctions from '../imports/lambdafunctions-lambda.services.k8s.aws';
import * as base from './base';

export class LambdaFunctionMapper extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::Lambda::Function';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'functionName',
    specPath: '/spec/name',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as lambda.CfnFunctionProps;

    return new klambdafunctions.Function(this.chart, logicalId, {
      metadata: { name: properties.functionName },
      spec: {
        code: {
          imageUri: (properties.code as lambda.CfnFunction.CodeProperty).imageUri,
        },
        name: properties.functionName!,
        role: properties.role,
        handler: properties.handler,
        runtime: properties.runtime,
      },
    });
  }
}
