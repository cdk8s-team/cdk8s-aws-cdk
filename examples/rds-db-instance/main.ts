import {
  aws_ec2 as ec2,
  aws_rds as rds,
} from 'aws-cdk-lib';
import * as aws from 'aws-cdk-lib';
import * as k from 'cdk8s';
import * as kplus from 'cdk8s-plus-24';
import { Construct } from 'constructs';
import { Chart } from '../../src';

export class PostgreSQL extends Construct {

  public readonly address: string;
  public readonly port: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

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

    this.address = dbInstance.dbInstanceEndpointAddress;
    this.port = dbInstance.dbInstanceEndpointPort;

  }
}

export class Workload extends Construct {

  public readonly container: kplus.Container;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const deployment = new kplus.Deployment(this, 'Deployment');

    this.container = deployment.addContainer({ image: 'image', port: 8080 });

  }
}

export class RdsDBInstanceChart extends Chart {

  constructor(scope: Construct, id: string, props: k.ChartProps = {}) {
    super(scope, id, props);

    const postgres = new PostgreSQL(this, 'PostgreSQL');

    const workload = new Workload(this, 'Workload');

    workload.container.env.addVariable('DB_ADDRESS', kplus.EnvValue.fromValue(postgres.address));
    workload.container.env.addVariable('DB_PORT', kplus.EnvValue.fromValue(postgres.port));

  }

}

export class RdsDBInstanceStack extends aws.Stack {

  constructor(scope: Construct, id: string, props: aws.StackProps = {}) {
    super(scope, id, props);

    const postgres = new PostgreSQL(this, 'PostgreSQL');

    new aws.CfnOutput(this, 'PostgreSQLAddress', {
      value: postgres.address,
    });

    new aws.CfnOutput(this, 'PostgreSQLPort', {
      value: postgres.port,
    });

  }

}

const cdk8sApp = new k.App();
const awscdkApp = new aws.App({ outdir: 'cdk.out' });
new RdsDBInstanceChart(cdk8sApp, 'RdsDBInstanceChart');
new RdsDBInstanceStack(awscdkApp, 'RdsDBInstanceStack');

cdk8sApp.synth();
awscdkApp.synth();
