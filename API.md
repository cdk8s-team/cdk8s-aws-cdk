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
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AwsCdkAdapater <a name="AwsCdkAdapater" id="cdk8s-aws-cdk.AwsCdkAdapater"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.AwsCdkAdapater.Initializer"></a>

```typescript
import { AwsCdkAdapater } from 'cdk8s-aws-cdk'

new AwsCdkAdapater(scope: Construct, id: string, props: AwsCdkAdapterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.Initializer.parameter.props">props</a></code> | <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps">AwsCdkAdapterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk8s-aws-cdk.AwsCdkAdapater.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk8s-aws-cdk.AwsCdkAdapater.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk8s-aws-cdk.AwsCdkAdapater.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk8s-aws-cdk.AwsCdkAdapterProps">AwsCdkAdapterProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.addDependency">addDependency</a></code> | Add a dependency between this stack and another stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.addMetadata">addMetadata</a></code> | Adds an arbitary key-value pair, with information you want to record about the stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.addTransform">addTransform</a></code> | Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.exportStringListValue">exportStringListValue</a></code> | Create a CloudFormation Export for a string list value. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.exportValue">exportValue</a></code> | Create a CloudFormation Export for a string value. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.formatArn">formatArn</a></code> | Creates an ARN from components. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.getLogicalId">getLogicalId</a></code> | Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.regionalFact">regionalFact</a></code> | Look up a fact value for the given fact for the region of this stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.renameLogicalId">renameLogicalId</a></code> | Rename a generated logical identities. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.reportMissingContextKey">reportMissingContextKey</a></code> | Indicate that a context key was expected. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.resolve">resolve</a></code> | Resolve a tokenized value in the context of the current stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.splitArn">splitArn</a></code> | Splits the provided ARN into its components. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.toJsonString">toJsonString</a></code> | Convert an object, potentially containing tokens, to a JSON string. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.toYamlString">toYamlString</a></code> | Convert an object, potentially containing tokens, to a YAML string. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.registerMapper">registerMapper</a></code> | Register a mapper that can transform a specific CloudFormation resource type. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.transformAttributes">transformAttributes</a></code> | Transform CloudFormation attributes into ACK field exports. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.transformResources">transformResources</a></code> | Transform CloudFormation resources to ACK resources. |

---

##### `toString` <a name="toString" id="cdk8s-aws-cdk.AwsCdkAdapater.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="cdk8s-aws-cdk.AwsCdkAdapater.addDependency"></a>

```typescript
public addDependency(target: Stack, reason?: string): void
```

Add a dependency between this stack and another stack.

This can be used to define dependencies between any two stacks within an
app, and also supports nested stacks.

###### `target`<sup>Required</sup> <a name="target" id="cdk8s-aws-cdk.AwsCdkAdapater.addDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.Stack

---

###### `reason`<sup>Optional</sup> <a name="reason" id="cdk8s-aws-cdk.AwsCdkAdapater.addDependency.parameter.reason"></a>

- *Type:* string

---

##### `addMetadata` <a name="addMetadata" id="cdk8s-aws-cdk.AwsCdkAdapater.addMetadata"></a>

```typescript
public addMetadata(key: string, value: any): void
```

Adds an arbitary key-value pair, with information you want to record about the stack.

These get translated to the Metadata section of the generated template.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html)

###### `key`<sup>Required</sup> <a name="key" id="cdk8s-aws-cdk.AwsCdkAdapater.addMetadata.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="cdk8s-aws-cdk.AwsCdkAdapater.addMetadata.parameter.value"></a>

- *Type:* any

---

##### `addTransform` <a name="addTransform" id="cdk8s-aws-cdk.AwsCdkAdapater.addTransform"></a>

```typescript
public addTransform(transform: string): void
```

Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template.

Duplicate values are removed when stack is synthesized.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)

*Example*

```typescript
declare const stack: Stack;

