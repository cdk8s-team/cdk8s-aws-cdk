import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as kec2securitygroups from '../imports/ec2securitygroups-ec2.services.k8s.aws';
import * as base from './base';

export class Ec2SecurityGroupMapper extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::EC2::SecurityGroup';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'groupName',
    specPath: '/spec/name',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as ec2.CfnSecurityGroupProps;

    return new kec2securitygroups.SecurityGroup(this.chart, logicalId, {
      metadata: { name: properties.groupName },
      spec: {
        name: properties.groupName!,
        description: properties.groupDescription,
        vpcId: properties.vpcId,
      },
    });
  }
}
