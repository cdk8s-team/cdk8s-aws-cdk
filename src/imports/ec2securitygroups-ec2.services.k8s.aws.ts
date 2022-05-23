// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 * SecurityGroup is the Schema for the SecurityGroups API
 *
 * @schema SecurityGroup
 */
export class SecurityGroup extends ApiObject {
  /**
   * Returns the apiVersion and kind for "SecurityGroup"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'ec2.services.k8s.aws/v1alpha1',
    kind: 'SecurityGroup',
  }

  /**
   * Renders a Kubernetes manifest for "SecurityGroup".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: SecurityGroupProps = {}): any {
    return {
      ...SecurityGroup.GVK,
      ...toJson_SecurityGroupProps(props),
    };
  }

  /**
   * Defines a "SecurityGroup" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: SecurityGroupProps = {}) {
    super(scope, id, {
      ...SecurityGroup.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...SecurityGroup.GVK,
      ...toJson_SecurityGroupProps(resolved),
    };
  }
}

/**
 * SecurityGroup is the Schema for the SecurityGroups API
 *
 * @schema SecurityGroup
 */
export interface SecurityGroupProps {
  /**
   * @schema SecurityGroup#metadata
   */
  readonly metadata?: ApiObjectMetadata;

  /**
   * SecurityGroupSpec defines the desired state of SecurityGroup.
   * Describes a security group.
   *
   * @schema SecurityGroup#spec
   */
  readonly spec?: SecurityGroupSpec;

}

/**
 * Converts an object of type 'SecurityGroupProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_SecurityGroupProps(obj: SecurityGroupProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_SecurityGroupSpec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * SecurityGroupSpec defines the desired state of SecurityGroup.
 * Describes a security group.
 *
 * @schema SecurityGroupSpec
 */
export interface SecurityGroupSpec {
  /**
   * A description for the security group. This is informational only.
   * Constraints: Up to 255 characters in length
   * Constraints for EC2-Classic: ASCII characters
   * Constraints for EC2-VPC: a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=&;{}!$*
   *
   * @schema SecurityGroupSpec#description
   */
  readonly description: string;

  /**
   * The name of the security group.
   * Constraints: Up to 255 characters in length. Cannot start with sg-.
   * Constraints for EC2-Classic: ASCII characters
   * Constraints for EC2-VPC: a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=&;{}!$*
   *
   * @schema SecurityGroupSpec#name
   */
  readonly name: string;

  /**
   * The tags to assign to the security group.
   *
   * @schema SecurityGroupSpec#tagSpecifications
   */
  readonly tagSpecifications?: SecurityGroupSpecTagSpecifications[];

  /**
   * [EC2-VPC] The ID of the VPC. Required for EC2-VPC.
   *
   * @schema SecurityGroupSpec#vpcID
   */
  readonly vpcId?: string;

  /**
   * AWSResourceReferenceWrapper provides a wrapper around *AWSResourceReference type to provide more user friendly syntax for references using 'from' field Ex: APIIDRef:   from:     name: my-api
   *
   * @schema SecurityGroupSpec#vpcRef
   */
  readonly vpcRef?: SecurityGroupSpecVpcRef;

}

/**
 * Converts an object of type 'SecurityGroupSpec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_SecurityGroupSpec(obj: SecurityGroupSpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'description': obj.description,
    'name': obj.name,
    'tagSpecifications': obj.tagSpecifications?.map(y => toJson_SecurityGroupSpecTagSpecifications(y)),
    'vpcID': obj.vpcId,
    'vpcRef': toJson_SecurityGroupSpecVpcRef(obj.vpcRef),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * The tags to apply to a resource when the resource is being created.
 *
 * @schema SecurityGroupSpecTagSpecifications
 */
export interface SecurityGroupSpecTagSpecifications {
  /**
   * @schema SecurityGroupSpecTagSpecifications#resourceType
   */
  readonly resourceType?: string;

  /**
   * @schema SecurityGroupSpecTagSpecifications#tags
   */
  readonly tags?: SecurityGroupSpecTagSpecificationsTags[];

}

/**
 * Converts an object of type 'SecurityGroupSpecTagSpecifications' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_SecurityGroupSpecTagSpecifications(obj: SecurityGroupSpecTagSpecifications | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'resourceType': obj.resourceType,
    'tags': obj.tags?.map(y => toJson_SecurityGroupSpecTagSpecificationsTags(y)),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * AWSResourceReferenceWrapper provides a wrapper around *AWSResourceReference type to provide more user friendly syntax for references using 'from' field Ex: APIIDRef:   from:     name: my-api
 *
 * @schema SecurityGroupSpecVpcRef
 */
export interface SecurityGroupSpecVpcRef {
  /**
   * AWSResourceReference provides all the values necessary to reference another k8s resource for finding the identifier(Id/ARN/Name)
   *
   * @schema SecurityGroupSpecVpcRef#from
   */
  readonly from?: SecurityGroupSpecVpcRefFrom;

}

/**
 * Converts an object of type 'SecurityGroupSpecVpcRef' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_SecurityGroupSpecVpcRef(obj: SecurityGroupSpecVpcRef | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'from': toJson_SecurityGroupSpecVpcRefFrom(obj.from),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * Describes a tag.
 *
 * @schema SecurityGroupSpecTagSpecificationsTags
 */
export interface SecurityGroupSpecTagSpecificationsTags {
  /**
   * @schema SecurityGroupSpecTagSpecificationsTags#key
   */
  readonly key?: string;

  /**
   * @schema SecurityGroupSpecTagSpecificationsTags#value
   */
  readonly value?: string;

}

/**
 * Converts an object of type 'SecurityGroupSpecTagSpecificationsTags' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_SecurityGroupSpecTagSpecificationsTags(obj: SecurityGroupSpecTagSpecificationsTags | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'key': obj.key,
    'value': obj.value,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * AWSResourceReference provides all the values necessary to reference another k8s resource for finding the identifier(Id/ARN/Name)
 *
 * @schema SecurityGroupSpecVpcRefFrom
 */
export interface SecurityGroupSpecVpcRefFrom {
  /**
   * @schema SecurityGroupSpecVpcRefFrom#name
   */
  readonly name?: string;

}

/**
 * Converts an object of type 'SecurityGroupSpecVpcRefFrom' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_SecurityGroupSpecVpcRefFrom(obj: SecurityGroupSpecVpcRefFrom | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'name': obj.name,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

