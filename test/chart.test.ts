import {
  aws_ec2 as ec2,
  aws_rds as rds,
} from 'aws-cdk-lib';
import * as aws from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as kplus from 'cdk8s-plus-24';
import { Construct } from 'constructs';
import * as src from '../src';

test('rds-db-instance', () => {

  class RdsDBInstanceChart extends src.Chart {

    constructor(scope: Construct, id: string, props: k.ChartProps = {}) {
      super(scope, id, props);

      const vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
        availabilityZones: ['us-east-1b', 'us-east-1a'],
        vpcId: 'vpc-03c9c89ead26f6840',
        privateSubnetIds: ['subnet-065321f51cb2ac562', 'subnet-0d72f4230848972e9'],
        publicSubnetIds: ['subnet-0847295da218124fa', 'subnet-033821bf98e0a89bf'],
      });

      const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SecurityGroup', 'sg-06a21c2d7f87340df');

      const dbInstance = new rds.DatabaseInstance(this, 'DatabaseInstance', {
        engine: rds.DatabaseInstanceEngine.POSTGRES,
        vpc,
        credentials: {
          username: 'postgres',
          password: aws.SecretValue.unsafePlainText('password'),
        },
        securityGroups: [securityGroup],

      });

      const application = new kplus.Deployment(this, 'Application');

      const container = application.addContainer({ image: 'application', port: 8080 });
      container.env.addVariable('DB_ADDRESS', kplus.EnvValue.fromValue(dbInstance.dbInstanceEndpointAddress));
      container.env.addVariable('DB_PORT', kplus.EnvValue.fromValue(dbInstance.dbInstanceEndpointPort));


    }

  }

  const app = new k.App();
  const chart = new RdsDBInstanceChart(app, 'RdsDBInstanceChart');
  expect(k.Testing.synth(chart)).toMatchSnapshot();

});