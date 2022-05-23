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
    cfnProperty: 'dbInstanceIdentifier',
    specPath: '/spec/dbInstanceIdentifier',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as rds.CfnDBInstanceProps;

    const cfnDdbSubnetGroupName = properties.dbSubnetGroupName;

    let dbSubnetGroupName = undefined;

    if (typeof(cfnDdbSubnetGroupName) === 'object') {
      const key = Object.keys(cfnDdbSubnetGroupName)[0];
      const value = Object.values(cfnDdbSubnetGroupName)[0];
      if (key === 'Ref') { // TODO add condition here that this ref acutally repsents the name
        const reference = this.chart.node.findChild(value as string);
        dbSubnetGroupName = k.ApiObject.of(reference).name;
      }
    } else {
      dbSubnetGroupName = cfnDdbSubnetGroupName;
    }

    return new krdsdbinstances.DbInstance(this.chart, logicalId, {
      metadata: { name: dbSubnetGroupName },
      spec: {
        dbInstanceClass: properties.dbInstanceClass,
        allocatedStorage: properties.allocatedStorage ? parseInt(properties.allocatedStorage) : undefined,
        copyTagsToSnapshot: properties.copyTagsToSnapshot as boolean,
        dbSubnetGroupName: dbSubnetGroupName,
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
