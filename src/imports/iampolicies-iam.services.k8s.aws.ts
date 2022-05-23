// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 * Policy is the Schema for the Policies API
 *
 * @schema Policy
 */
export class Policy extends ApiObject {
  /**
   * Returns the apiVersion and kind for "Policy"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'iam.services.k8s.aws/v1alpha1',
    kind: 'Policy',
  }

  /**
   * Renders a Kubernetes manifest for "Policy".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: PolicyProps = {}): any {
    return {
      ...Policy.GVK,
      ...toJson_PolicyProps(props),
    };
  }

  /**
   * Defines a "Policy" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: PolicyProps = {}) {
    super(scope, id, {
      ...Policy.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...Policy.GVK,
      ...toJson_PolicyProps(resolved),
    };
  }
}

/**
 * Policy is the Schema for the Policies API
 *
 * @schema Policy
 */
export interface PolicyProps {
  /**
   * @schema Policy#metadata
   */
  readonly metadata?: ApiObjectMetadata;

  /**
   * PolicySpec defines the desired state of Policy.
   * Contains information about a managed policy.
   * This data type is used as a response element in the CreatePolicy, GetPolicy, and ListPolicies operations.
   * For more information about managed policies, refer to Managed policies and inline policies (https://docs.aws.amazon.com/IAM/latest/UserGuide/policies-managed-vs-inline.html) in the IAM User Guide.
   *
   * @schema Policy#spec
   */
  readonly spec?: PolicySpec;

}

/**
 * Converts an object of type 'PolicyProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_PolicyProps(obj: PolicyProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_PolicySpec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * PolicySpec defines the desired state of Policy.
 * Contains information about a managed policy.
 * This data type is used as a response element in the CreatePolicy, GetPolicy, and ListPolicies operations.
 * For more information about managed policies, refer to Managed policies and inline policies (https://docs.aws.amazon.com/IAM/latest/UserGuide/policies-managed-vs-inline.html) in the IAM User Guide.
 *
 * @schema PolicySpec
 */
export interface PolicySpec {
  /**
   * A friendly description of the policy.
   * Typically used to store information about the permissions defined in the policy. For example, "Grants access to production DynamoDB tables."
   * The policy description is immutable. After a value is assigned, it cannot be changed.
   *
   * @schema PolicySpec#description
   */
  readonly description?: string;

  /**
   * The friendly name of the policy.
   * IAM user, group, role, and policy names must be unique within the account. Names are not distinguished by case. For example, you cannot create resources named both "MyResource" and "myresource".
   *
   * @schema PolicySpec#name
   */
  readonly name: string;

  /**
   * The path for the policy.
   * For more information about paths, see IAM identifiers (https://docs.aws.amazon.com/IAM/latest/UserGuide/Using_Identifiers.html) in the IAM User Guide.
   * This parameter is optional. If it is not included, it defaults to a slash (/).
   * This parameter allows (through its regex pattern (http://wikipedia.org/wiki/regex)) a string of characters consisting of either a forward slash (/) by itself or a string that must begin and end with forward slashes. In addition, it can contain any ASCII character from the ! (\u0021) through the DEL character (\u007F), including most punctuation characters, digits, and upper and lowercased letters.
   * You cannot use an asterisk (*) in the path name.
   *
   * @schema PolicySpec#path
   */
  readonly path?: string;

  /**
   * The JSON policy document that you want to use as the content for the new policy.
   * You must provide policies in JSON format in IAM. However, for CloudFormation templates formatted in YAML, you can provide the policy in JSON or YAML format. CloudFormation always converts a YAML policy to JSON format before submitting it to IAM.
   * The maximum length of the policy document that you can pass in this operation, including whitespace, is listed below. To view the maximum character counts of a managed policy with no whitespaces, see IAM and STS character quotas (https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html#reference_iam-quotas-entity-length).
   * To learn more about JSON policy grammar, see Grammar of the IAM JSON policy language (https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_grammar.html) in the IAM User Guide.
   * The regex pattern (http://wikipedia.org/wiki/regex) used to validate this parameter is a string of characters consisting of the following:
   * * Any printable ASCII character ranging from the space character (\u0020)    through the end of the ASCII character range
   * * The printable characters in the Basic Latin and Latin-1 Supplement character    set (through \u00FF)
   * * The special characters tab (\u0009), line feed (\u000A), and carriage    return (\u000D)
   *
   * @schema PolicySpec#policyDocument
   */
  readonly policyDocument: string;

  /**
   * A list of tags that you want to attach to the new IAM customer managed policy. Each tag consists of a key name and an associated value. For more information about tagging, see Tagging IAM resources (https://docs.aws.amazon.com/IAM/latest/UserGuide/id_tags.html) in the IAM User Guide.
   * If any one of the tags is invalid or if you exceed the allowed maximum number of tags, then the entire request fails and the resource is not created.
   *
   * @schema PolicySpec#tags
   */
  readonly tags?: PolicySpecTags[];

}

/**
 * Converts an object of type 'PolicySpec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_PolicySpec(obj: PolicySpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'description': obj.description,
    'name': obj.name,
    'path': obj.path,
    'policyDocument': obj.policyDocument,
    'tags': obj.tags?.map(y => toJson_PolicySpecTags(y)),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * A structure that represents user-provided metadata that can be associated with an IAM resource. For more information about tagging, see Tagging IAM resources (https://docs.aws.amazon.com/IAM/latest/UserGuide/id_tags.html) in the IAM User Guide.
 *
 * @schema PolicySpecTags
 */
export interface PolicySpecTags {
  /**
   * @schema PolicySpecTags#key
   */
  readonly key?: string;

  /**
   * @schema PolicySpecTags#value
   */
  readonly value?: string;

}

/**
 * Converts an object of type 'PolicySpecTags' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_PolicySpecTags(obj: PolicySpecTags | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'key': obj.key,
    'value': obj.value,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

