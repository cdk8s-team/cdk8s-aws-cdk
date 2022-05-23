// generated by cdk8s
import { ApiObject, ApiObjectMetadata, GroupVersionKind } from 'cdk8s';
import { Construct } from 'constructs';


/**
 * EventSourceMapping is the Schema for the EventSourceMappings API
 *
 * @schema EventSourceMapping
 */
export class EventSourceMapping extends ApiObject {
  /**
   * Returns the apiVersion and kind for "EventSourceMapping"
   */
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'lambda.services.k8s.aws/v1alpha1',
    kind: 'EventSourceMapping',
  };

  /**
   * Renders a Kubernetes manifest for "EventSourceMapping".
   *
   * This can be used to inline resource manifests inside other objects (e.g. as templates).
   *
   * @param props initialization props
   */
  public static manifest(props: EventSourceMappingProps = {}): any {
    return {
      ...EventSourceMapping.GVK,
      ...toJson_EventSourceMappingProps(props),
    };
  }

  /**
   * Defines a "EventSourceMapping" API object
   * @param scope the scope in which to define this object
   * @param id a scope-local name for the object
   * @param props initialization props
   */
  public constructor(scope: Construct, id: string, props: EventSourceMappingProps = {}) {
    super(scope, id, {
      ...EventSourceMapping.GVK,
      ...props,
    });
  }

  /**
   * Renders the object to Kubernetes JSON.
   */
  public toJson(): any {
    const resolved = super.toJson();

    return {
      ...EventSourceMapping.GVK,
      ...toJson_EventSourceMappingProps(resolved),
    };
  }
}

/**
 * EventSourceMapping is the Schema for the EventSourceMappings API
 *
 * @schema EventSourceMapping
 */
export interface EventSourceMappingProps {
  /**
   * @schema EventSourceMapping#metadata
   */
  readonly metadata?: ApiObjectMetadata;

  /**
   * EventSourceMappingSpec defines the desired state of EventSourceMapping.
   *
   * @schema EventSourceMapping#spec
   */
  readonly spec?: EventSourceMappingSpec;

}

/**
 * Converts an object of type 'EventSourceMappingProps' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingProps(obj: EventSourceMappingProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'metadata': obj.metadata,
    'spec': toJson_EventSourceMappingSpec(obj.spec),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * EventSourceMappingSpec defines the desired state of EventSourceMapping.
 *
 * @schema EventSourceMappingSpec
 */
export interface EventSourceMappingSpec {
  /**
   * The maximum number of records in each batch that Lambda pulls from your stream or queue and sends to your function. Lambda passes all of the records in the batch to the function in a single call, up to the payload limit for synchronous invocation (6 MB).
   * * Amazon Kinesis - Default 100. Max 10,000.
   * * Amazon DynamoDB Streams - Default 100. Max 1,000.
   * * Amazon Simple Queue Service - Default 10. For standard queues the max    is 10,000. For FIFO queues the max is 10.
   * * Amazon Managed Streaming for Apache Kafka - Default 100. Max 10,000.
   * * Self-Managed Apache Kafka - Default 100. Max 10,000.
   *
   * @schema EventSourceMappingSpec#batchSize
   */
  readonly batchSize?: number;

  /**
   * (Streams only) If the function returns an error, split the batch in two and retry.
   *
   * @schema EventSourceMappingSpec#bisectBatchOnFunctionError
   */
  readonly bisectBatchOnFunctionError?: boolean;

  /**
   * (Streams only) An Amazon SQS queue or Amazon SNS topic destination for discarded records.
   *
   * @schema EventSourceMappingSpec#destinationConfig
   */
  readonly destinationConfig?: EventSourceMappingSpecDestinationConfig;

  /**
   * When true, the event source mapping is active. When false, Lambda pauses polling and invocation.
   * Default: True
   *
   * @schema EventSourceMappingSpec#enabled
   */
  readonly enabled?: boolean;

  /**
   * The Amazon Resource Name (ARN) of the event source.
   * * Amazon Kinesis - The ARN of the data stream or a stream consumer.
   * * Amazon DynamoDB Streams - The ARN of the stream.
   * * Amazon Simple Queue Service - The ARN of the queue.
   * * Amazon Managed Streaming for Apache Kafka - The ARN of the cluster.
   *
   * @schema EventSourceMappingSpec#eventSourceARN
   */
  readonly eventSourceArn?: string;

