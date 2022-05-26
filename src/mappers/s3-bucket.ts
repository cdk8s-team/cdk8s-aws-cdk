import { aws_s3 as s3 } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as ks3buckets from '../imports/s3buckets-s3.services.k8s.aws';
import * as base from './base';

export class S3BucketMapper extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::S3::Bucket';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'bucketName',
    specPath: '/spec/name',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as s3.CfnBucketProps;

    const lambdaFunctionConfigurations: ks3buckets.BucketSpecNotificationLambdaFunctionConfigurations[] = [];
    const cfnNotifications = properties.notificationConfiguration as s3.CfnBucket.NotificationConfigurationProperty;

    if (cfnNotifications) {
      for (const config of (cfnNotifications.lambdaConfigurations as Array<s3.CfnBucket.LambdaConfigurationProperty>) ?? []) {
        const filter = (config.filter as s3.CfnBucket.NotificationFilterProperty);
        const s3Key = filter.s3Key as s3.CfnBucket.S3KeyFilterProperty;
        const rules = s3Key.rules as Array<s3.CfnBucket.FilterRuleProperty>;
        lambdaFunctionConfigurations.push({
          events: [config.event],
          filter: {
            key: {
              filterRules: rules.map(r => ({ name: r.name, value: r.value })),
            },
          },
          lambdaFunctionArn: config.function,
        });
      }
    }

    return new ks3buckets.Bucket(this.chart, logicalId, {
      metadata: { name: properties.bucketName },
      spec: {
        name: properties.bucketName!,
        notification: {
          lambdaFunctionConfigurations: lambdaFunctionConfigurations.length > 0 ? lambdaFunctionConfigurations : undefined,
        },
      },
    });
  }
}
