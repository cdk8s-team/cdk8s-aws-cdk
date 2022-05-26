# cdk8s-aws-cdk

AWS CDK Adapter for cdk8s allows you to define AWS CDK constructs within a cdk8s application.
The AWS resources will be provisioned using the [AWS Controllers for Kubernetes](https://aws-controllers-k8s.github.io/community/docs/community/overview/).

## DO NOT USE THIS IN PRODUCTION

This project is in very early alpha stages of development and is subject to frequent breaking changes.

## Pre-requisites

In you Kubernetes cluster, [install the appropriate ACK controllers](https://aws-controllers-k8s.github.io/community/docs/user-docs/install/),
depending on which resources you want to provision.

## Getting Started

Install the adapter and the AWS CDK in your cdk8s project.

```console
npm install cdk8s-aws-cdk aws-cdk-lib
```

The adapter provides a special `Chart`, that allows defining AWS CDK resources. You must extend this chart,
in place of the normal `cdk8s.Chart` object.

```ts
import * as awscdkadapter from 'cdk8s-aws-cdk'
import * as k from 'cdk8s';
import * as kplus from 'cdk8s-plus-24';
import { aws_s3 as s3 } from 'aws-cdk-lib';

export class MyChart extends awscdkadapter.Chart {

  constructor(scope: Construct, id: string, props: k.ChartProps = {}) {
    super(scope, id, props);

    // define an s3 bucket with aws-cdk
    new s3.Bucket(this, 'Bucket');

    // define a kubernetes deployment with cdk8s+
    new kplus.Deployment(this, 'Deployment', {
      containers: [{ image: 'image' }],
    });

  }

}
```

Synthesizing this chart will produce:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: s3sample-deployment-c828e7a5
spec:
  minReadySeconds: 0
  progressDeadlineSeconds: 600
  replicas: 1
  selector:
    matchLabels:
      cdk8s.io/metadata.addr: S3Sample-Deployment-c8c2c08d
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        cdk8s.io/metadata.addr: S3Sample-Deployment-c8c2c08d
    spec:
      automountServiceAccountToken: true
      containers:
        - image: image
          imagePullPolicy: Always
          name: main
          securityContext:
            privileged: false
            readOnlyRootFilesystem: false
            runAsNonRoot: false
      dnsPolicy: ClusterFirst
      securityContext:
        fsGroupChangePolicy: Always
        runAsNonRoot: false
      setHostnameAsFQDN: false
---
apiVersion: s3.services.k8s.aws/v1alpha1
kind: Bucket
metadata:
  name: s3sample-bucket83908e77-c80d1127
spec:
  name: s3sample-bucket83908e77-c80d1127
```

You can then apply this manifest to the cluster by any means.

## Limitations

The are quite a few limitations at the moment.

### Resource Coverage

There are two layers of resource coverage that are involved in the process:

#### ACK Resources

The adapter maps every AWS CDK resource to its corresponding ACK resource.
This means resources that aren't currently supported by ACK cannot be defined.

#### Adapter Mappers

For resources that are supported by ACK, this adapter contains [mappers](./src/mappers/) that
can do the translation. Not all supported resources have been mapped yet, the built-in mapped resources are:

- EC2 Security Group
- IAM Policy
- IAM Role
- Lambda Function
- RDS DB Instance
- RDS Subnet Group
- S3 Bucket

If your application contains additional resources, that are supported by ACK but haven't been mapped by the adapter, you
can register customer mappers:

First you implement a custom mapper:

```ts
import * as awscdkadapter from 'cdk8s-aws-cdk'

export class KmsKeyMapper extends awscdkadapter.CloudFormationResourceMapper {

  /**
   * @see CloudFormationResourceMapper.type
   */
  public readonly type: string = 'AWS::KMS::Key';

  // implement the additional required methods and properties
  ...
}
```

Then you register it:

```ts
import * as awscdkadapter from 'cdk8s-aws-cdk'
import * as k from 'cdk8s';
import { aws_kms as kms } from 'aws-cdk-lib';

export class MyChart extends awscdkadapter.Chart {

  constructor(scope: Construct, id: string, props: k.ChartProps = {}) {
    super(scope, id, props);

    this.registerMapper(new KmsKeyMapper(this))

    // now you can define a kms key
    new kms.Key(this, 'Key');

  }

}
```

### Attributes

CDK Tokens that represent CloudFormation attributes (i.e `Fn::GetAttr`) can be used as Kubernetes environment variables
when defining containers, but **they cannot be used for anything else**.

For example, you can pass an attribute to a container like so:

```ts
const dbInstance = new rds.DatabaseInstance(...);
const container = deployment.addContainer(...);

container.env.addVariable('DB_ADDRESS', kplus.EnvValue.fromValue(dbInstance.dbInstanceEndpointAddress))
```

But you **cannot** pass the same attribute to, for example, lambda function environment variables:

```ts
const dbInstance = new rds.DatabaseInstance(...);
const func = new lambda.Function(...);

func.addEnvironment('DB_ADDRESS', dbInstance.dbInstanceEndpointAddress);
```

This is because attribute mapping is implemented by exporting them
using [ACK Field Exports](https://aws-controllers-k8s.github.io/community/docs/user-docs/field-export/).
These field exports can only be imported in a select number of resources, and currently the adapter only supports
kubernetes environment variables.

### Assets

AWS CDK assets are currently not supported.

## Examples

- [Kubernetes deployment that writes to an RDS PostgreSQL database](./examples/rds-db-instance/).