  /**
   * The name of the Lambda function.
   * Name formats
   * * Function name - MyFunction.
   * * Function ARN - arn:aws:lambda:us-west-2:123456789012:function:MyFunction.
   * * Version or Alias ARN - arn:aws:lambda:us-west-2:123456789012:function:MyFunction:PROD.
   * * Partial ARN - 123456789012:function:MyFunction.
   * The length constraint applies only to the full ARN. If you specify only the function name, it's limited to 64 characters in length.
   *
   * @schema EventSourceMappingSpec#functionName
   */
  readonly functionName: string;

  /**
   * (Streams only) A list of current response type enums applied to the event source mapping.
   *
   * @schema EventSourceMappingSpec#functionResponseTypes
   */
  readonly functionResponseTypes?: string[];

  /**
   * (Streams and Amazon SQS standard queues) The maximum amount of time, in seconds, that Lambda spends gathering records before invoking the function.
   * Default: 0
   * Related setting: When you set BatchSize to a value greater than 10, you must set MaximumBatchingWindowInSeconds to at least 1.
   *
   * @schema EventSourceMappingSpec#maximumBatchingWindowInSeconds
   */
  readonly maximumBatchingWindowInSeconds?: number;

  /**
   * (Streams only) Discard records older than the specified age. The default value is infinite (-1).
   *
   * @schema EventSourceMappingSpec#maximumRecordAgeInSeconds
   */
  readonly maximumRecordAgeInSeconds?: number;

  /**
   * (Streams only) Discard records after the specified number of retries. The default value is infinite (-1). When set to infinite (-1), failed records will be retried until the record expires.
   *
   * @schema EventSourceMappingSpec#maximumRetryAttempts
   */
  readonly maximumRetryAttempts?: number;

  /**
   * (Streams only) The number of batches to process from each shard concurrently.
   *
   * @schema EventSourceMappingSpec#parallelizationFactor
   */
  readonly parallelizationFactor?: number;

  /**
   * (MQ) The name of the Amazon MQ broker destination queue to consume.
   *
   * @schema EventSourceMappingSpec#queues
   */
  readonly queues?: string[];

  /**
   * The Self-Managed Apache Kafka cluster to send records.
   *
   * @schema EventSourceMappingSpec#selfManagedEventSource
   */
  readonly selfManagedEventSource?: EventSourceMappingSpecSelfManagedEventSource;

  /**
   * An array of authentication protocols or VPC components required to secure your event source.
   *
   * @schema EventSourceMappingSpec#sourceAccessConfigurations
   */
  readonly sourceAccessConfigurations?: EventSourceMappingSpecSourceAccessConfigurations[];

  /**
   * The position in a stream from which to start reading. Required for Amazon Kinesis, Amazon DynamoDB, and Amazon MSK Streams sources. AT_TIMESTAMP is only supported for Amazon Kinesis streams.
   *
   * @schema EventSourceMappingSpec#startingPosition
   */
  readonly startingPosition?: string;

  /**
   * With StartingPosition set to AT_TIMESTAMP, the time from which to start reading.
   *
   * @schema EventSourceMappingSpec#startingPositionTimestamp
   */
  readonly startingPositionTimestamp?: Date;

  /**
   * The name of the Kafka topic.
   *
   * @schema EventSourceMappingSpec#topics
   */
  readonly topics?: string[];

  /**
   * (Streams only) The duration in seconds of a processing window. The range is between 1 second up to 900 seconds.
   *
   * @schema EventSourceMappingSpec#tumblingWindowInSeconds
   */
  readonly tumblingWindowInSeconds?: number;

}

/**
 * Converts an object of type 'EventSourceMappingSpec' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingSpec(obj: EventSourceMappingSpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'batchSize': obj.batchSize,
    'bisectBatchOnFunctionError': obj.bisectBatchOnFunctionError,
    'destinationConfig': toJson_EventSourceMappingSpecDestinationConfig(obj.destinationConfig),
    'enabled': obj.enabled,
    'eventSourceARN': obj.eventSourceArn,
    'functionName': obj.functionName,
    'functionResponseTypes': obj.functionResponseTypes?.map(y => y),
    'maximumBatchingWindowInSeconds': obj.maximumBatchingWindowInSeconds,
    'maximumRecordAgeInSeconds': obj.maximumRecordAgeInSeconds,
    'maximumRetryAttempts': obj.maximumRetryAttempts,
    'parallelizationFactor': obj.parallelizationFactor,
    'queues': obj.queues?.map(y => y),
    'selfManagedEventSource': toJson_EventSourceMappingSpecSelfManagedEventSource(obj.selfManagedEventSource),
    'sourceAccessConfigurations': obj.sourceAccessConfigurations?.map(y => toJson_EventSourceMappingSpecSourceAccessConfigurations(y)),
    'startingPosition': obj.startingPosition,
    'startingPositionTimestamp': obj.startingPositionTimestamp?.toISOString(),
    'topics': obj.topics?.map(y => y),
    'tumblingWindowInSeconds': obj.tumblingWindowInSeconds,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * (Streams only) An Amazon SQS queue or Amazon SNS topic destination for discarded records.
 *
 * @schema EventSourceMappingSpecDestinationConfig
 */
