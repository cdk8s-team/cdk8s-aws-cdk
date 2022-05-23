import { aws_rds as rds } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as krdsdbsubnetgroups from '../imports/rdsdbsubnetgroups-rds.services.k8s.aws';
import * as base from './base';


export class RdsDBSubnetGroup extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::RDS::DBSubnetGroup';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'dbSubnetGroupName',
    specPath: '/spec/name',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as rds.CfnDBSubnetGroupProps;

    return new krdsdbsubnetgroups.DbSubnetGroup(this.chart, logicalId, {
      metadata: { name: properties.dbSubnetGroupName },
      spec: {
        name: properties.dbSubnetGroupName!,
        description: properties.dbSubnetGroupDescription,
        subnetIDs: properties.subnetIds,
        tags: properties.tags,
      },
    });
  }
}