stack.addTransform('AWS::Serverless-2016-10-31')
```


###### `transform`<sup>Required</sup> <a name="transform" id="cdk8s-aws-cdk.AwsCdkAdapater.addTransform.parameter.transform"></a>

- *Type:* string

The transform to add.

---

##### `exportStringListValue` <a name="exportStringListValue" id="cdk8s-aws-cdk.AwsCdkAdapater.exportStringListValue"></a>

```typescript
public exportStringListValue(exportedValue: any, options?: ExportValueOptions): string[]
```

Create a CloudFormation Export for a string list value.

Returns a string list representing the corresponding `Fn.importValue()`
expression for this Export. The export expression is automatically wrapped with an
`Fn::Join` and the import value with an `Fn::Split`, since CloudFormation can only
export strings. You can control the name for the export by passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

See `exportValue` for an example of this process.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="cdk8s-aws-cdk.AwsCdkAdapater.exportStringListValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk8s-aws-cdk.AwsCdkAdapater.exportStringListValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `exportValue` <a name="exportValue" id="cdk8s-aws-cdk.AwsCdkAdapater.exportValue"></a>

```typescript
public exportValue(exportedValue: any, options?: ExportValueOptions): string
```

Create a CloudFormation Export for a string value.

Returns a string representing the corresponding `Fn.importValue()`
expression for this Export. You can control the name for the export by
passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

## Example

Here is how the process works. Let's say there are two stacks,
`producerStack` and `consumerStack`, and `producerStack` has a bucket
called `bucket`, which is referenced by `consumerStack` (perhaps because
an AWS Lambda Function writes into it, or something like that).

It is not safe to remove `producerStack.bucket` because as the bucket is being
deleted, `consumerStack` might still be using it.

Instead, the process takes two deployments:

### Deployment 1: break the relationship

- Make sure `consumerStack` no longer references `bucket.bucketName` (maybe the consumer
  stack now uses its own bucket, or it writes to an AWS DynamoDB table, or maybe you just
  remove the Lambda Function altogether).
- In the `ProducerStack` class, call `this.exportValue(this.bucket.bucketName)`. This
  will make sure the CloudFormation Export continues to exist while the relationship
  between the two stacks is being broken.
- Deploy (this will effectively only change the `consumerStack`, but it's safe to deploy both).

### Deployment 2: remove the bucket resource

- You are now free to remove the `bucket` resource from `producerStack`.
- Don't forget to remove the `exportValue()` call as well.
- Deploy again (this time only the `producerStack` will be changed -- the bucket will be deleted).

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="cdk8s-aws-cdk.AwsCdkAdapater.exportValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk8s-aws-cdk.AwsCdkAdapater.exportValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `formatArn` <a name="formatArn" id="cdk8s-aws-cdk.AwsCdkAdapater.formatArn"></a>

```typescript
public formatArn(components: ArnComponents): string
```

Creates an ARN from components.

If `partition`, `region` or `account` are not specified, the stack's
partition, region and account will be used.

If any component is the empty string, an empty string will be inserted
into the generated ARN at the location that component corresponds to.

The ARN will be formatted as follows:

  arn:{partition}:{service}:{region}:{account}:{resource}{sep}{resource-name}

The required ARN pieces that are omitted will be taken from the stack that
the 'scope' is attached to. If all ARN pieces are supplied, the supplied scope
can be 'undefined'.

###### `components`<sup>Required</sup> <a name="components" id="cdk8s-aws-cdk.AwsCdkAdapater.formatArn.parameter.components"></a>

- *Type:* aws-cdk-lib.ArnComponents

---

##### `getLogicalId` <a name="getLogicalId" id="cdk8s-aws-cdk.AwsCdkAdapater.getLogicalId"></a>

```typescript
public getLogicalId(element: CfnElement): string
```

Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource.

This method is called when a `CfnElement` is created and used to render the
initial logical identity of resources. Logical ID renames are applied at
this stage.

This method uses the protected method `allocateLogicalId` to render the
logical ID for an element. To modify the naming scheme, extend the `Stack`
class and override this method.

###### `element`<sup>Required</sup> <a name="element" id="cdk8s-aws-cdk.AwsCdkAdapater.getLogicalId.parameter.element"></a>

- *Type:* aws-cdk-lib.CfnElement

The CloudFormation element for which a logical identity is needed.

---

##### `regionalFact` <a name="regionalFact" id="cdk8s-aws-cdk.AwsCdkAdapater.regionalFact"></a>

```typescript
public regionalFact(factName: string, defaultValue?: string): string
```

Look up a fact value for the given fact for the region of this stack.

Will return a definite value only if the region of the current stack is resolved.
If not, a lookup map will be added to the stack and the lookup will be done at
CDK deployment time.

What regions will be included in the lookup map is controlled by the
`@aws-cdk/core:target-partitions` context value: it must be set to a list
of partitions, and only regions from the given partitions will be included.
If no such context key is set, all regions will be included.

This function is intended to be used by construct library authors. Application
builders can rely on the abstractions offered by construct libraries and do
not have to worry about regional facts.

If `defaultValue` is not given, it is an error if the fact is unknown for
the given region.

###### `factName`<sup>Required</sup> <a name="factName" id="cdk8s-aws-cdk.AwsCdkAdapater.regionalFact.parameter.factName"></a>

- *Type:* string

---

###### `defaultValue`<sup>Optional</sup> <a name="defaultValue" id="cdk8s-aws-cdk.AwsCdkAdapater.regionalFact.parameter.defaultValue"></a>

- *Type:* string

---

##### `renameLogicalId` <a name="renameLogicalId" id="cdk8s-aws-cdk.AwsCdkAdapater.renameLogicalId"></a>

```typescript
public renameLogicalId(oldId: string, newId: string): void
```

Rename a generated logical identities.

To modify the naming scheme strategy, extend the `Stack` class and
override the `allocateLogicalId` method.

###### `oldId`<sup>Required</sup> <a name="oldId" id="cdk8s-aws-cdk.AwsCdkAdapater.renameLogicalId.parameter.oldId"></a>

- *Type:* string

---

###### `newId`<sup>Required</sup> <a name="newId" id="cdk8s-aws-cdk.AwsCdkAdapater.renameLogicalId.parameter.newId"></a>

- *Type:* string

---

##### `reportMissingContextKey` <a name="reportMissingContextKey" id="cdk8s-aws-cdk.AwsCdkAdapater.reportMissingContextKey"></a>

```typescript
public reportMissingContextKey(report: MissingContext): void
```

Indicate that a context key was expected.

Contains instructions which will be emitted into the cloud assembly on how
the key should be supplied.

###### `report`<sup>Required</sup> <a name="report" id="cdk8s-aws-cdk.AwsCdkAdapater.reportMissingContextKey.parameter.report"></a>

- *Type:* aws-cdk-lib.cloud_assembly_schema.MissingContext

The set of parameters needed to obtain the context.

---

##### `resolve` <a name="resolve" id="cdk8s-aws-cdk.AwsCdkAdapater.resolve"></a>

```typescript
public resolve(obj: any): any
```

Resolve a tokenized value in the context of the current stack.

###### `obj`<sup>Required</sup> <a name="obj" id="cdk8s-aws-cdk.AwsCdkAdapater.resolve.parameter.obj"></a>

- *Type:* any

---

##### `splitArn` <a name="splitArn" id="cdk8s-aws-cdk.AwsCdkAdapater.splitArn"></a>

```typescript
public splitArn(arn: string, arnFormat: ArnFormat): ArnComponents
```

Splits the provided ARN into its components.

Works both if 'arn' is a string like 'arn:aws:s3:::bucket',
and a Token representing a dynamic CloudFormation expression
(in which case the returned components will also be dynamic CloudFormation expressions,
encoded as Tokens).

###### `arn`<sup>Required</sup> <a name="arn" id="cdk8s-aws-cdk.AwsCdkAdapater.splitArn.parameter.arn"></a>

- *Type:* string

the ARN to split into its components.

---

###### `arnFormat`<sup>Required</sup> <a name="arnFormat" id="cdk8s-aws-cdk.AwsCdkAdapater.splitArn.parameter.arnFormat"></a>

- *Type:* aws-cdk-lib.ArnFormat

the expected format of 'arn' - depends on what format the service 'arn' represents uses.

---

##### `toJsonString` <a name="toJsonString" id="cdk8s-aws-cdk.AwsCdkAdapater.toJsonString"></a>

```typescript
public toJsonString(obj: any, space?: number): string
```

Convert an object, potentially containing tokens, to a JSON string.

###### `obj`<sup>Required</sup> <a name="obj" id="cdk8s-aws-cdk.AwsCdkAdapater.toJsonString.parameter.obj"></a>

- *Type:* any

---

###### `space`<sup>Optional</sup> <a name="space" id="cdk8s-aws-cdk.AwsCdkAdapater.toJsonString.parameter.space"></a>

- *Type:* number

---

##### `toYamlString` <a name="toYamlString" id="cdk8s-aws-cdk.AwsCdkAdapater.toYamlString"></a>

```typescript
public toYamlString(obj: any): string
```

Convert an object, potentially containing tokens, to a YAML string.

###### `obj`<sup>Required</sup> <a name="obj" id="cdk8s-aws-cdk.AwsCdkAdapater.toYamlString.parameter.obj"></a>

- *Type:* any

---

##### `registerMapper` <a name="registerMapper" id="cdk8s-aws-cdk.AwsCdkAdapater.registerMapper"></a>

```typescript
public registerMapper(mapper: CloudFormationResourceMapper): void
```

Register a mapper that can transform a specific CloudFormation resource type.

###### `mapper`<sup>Required</sup> <a name="mapper" id="cdk8s-aws-cdk.AwsCdkAdapater.registerMapper.parameter.mapper"></a>

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationResourceMapper">CloudFormationResourceMapper</a>

---

##### `transformAttributes` <a name="transformAttributes" id="cdk8s-aws-cdk.AwsCdkAdapater.transformAttributes"></a>

```typescript
public transformAttributes(apiObjects: ApiObject[]): void
```

Transform CloudFormation attributes into ACK field exports.

Note that this is only supported for container environment variables,
as only they allow referencing fields from config maps, which the field exports export to.

If an ApiObject contains a CloudFormation attribute in any other definition, it will remain
as is, it will remain in-place.

###### `apiObjects`<sup>Required</sup> <a name="apiObjects" id="cdk8s-aws-cdk.AwsCdkAdapater.transformAttributes.parameter.apiObjects"></a>

- *Type:* cdk8s.ApiObject[]

---

##### `transformResources` <a name="transformResources" id="cdk8s-aws-cdk.AwsCdkAdapater.transformResources"></a>

```typescript
public transformResources(cfnResources: CfnResource[]): void
```

Transform CloudFormation resources to ACK resources.

###### `cfnResources`<sup>Required</sup> <a name="cfnResources" id="cdk8s-aws-cdk.AwsCdkAdapater.transformResources.parameter.cfnResources"></a>

- *Type:* aws-cdk-lib.CfnResource[]

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.isStack">isStack</a></code> | Return whether the given object is a Stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.of">of</a></code> | Looks up the first stack scope in which `construct` is defined. |

---

##### `isConstruct` <a name="isConstruct" id="cdk8s-aws-cdk.AwsCdkAdapater.isConstruct"></a>

```typescript
import { AwsCdkAdapater } from 'cdk8s-aws-cdk'

