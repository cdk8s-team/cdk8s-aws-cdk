import { aws_rds as rds } from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as kplus from 'cdk8s-plus-24';
import * as krdsdbinstances from '../imports/rdsdbinstances-rds.services.k8s.aws';
import * as base from './base';

const PASSWORD_SECRET_KEY = 'password';

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
    cfnProperty: 'dbClusterIdentifier',
    specPath: '/spec/dbInstanceIdentifier',
  };

  public map(logicalId: string, cfnProperties: any): k.ApiObject {

    const properties = cfnProperties as rds.CfnDBInstanceProps;

    const passwordSecret = properties.masterUserPassword ? this.createPasswordSecret(properties.masterUserPassword, logicalId) : undefined;

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
        masterUserPassword: passwordSecret ? {
          key: PASSWORD_SECRET_KEY,
          name: passwordSecret.name,
          namespace: passwordSecret.metadata.namespace,
        } : undefined,
        storageType: properties.storageType,
        dbSecurityGroups: properties.dbSecurityGroups,
        vpcSecurityGroupIDs: properties.vpcSecurityGroups,
        dbInstanceIdentifier: properties.dbInstanceIdentifier!,
        characterSetName: properties.characterSetName,
      },
    });
  }

  private createPasswordSecret(password: string, logicalId: string): kplus.Secret {
    const secret = new kplus.Secret(this.chart, `${logicalId}Secret`);
    secret.addStringData(PASSWORD_SECRET_KEY, password);
    return secret;
  }
}