export interface EventSourceMappingSpecDestinationConfig {
  /**
   * A destination for events that failed processing.
   *
   * @schema EventSourceMappingSpecDestinationConfig#onFailure
   */
  readonly onFailure?: EventSourceMappingSpecDestinationConfigOnFailure;

  /**
   * A destination for events that were processed successfully.
   *
   * @schema EventSourceMappingSpecDestinationConfig#onSuccess
   */
  readonly onSuccess?: EventSourceMappingSpecDestinationConfigOnSuccess;

}

/**
 * Converts an object of type 'EventSourceMappingSpecDestinationConfig' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingSpecDestinationConfig(obj: EventSourceMappingSpecDestinationConfig | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'onFailure': toJson_EventSourceMappingSpecDestinationConfigOnFailure(obj.onFailure),
    'onSuccess': toJson_EventSourceMappingSpecDestinationConfigOnSuccess(obj.onSuccess),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * The Self-Managed Apache Kafka cluster to send records.
 *
 * @schema EventSourceMappingSpecSelfManagedEventSource
 */
export interface EventSourceMappingSpecSelfManagedEventSource {
  /**
   * @schema EventSourceMappingSpecSelfManagedEventSource#endpoints
   */
  readonly endpoints?: { [key: string]: string[] };

}

/**
 * Converts an object of type 'EventSourceMappingSpecSelfManagedEventSource' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingSpecSelfManagedEventSource(obj: EventSourceMappingSpecSelfManagedEventSource | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'endpoints': ((obj.endpoints) === undefined) ? undefined : (Object.entries(obj.endpoints).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1]?.map(y => y) }), {})),
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * To secure and define access to your event source, you can specify the authentication protocol, VPC components, or virtual host.
 *
 * @schema EventSourceMappingSpecSourceAccessConfigurations
 */
export interface EventSourceMappingSpecSourceAccessConfigurations {
  /**
   * @schema EventSourceMappingSpecSourceAccessConfigurations#type_
   */
  readonly type?: string;

  /**
   * @schema EventSourceMappingSpecSourceAccessConfigurations#uRI
   */
  readonly uRi?: string;

}

/**
 * Converts an object of type 'EventSourceMappingSpecSourceAccessConfigurations' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingSpecSourceAccessConfigurations(obj: EventSourceMappingSpecSourceAccessConfigurations | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'type_': obj.type,
    'uRI': obj.uRi,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * A destination for events that failed processing.
 *
 * @schema EventSourceMappingSpecDestinationConfigOnFailure
 */
export interface EventSourceMappingSpecDestinationConfigOnFailure {
  /**
   * @schema EventSourceMappingSpecDestinationConfigOnFailure#destination
   */
  readonly destination?: string;

}

/**
 * Converts an object of type 'EventSourceMappingSpecDestinationConfigOnFailure' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingSpecDestinationConfigOnFailure(obj: EventSourceMappingSpecDestinationConfigOnFailure | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'destination': obj.destination,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

/**
 * A destination for events that were processed successfully.
 *
 * @schema EventSourceMappingSpecDestinationConfigOnSuccess
 */
export interface EventSourceMappingSpecDestinationConfigOnSuccess {
  /**
   * @schema EventSourceMappingSpecDestinationConfigOnSuccess#destination
   */
  readonly destination?: string;

}

/**
 * Converts an object of type 'EventSourceMappingSpecDestinationConfigOnSuccess' to JSON representation.
 */
/* eslint-disable max-len, quote-props */
export function toJson_EventSourceMappingSpecDestinationConfigOnSuccess(obj: EventSourceMappingSpecDestinationConfigOnSuccess | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined; }
  const result = {
    'destination': obj.destination,
  };
  // filter undefined values
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});
}
/* eslint-enable max-len, quote-props */