AwsCdkAdapater.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk8s-aws-cdk.AwsCdkAdapater.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isStack` <a name="isStack" id="cdk8s-aws-cdk.AwsCdkAdapater.isStack"></a>

```typescript
import { AwsCdkAdapater } from 'cdk8s-aws-cdk'

AwsCdkAdapater.isStack(x: any)
```

Return whether the given object is a Stack.

We do attribute detection since we can't reliably use 'instanceof'.

###### `x`<sup>Required</sup> <a name="x" id="cdk8s-aws-cdk.AwsCdkAdapater.isStack.parameter.x"></a>

- *Type:* any

---

##### `of` <a name="of" id="cdk8s-aws-cdk.AwsCdkAdapater.of"></a>

```typescript
import { AwsCdkAdapater } from 'cdk8s-aws-cdk'

AwsCdkAdapater.of(construct: IConstruct)
```

Looks up the first stack scope in which `construct` is defined.

Fails if there is no stack up the tree.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk8s-aws-cdk.AwsCdkAdapater.of.parameter.construct"></a>

- *Type:* constructs.IConstruct

The construct to start the search from.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.account">account</a></code> | <code>string</code> | The AWS account into which this stack will be deployed. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.artifactId">artifactId</a></code> | <code>string</code> | The ID of the cloud assembly artifact for this stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.availabilityZones">availabilityZones</a></code> | <code>string[]</code> | Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.bundlingRequired">bundlingRequired</a></code> | <code>boolean</code> | Indicates whether the stack requires bundling or not. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.dependencies">dependencies</a></code> | <code>aws-cdk-lib.Stack[]</code> | Return the stacks this stack depends on. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.environment">environment</a></code> | <code>string</code> | The environment coordinates in which this stack is deployed. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.nested">nested</a></code> | <code>boolean</code> | Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.notificationArns">notificationArns</a></code> | <code>string[]</code> | Returns the list of notification Amazon Resource Names (ARNs) for the current stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.partition">partition</a></code> | <code>string</code> | The partition in which this stack is defined. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.region">region</a></code> | <code>string</code> | The AWS region into which this stack will be deployed (e.g. `us-west-2`). |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.stackId">stackId</a></code> | <code>string</code> | The ID of the stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.stackName">stackName</a></code> | <code>string</code> | The concrete CloudFormation physical stack name. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method for this stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.tags">tags</a></code> | <code>aws-cdk-lib.TagManager</code> | Tags to be applied to the stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.templateFile">templateFile</a></code> | <code>string</code> | The name of the CloudFormation template file emitted to the output directory during synthesis. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.templateOptions">templateOptions</a></code> | <code>aws-cdk-lib.ITemplateOptions</code> | Options for CloudFormation template (like version, transform, description). |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.urlSuffix">urlSuffix</a></code> | <code>string</code> | The Amazon domain suffix for the region in which this stack is defined. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.nestedStackParent">nestedStackParent</a></code> | <code>aws-cdk-lib.Stack</code> | If this is a nested stack, returns it's parent stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.nestedStackResource">nestedStackResource</a></code> | <code>aws-cdk-lib.CfnResource</code> | If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapater.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether termination protection is enabled for this stack. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk8s-aws-cdk.AwsCdkAdapater.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="cdk8s-aws-cdk.AwsCdkAdapater.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS account into which this stack will be deployed.

This value is resolved according to the following rules:

1. The value provided to `env.account` when the stack is defined. This can
   either be a concrete account (e.g. `585695031111`) or the
   `Aws.ACCOUNT_ID` token.
3. `Aws.ACCOUNT_ID`, which represents the CloudFormation intrinsic reference
   `{ "Ref": "AWS::AccountId" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.account)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **account-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `artifactId`<sup>Required</sup> <a name="artifactId" id="cdk8s-aws-cdk.AwsCdkAdapater.property.artifactId"></a>

