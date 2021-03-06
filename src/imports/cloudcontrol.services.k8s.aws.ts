// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 * Resource is the Schema for the Resources API
 *
 * @schema Resource
 */
export class Resource extends ApiObject {
  /**
   * Returns the apiVersion and kind for "Resource"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'cloudcontrol.services.k8s.aws/v1alpha1',
    kind: 'Resource',
  };

  /**
   * Renders a Kubernetes manifest for "Resource".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: ResourceProps = {}): any {
    return {
      ...Resource.GVK,
      ...toJson_ResourceProps(props),
    };
  }

  /**
   * Defines a "Resource" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: ResourceProps = {}) {
    super(scope, id, {
      ...Resource.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...Resource.GVK,
      ...toJson_ResourceProps(resolved),
    };
  }
}

/**
 * Resource is the Schema for the Resources API
 *
 * @schema Resource
 */
export interface ResourceProps {
  /**
   * @schema Resource#metadata
   */
  readonly metadata?: ApiObjectMetadata;

  /**
   * ResourceSpec defines the desired state of Resource.
   *
   * @schema Resource#spec
   */
  readonly spec?: ResourceSpec;

}

/**
 * Converts an object of type 'ResourceProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_ResourceProps(obj: ResourceProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_ResourceSpec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * ResourceSpec defines the desired state of Resource.
 *
 * @schema ResourceSpec
 */
export interface ResourceSpec {
  /**
   * A unique identifier to ensure the idempotency of the resource request. As a best practice, specify this token to ensure idempotency, so that Amazon Web Services Cloud Control API can accurately distinguish between request retries and new resource requests. You might retry a resource request to ensure that it was successfully received.
   * A client token is valid for 36 hours once used. After that, a resource request with the same client token is treated as a new request.
   * If you do not specify a client token, one is generated for inclusion in the request.
   * For more information, see Ensuring resource operation requests are unique (https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-operations.html#resource-operations-idempotency) in the Amazon Web Services Cloud Control API User Guide.
   *
   * @schema ResourceSpec#clientToken
   */
  readonly clientToken?: string;

  /**
   * Structured data format representing the desired state of the resource, consisting of that resource's properties and their desired values.
   * Cloud Control API currently supports JSON as a structured data format.
   * Specify the desired state as one of the following:
   * * A JSON blob
   * * A local path containing the desired state in JSON data format
   * For more information, see Composing the desired state of the resource (https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-operations-create.html#resource-operations-create-desiredstate) in the Amazon Web Services Cloud Control API User Guide.
   * For more information about the properties of a specific resource, refer to the related topic for the resource in the Resource and property types reference (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) in the Amazon Web Services CloudFormation Users Guide.
   *
   * @schema ResourceSpec#desiredState
   */
  readonly desiredState: string;

  /**
   * The Amazon Resource Name (ARN) of the Identity and Access Management (IAM) for Cloud Control API to use when performing this resource operation. The role specified must have the permissions required for this operation. The necessary permissions for each event handler are defined in the handlers (https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/resource-type-schema.html#schema-properties-handlers) section of the resource type definition schema (https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/resource-type-schema.html).
   * If you do not specify a role, Cloud Control API uses a temporary session created using your Amazon Web Services user credentials.
   * For more information, see Specifying credentials (https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-operations.html#resource-operations-permissions) in the Amazon Web Services Cloud Control API User Guide.
   *
   * @schema ResourceSpec#roleARN
   */
  readonly roleArn?: string;

  /**
   * The name of the resource type.
   *
   * @schema ResourceSpec#typeName
   */
  readonly typeName: string;

  /**
   * For private resource types, the type version to use in this resource operation. If you do not specify a resource version, CloudFormation uses the default version.
   *
   * @schema ResourceSpec#typeVersionID
   */
  readonly typeVersionId?: string;

}

/**
 * Converts an object of type 'ResourceSpec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_ResourceSpec(obj: ResourceSpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'clientToken': obj.clientToken,
    'desiredState': obj.desiredState,
    'roleARN': obj.roleArn,
    'typeName': obj.typeName,
    'typeVersionID': obj.typeVersionId,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

