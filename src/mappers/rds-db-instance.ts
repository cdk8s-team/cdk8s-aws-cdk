import { aws_rds as rds } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as krdsdbinstances from '../imports/rdsdbinstances-rds.services.k8s.aws';
import * as base from './base';

export class RdsDBInstanceMapper extends base.CloudFormationResourceMapper {

  public readonly type: string = 'AWS::RDS::DBInstance';

  public readonly exportMappings: base.CloudFormationMapperExportMapping[] = [
    {
      field: 'endpoint.address',
      attribute: 'Endpoint.Address',
    },
    {
      field: 'endpoint.port',
      attribute: 'Endpoint.Port',
    },
  ];

  public readonly nameMapping: base.CloudFormationMapperNameMapping = {
    cfnProperty: 'dbName',
    specPath: '/spec/dbName',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as rds.CfnDBInstanceProps;

    return new krdsdbinstances.DbInstance(this.chart, logicalId, {
      metadata: { name: properties.dbName },
      spec: {
        dbName: properties.dbName,
        dbClusterIdentifier: properties.dbInstanceIdentifier,
        dbInstanceClass: properties.dbInstanceClass,
        allocatedStorage: properties.allocatedStorage ? parseInt(properties.allocatedStorage) : undefined,
        copyTagsToSnapshot: properties.copyTagsToSnapshot as boolean,
        dbSubnetGroupName: properties.dbSubnetGroupName,
        engine: properties.engine!,
        masterUsername: properties.masterUsername,
        // masterUserPassword: properties.masterUserPassword,
        storageType: properties.storageType,
        vpcSecurityGroupIDs: properties.vpcSecurityGroups,
        dbInstanceIdentifier: properties.dbInstanceIdentifier!,
      },
    });
  }
}