```typescript
public readonly artifactId: string;
```

- *Type:* string

The ID of the cloud assembly artifact for this stack.

---

##### `availabilityZones`<sup>Required</sup> <a name="availabilityZones" id="cdk8s-aws-cdk.AwsCdkAdapater.property.availabilityZones"></a>

```typescript
public readonly availabilityZones: string[];
```

- *Type:* string[]

Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack.

If the stack is environment-agnostic (either account and/or region are
tokens), this property will return an array with 2 tokens that will resolve
at deploy-time to the first two availability zones returned from CloudFormation's
`Fn::GetAZs` intrinsic function.

If they are not available in the context, returns a set of dummy values and
reports them as missing, and let the CLI resolve them by calling EC2
`DescribeAvailabilityZones` on the target environment.

To specify a different strategy for selecting availability zones override this method.

---

##### `bundlingRequired`<sup>Required</sup> <a name="bundlingRequired" id="cdk8s-aws-cdk.AwsCdkAdapater.property.bundlingRequired"></a>

```typescript
public readonly bundlingRequired: boolean;
```

- *Type:* boolean

Indicates whether the stack requires bundling or not.

---

##### `dependencies`<sup>Required</sup> <a name="dependencies" id="cdk8s-aws-cdk.AwsCdkAdapater.property.dependencies"></a>

```typescript
public readonly dependencies: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

Return the stacks this stack depends on.

---

##### `environment`<sup>Required</sup> <a name="environment" id="cdk8s-aws-cdk.AwsCdkAdapater.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The environment coordinates in which this stack is deployed.

In the form
`aws://account/region`. Use `stack.account` and `stack.region` to obtain
the specific values, no need to parse.

You can use this value to determine if two stacks are targeting the same
environment.

If either `stack.account` or `stack.region` are not concrete values (e.g.
`Aws.ACCOUNT_ID` or `Aws.REGION`) the special strings `unknown-account` and/or
`unknown-region` will be used respectively to indicate this stack is
region/account-agnostic.

---

##### `nested`<sup>Required</sup> <a name="nested" id="cdk8s-aws-cdk.AwsCdkAdapater.property.nested"></a>

```typescript
public readonly nested: boolean;
```

- *Type:* boolean

Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent.

---

##### `notificationArns`<sup>Required</sup> <a name="notificationArns" id="cdk8s-aws-cdk.AwsCdkAdapater.property.notificationArns"></a>

```typescript
public readonly notificationArns: string[];
```

- *Type:* string[]

Returns the list of notification Amazon Resource Names (ARNs) for the current stack.

---

##### `partition`<sup>Required</sup> <a name="partition" id="cdk8s-aws-cdk.AwsCdkAdapater.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

The partition in which this stack is defined.

---

##### `region`<sup>Required</sup> <a name="region" id="cdk8s-aws-cdk.AwsCdkAdapater.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS region into which this stack will be deployed (e.g. `us-west-2`).

This value is resolved according to the following rules:

1. The value provided to `env.region` when the stack is defined. This can
   either be a concrete region (e.g. `us-west-2`) or the `Aws.REGION`
   token.
3. `Aws.REGION`, which is represents the CloudFormation intrinsic reference
   `{ "Ref": "AWS::Region" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.region)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **region-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `stackId`<sup>Required</sup> <a name="stackId" id="cdk8s-aws-cdk.AwsCdkAdapater.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string

The ID of the stack.

---

*Example*

```typescript
// After resolving, looks like
'arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/51af3dc0-da77-11e4-872e-1234567db123'
```


##### `stackName`<sup>Required</sup> <a name="stackName" id="cdk8s-aws-cdk.AwsCdkAdapater.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

The concrete CloudFormation physical stack name.

This is either the name defined explicitly in the `stackName` prop or
allocated based on the stack's location in the construct tree. Stacks that
are directly defined under the app use their construct `id` as their stack
name. Stacks that are defined deeper within the tree will use a hashed naming
scheme based on the construct path to ensure uniqueness.

If you wish to obtain the deploy-time AWS::StackName intrinsic,
you can use `Aws.STACK_NAME` directly.

---

##### `synthesizer`<sup>Required</sup> <a name="synthesizer" id="cdk8s-aws-cdk.AwsCdkAdapater.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer

Synthesis method for this stack.

---

##### `tags`<sup>Required</sup> <a name="tags" id="cdk8s-aws-cdk.AwsCdkAdapater.property.tags"></a>

```typescript
public readonly tags: TagManager;
```

- *Type:* aws-cdk-lib.TagManager

Tags to be applied to the stack.

---

##### `templateFile`<sup>Required</sup> <a name="templateFile" id="cdk8s-aws-cdk.AwsCdkAdapater.property.templateFile"></a>

```typescript
public readonly templateFile: string;
```

- *Type:* string

The name of the CloudFormation template file emitted to the output directory during synthesis.

Example value: `MyStack.template.json`

---

##### `templateOptions`<sup>Required</sup> <a name="templateOptions" id="cdk8s-aws-cdk.AwsCdkAdapater.property.templateOptions"></a>

```typescript
public readonly templateOptions: ITemplateOptions;
```

- *Type:* aws-cdk-lib.ITemplateOptions

Options for CloudFormation template (like version, transform, description).

---

##### `urlSuffix`<sup>Required</sup> <a name="urlSuffix" id="cdk8s-aws-cdk.AwsCdkAdapater.property.urlSuffix"></a>

```typescript
public readonly urlSuffix: string;
```

- *Type:* string

The Amazon domain suffix for the region in which this stack is defined.

---

##### `nestedStackParent`<sup>Optional</sup> <a name="nestedStackParent" id="cdk8s-aws-cdk.AwsCdkAdapater.property.nestedStackParent"></a>

```typescript
public readonly nestedStackParent: Stack;
```

- *Type:* aws-cdk-lib.Stack

If this is a nested stack, returns it's parent stack.

---

##### `nestedStackResource`<sup>Optional</sup> <a name="nestedStackResource" id="cdk8s-aws-cdk.AwsCdkAdapater.property.nestedStackResource"></a>

```typescript
public readonly nestedStackResource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource.

`undefined` for top-level (non-nested) stacks.

---

##### `terminationProtection`<sup>Required</sup> <a name="terminationProtection" id="cdk8s-aws-cdk.AwsCdkAdapater.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean

Whether termination protection is enabled for this stack.

---


### Chart <a name="Chart" id="cdk8s-aws-cdk.Chart"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.Chart.Initializer"></a>

```typescript
import { Chart } from 'cdk8s-aws-cdk'

new Chart(scope: Construct, id: string, props?: ChartProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.Chart.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.Chart.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.Chart.Initializer.parameter.props">props</a></code> | <code>cdk8s.ChartProps</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk8s-aws-cdk.Chart.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk8s-aws-cdk.Chart.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk8s-aws-cdk.Chart.Initializer.parameter.props"></a>

- *Type:* cdk8s.ChartProps

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.Chart.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk8s-aws-cdk.Chart.addDependency">addDependency</a></code> | Create a dependency between this Chart and other constructs. |
| <code><a href="#cdk8s-aws-cdk.Chart.generateObjectName">generateObjectName</a></code> | Generates a app-unique name for an object given it's construct node path. |
| <code><a href="#cdk8s-aws-cdk.Chart.toJson">toJson</a></code> | Renders this chart to a set of Kubernetes JSON resources. |

---

##### `toString` <a name="toString" id="cdk8s-aws-cdk.Chart.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="cdk8s-aws-cdk.Chart.addDependency"></a>

```typescript
public addDependency(dependencies: IConstruct): void
```

Create a dependency between this Chart and other constructs.

These can be other ApiObjects, Charts, or custom.

###### `dependencies`<sup>Required</sup> <a name="dependencies" id="cdk8s-aws-cdk.Chart.addDependency.parameter.dependencies"></a>

- *Type:* constructs.IConstruct

the dependencies to add.

---

##### `generateObjectName` <a name="generateObjectName" id="cdk8s-aws-cdk.Chart.generateObjectName"></a>

```typescript
public generateObjectName(apiObject: ApiObject): string
```

Generates a app-unique name for an object given it's construct node path.

Different resource types may have different constraints on names
(`metadata.name`). The previous version of the name generator was
compatible with DNS_SUBDOMAIN but not with DNS_LABEL.

For example, `Deployment` names must comply with DNS_SUBDOMAIN while
`Service` names must comply with DNS_LABEL.

Since there is no formal specification for this, the default name
generation scheme for kubernetes objects in cdk8s was changed to DNS_LABEL,
since it’s the common denominator for all kubernetes resources
(supposedly).

You can override this method if you wish to customize object names at the
chart level.

###### `apiObject`<sup>Required</sup> <a name="apiObject" id="cdk8s-aws-cdk.Chart.generateObjectName.parameter.apiObject"></a>

- *Type:* cdk8s.ApiObject

The API object to generate a name for.

---

##### `toJson` <a name="toJson" id="cdk8s-aws-cdk.Chart.toJson"></a>

```typescript
public toJson(): any[]
```

Renders this chart to a set of Kubernetes JSON resources.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.Chart.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk8s-aws-cdk.Chart.isChart">isChart</a></code> | Return whether the given object is a Chart. |
| <code><a href="#cdk8s-aws-cdk.Chart.of">of</a></code> | Finds the chart in which a node is defined. |

---

##### `isConstruct` <a name="isConstruct" id="cdk8s-aws-cdk.Chart.isConstruct"></a>

```typescript
import { Chart } from 'cdk8s-aws-cdk'

Chart.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk8s-aws-cdk.Chart.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isChart` <a name="isChart" id="cdk8s-aws-cdk.Chart.isChart"></a>

```typescript
import { Chart } from 'cdk8s-aws-cdk'

Chart.isChart(x: any)
```

Return whether the given object is a Chart.

We do attribute detection since we can't reliably use 'instanceof'.

###### `x`<sup>Required</sup> <a name="x" id="cdk8s-aws-cdk.Chart.isChart.parameter.x"></a>

- *Type:* any

---

##### `of` <a name="of" id="cdk8s-aws-cdk.Chart.of"></a>

```typescript
import { Chart } from 'cdk8s-aws-cdk'

Chart.of(c: IConstruct)
```

Finds the chart in which a node is defined.

###### `c`<sup>Required</sup> <a name="c" id="cdk8s-aws-cdk.Chart.of.parameter.c"></a>

- *Type:* constructs.IConstruct

a construct node.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.Chart.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk8s-aws-cdk.Chart.property.apiObjects">apiObjects</a></code> | <code>cdk8s.ApiObject[]</code> | Returns all the included API objects. |
| <code><a href="#cdk8s-aws-cdk.Chart.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | Labels applied to all resources in this chart. |
| <code><a href="#cdk8s-aws-cdk.Chart.property.namespace">namespace</a></code> | <code>string</code> | The default namespace for all objects in this chart. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk8s-aws-cdk.Chart.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `apiObjects`<sup>Required</sup> <a name="apiObjects" id="cdk8s-aws-cdk.Chart.property.apiObjects"></a>

```typescript
public readonly apiObjects: ApiObject[];
```

- *Type:* cdk8s.ApiObject[]

Returns all the included API objects.

---

##### `labels`<sup>Required</sup> <a name="labels" id="cdk8s-aws-cdk.Chart.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Labels applied to all resources in this chart.

This is an immutable copy.

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="cdk8s-aws-cdk.Chart.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string

The default namespace for all objects in this chart.

---


## Structs <a name="Structs" id="Structs"></a>

### AwsCdkAdapterProps <a name="AwsCdkAdapterProps" id="cdk8s-aws-cdk.AwsCdkAdapterProps"></a>

#### Initializer <a name="Initializer" id="cdk8s-aws-cdk.AwsCdkAdapterProps.Initializer"></a>

```typescript
import { AwsCdkAdapterProps } from 'cdk8s-aws-cdk'

const awsCdkAdapterProps: AwsCdkAdapterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.analyticsReporting">analyticsReporting</a></code> | <code>boolean</code> | Include runtime versioning information in this Stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.crossRegionReferences">crossRegionReferences</a></code> | <code>boolean</code> | Enable this flag to allow native cross region stack references. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.description">description</a></code> | <code>string</code> | A description of the stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.env">env</a></code> | <code>aws-cdk-lib.Environment</code> | The AWS environment (account/region) where this stack will be deployed. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.PermissionsBoundary</code> | Options for applying a permissions boundary to all IAM Roles and Users created within this Stage. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.stackName">stackName</a></code> | <code>string</code> | Name to deploy the stack with. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.suppressTemplateIndentation">suppressTemplateIndentation</a></code> | <code>boolean</code> | Enable this flag to suppress indentation in generated CloudFormation templates. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method to use while deploying this stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Stack tags that will be applied to all the taggable resources and the stack itself. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether to enable termination protection for this stack. |
| <code><a href="#cdk8s-aws-cdk.AwsCdkAdapterProps.property.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `analyticsReporting`<sup>Optional</sup> <a name="analyticsReporting" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.analyticsReporting"></a>

```typescript
public readonly analyticsReporting: boolean;
```

- *Type:* boolean
- *Default:* `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

---

##### `crossRegionReferences`<sup>Optional</sup> <a name="crossRegionReferences" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.crossRegionReferences"></a>

```typescript
public readonly crossRegionReferences: boolean;
```

- *Type:* boolean
- *Default:* false

Enable this flag to allow native cross region stack references.

Enabling this will create a CloudFormation custom resource
in both the producing stack and consuming stack in order to perform the export/import

This feature is currently experimental

---

##### `description`<sup>Optional</sup> <a name="description" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the stack.

---

##### `env`<sup>Optional</sup> <a name="env" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* aws-cdk-lib.Environment
- *Default:* The environment of the containing `Stage` if available, otherwise create the stack will be environment-agnostic.

The AWS environment (account/region) where this stack will be deployed.

Set the `region`/`account` fields of `env` to either a concrete value to
select the indicated environment (recommended for production stacks), or to
the values of environment variables
`CDK_DEFAULT_REGION`/`CDK_DEFAULT_ACCOUNT` to let the target environment
depend on the AWS credentials/configuration that the CDK CLI is executed
under (recommended for development stacks).

If the `Stack` is instantiated inside a `Stage`, any undefined
`region`/`account` fields from `env` will default to the same field on the
encompassing `Stage`, if configured there.

If either `region` or `account` are not set nor inherited from `Stage`, the
Stack will be considered "*environment-agnostic*"". Environment-agnostic
stacks can be deployed to any environment but may not be able to take
advantage of all features of the CDK. For example, they will not be able to
use environmental context lookups such as `ec2.Vpc.fromLookup` and will not
automatically translate Service Principals to the right format based on the
environment's AWS partition, and other such enhancements.

---

*Example*

```typescript
// Use a concrete account and region to deploy this stack to:
// `.account` and `.region` will simply return these values.
new Stack(app, 'Stack1', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  },
});

// Use the CLI's current credentials to determine the target environment:
// `.account` and `.region` will reflect the account+region the CLI
// is configured to use (based on the user CLI credentials)
new Stack(app, 'Stack2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

// Define multiple stacks stage associated with an environment
const myStage = new Stage(app, 'MyStage', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  }
});

// both of these stacks will use the stage's account/region:
// `.account` and `.region` will resolve to the concrete values as above
new MyStack(myStage, 'Stack1');
new YourStack(myStage, 'Stack2');

// Define an environment-agnostic stack:
// `.account` and `.region` will resolve to `{ "Ref": "AWS::AccountId" }` and `{ "Ref": "AWS::Region" }` respectively.
// which will only resolve to actual values by CloudFormation during deployment.
new MyStack(app, 'Stack1');
```


##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: PermissionsBoundary;
```

- *Type:* aws-cdk-lib.PermissionsBoundary
- *Default:* no permissions boundary is applied

Options for applying a permissions boundary to all IAM Roles and Users created within this Stage.

---

##### `stackName`<sup>Optional</sup> <a name="stackName" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string
- *Default:* Derived from construct path.

Name to deploy the stack with.

---

##### `suppressTemplateIndentation`<sup>Optional</sup> <a name="suppressTemplateIndentation" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.suppressTemplateIndentation"></a>

```typescript
public readonly suppressTemplateIndentation: boolean;
```

- *Type:* boolean
- *Default:* the value of `@aws-cdk/core:suppressTemplateIndentation`, or `false` if that is not set.

Enable this flag to suppress indentation in generated CloudFormation templates.

If not specified, the value of the `@aws-cdk/core:suppressTemplateIndentation`
context key will be used. If that is not specified, then the
default value `false` will be used.

---

##### `synthesizer`<sup>Optional</sup> <a name="synthesizer" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer
- *Default:* The synthesizer specified on `App`, or `DefaultStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

The Stack Synthesizer controls aspects of synthesis and deployment,
like how assets are referenced and what IAM roles to use. For more
information, see the README of the main CDK package.

If not specified, the `defaultStackSynthesizer` from `App` will be used.
If that is not specified, `DefaultStackSynthesizer` is used if
`@aws-cdk/core:newStyleStackSynthesis` is set to `true` or the CDK major
version is v2. In CDK v1 `LegacyStackSynthesizer` is the default if no
other synthesizer is specified.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

Stack tags that will be applied to all the taggable resources and the stack itself.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to enable termination protection for this stack.

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.AwsCdkAdapterProps.property.chart"></a>

```typescript
public readonly chart: Chart;
```

- *Type:* cdk8s.Chart

---

### CloudFormationMapperExportMapping <a name="CloudFormationMapperExportMapping" id="cdk8s-aws-cdk.CloudFormationMapperExportMapping"></a>

#### Initializer <a name="Initializer" id="cdk8s-aws-cdk.CloudFormationMapperExportMapping.Initializer"></a>

```typescript
import { CloudFormationMapperExportMapping } from 'cdk8s-aws-cdk'

const cloudFormationMapperExportMapping: CloudFormationMapperExportMapping = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping.property.attribute">attribute</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping.property.field">field</a></code> | <code>string</code> | *No description.* |

---

##### `attribute`<sup>Required</sup> <a name="attribute" id="cdk8s-aws-cdk.CloudFormationMapperExportMapping.property.attribute"></a>

```typescript
public readonly attribute: string;
```

- *Type:* string

---

##### `field`<sup>Required</sup> <a name="field" id="cdk8s-aws-cdk.CloudFormationMapperExportMapping.property.field"></a>

```typescript
public readonly field: string;
```

- *Type:* string

---

### CloudFormationMapperNameMapping <a name="CloudFormationMapperNameMapping" id="cdk8s-aws-cdk.CloudFormationMapperNameMapping"></a>

#### Initializer <a name="Initializer" id="cdk8s-aws-cdk.CloudFormationMapperNameMapping.Initializer"></a>

```typescript
import { CloudFormationMapperNameMapping } from 'cdk8s-aws-cdk'

const cloudFormationMapperNameMapping: CloudFormationMapperNameMapping = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping.property.cfnProperty">cfnProperty</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping.property.specPath">specPath</a></code> | <code>string</code> | *No description.* |

---

##### `cfnProperty`<sup>Required</sup> <a name="cfnProperty" id="cdk8s-aws-cdk.CloudFormationMapperNameMapping.property.cfnProperty"></a>

```typescript
public readonly cfnProperty: string;
```

- *Type:* string

---

##### `specPath`<sup>Required</sup> <a name="specPath" id="cdk8s-aws-cdk.CloudFormationMapperNameMapping.property.specPath"></a>

```typescript
public readonly specPath: string;
```

- *Type:* string

---

## Classes <a name="Classes" id="Classes"></a>

### CloudFormationResourceMapper <a name="CloudFormationResourceMapper" id="cdk8s-aws-cdk.CloudFormationResourceMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.CloudFormationResourceMapper.Initializer"></a>

```typescript
import { CloudFormationResourceMapper } from 'cdk8s-aws-cdk'

new CloudFormationResourceMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.CloudFormationResourceMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.CloudFormationResourceMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.CloudFormationResourceMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.CloudFormationResourceMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.CloudFormationResourceMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.CloudFormationResourceMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.CloudFormationResourceMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.CloudFormationResourceMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.CloudFormationResourceMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.CloudFormationResourceMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.CloudFormationResourceMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.CloudFormationResourceMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.CloudFormationResourceMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.CloudFormationResourceMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### Ec2SecurityGroupMapper <a name="Ec2SecurityGroupMapper" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.Initializer"></a>

```typescript
import { Ec2SecurityGroupMapper } from 'cdk8s-aws-cdk'

new Ec2SecurityGroupMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.Ec2SecurityGroupMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.Ec2SecurityGroupMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.Ec2SecurityGroupMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### IamPolicyMapper <a name="IamPolicyMapper" id="cdk8s-aws-cdk.IamPolicyMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.IamPolicyMapper.Initializer"></a>

```typescript
import { IamPolicyMapper } from 'cdk8s-aws-cdk'

new IamPolicyMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.IamPolicyMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.IamPolicyMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.IamPolicyMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.IamPolicyMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.IamPolicyMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.IamPolicyMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.IamPolicyMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.IamPolicyMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.IamPolicyMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.IamPolicyMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.IamPolicyMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.IamPolicyMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.IamPolicyMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.IamPolicyMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### IamRoleMapper <a name="IamRoleMapper" id="cdk8s-aws-cdk.IamRoleMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.IamRoleMapper.Initializer"></a>

```typescript
import { IamRoleMapper } from 'cdk8s-aws-cdk'

new IamRoleMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.IamRoleMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.IamRoleMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.IamRoleMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.IamRoleMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.IamRoleMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.IamRoleMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.IamRoleMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.IamRoleMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.IamRoleMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.IamRoleMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.IamRoleMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.IamRoleMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.IamRoleMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.IamRoleMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### LambdaFunctionMapper <a name="LambdaFunctionMapper" id="cdk8s-aws-cdk.LambdaFunctionMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.LambdaFunctionMapper.Initializer"></a>

```typescript
import { LambdaFunctionMapper } from 'cdk8s-aws-cdk'

new LambdaFunctionMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.LambdaFunctionMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.LambdaFunctionMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.LambdaFunctionMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.LambdaFunctionMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.LambdaFunctionMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.LambdaFunctionMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.LambdaFunctionMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.LambdaFunctionMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.LambdaFunctionMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.LambdaFunctionMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.LambdaFunctionMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.LambdaFunctionMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.LambdaFunctionMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.LambdaFunctionMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### RdsDBInstanceMapper <a name="RdsDBInstanceMapper" id="cdk8s-aws-cdk.RdsDBInstanceMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.RdsDBInstanceMapper.Initializer"></a>

```typescript
import { RdsDBInstanceMapper } from 'cdk8s-aws-cdk'

new RdsDBInstanceMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.RdsDBInstanceMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.RdsDBInstanceMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.RdsDBInstanceMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.RdsDBInstanceMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.RdsDBInstanceMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.RdsDBInstanceMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.RdsDBInstanceMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.RdsDBInstanceMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.RdsDBInstanceMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.RdsDBInstanceMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.RdsDBInstanceMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.RdsDBInstanceMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.RdsDBInstanceMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.RdsDBInstanceMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### RdsDBSubnetGroup <a name="RdsDBSubnetGroup" id="cdk8s-aws-cdk.RdsDBSubnetGroup"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.RdsDBSubnetGroup.Initializer"></a>

```typescript
import { RdsDBSubnetGroup } from 'cdk8s-aws-cdk'

new RdsDBSubnetGroup(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.RdsDBSubnetGroup.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.RdsDBSubnetGroup.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.RdsDBSubnetGroup.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.RdsDBSubnetGroup.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.RdsDBSubnetGroup.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.RdsDBSubnetGroup.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.RdsDBSubnetGroup.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.RdsDBSubnetGroup.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.RdsDBSubnetGroup.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.RdsDBSubnetGroup.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.RdsDBSubnetGroup.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.RdsDBSubnetGroup.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.RdsDBSubnetGroup.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.RdsDBSubnetGroup.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---


### S3BucketMapper <a name="S3BucketMapper" id="cdk8s-aws-cdk.S3BucketMapper"></a>

#### Initializers <a name="Initializers" id="cdk8s-aws-cdk.S3BucketMapper.Initializer"></a>

```typescript
import { S3BucketMapper } from 'cdk8s-aws-cdk'

new S3BucketMapper(chart: Chart)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.S3BucketMapper.Initializer.parameter.chart">chart</a></code> | <code>cdk8s.Chart</code> | *No description.* |

---

##### `chart`<sup>Required</sup> <a name="chart" id="cdk8s-aws-cdk.S3BucketMapper.Initializer.parameter.chart"></a>

- *Type:* cdk8s.Chart

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.S3BucketMapper.map">map</a></code> | *No description.* |

---

##### `map` <a name="map" id="cdk8s-aws-cdk.S3BucketMapper.map"></a>

```typescript
public map(logicalId: string, cfnProperties: any): ApiObject
```

###### `logicalId`<sup>Required</sup> <a name="logicalId" id="cdk8s-aws-cdk.S3BucketMapper.map.parameter.logicalId"></a>

- *Type:* string

---

###### `cfnProperties`<sup>Required</sup> <a name="cfnProperties" id="cdk8s-aws-cdk.S3BucketMapper.map.parameter.cfnProperties"></a>

- *Type:* any

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-aws-cdk.S3BucketMapper.property.exportMappings">exportMappings</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]</code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.S3BucketMapper.property.nameMapping">nameMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.S3BucketMapper.property.refMapping">refMapping</a></code> | <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.S3BucketMapper.property.type">type</a></code> | <code>string</code> | *No description.* |

---

##### `exportMappings`<sup>Required</sup> <a name="exportMappings" id="cdk8s-aws-cdk.S3BucketMapper.property.exportMappings"></a>

```typescript
public readonly exportMappings: CloudFormationMapperExportMapping[];
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperExportMapping">CloudFormationMapperExportMapping</a>[]

---

##### `nameMapping`<sup>Required</sup> <a name="nameMapping" id="cdk8s-aws-cdk.S3BucketMapper.property.nameMapping"></a>

```typescript
public readonly nameMapping: CloudFormationMapperNameMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperNameMapping">CloudFormationMapperNameMapping</a>

---

##### `refMapping`<sup>Required</sup> <a name="refMapping" id="cdk8s-aws-cdk.S3BucketMapper.property.refMapping"></a>

```typescript
public readonly refMapping: CloudFormationMapperRefMapping;
```

- *Type:* <a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping">CloudFormationMapperRefMapping</a>

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-aws-cdk.S3BucketMapper.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

---



## Enums <a name="Enums" id="Enums"></a>

### CloudFormationMapperRefMapping <a name="CloudFormationMapperRefMapping" id="cdk8s-aws-cdk.CloudFormationMapperRefMapping"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping.NAME">NAME</a></code> | *No description.* |
| <code><a href="#cdk8s-aws-cdk.CloudFormationMapperRefMapping.ARN">ARN</a></code> | *No description.* |

---

##### `NAME` <a name="NAME" id="cdk8s-aws-cdk.CloudFormationMapperRefMapping.NAME"></a>

---


##### `ARN` <a name="ARN" id="cdk8s-aws-cdk.CloudFormationMapperRefMapping.ARN"></a>

---

