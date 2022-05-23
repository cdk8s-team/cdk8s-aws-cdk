import * as aws from 'aws-cdk-lib';
import * as k from 'cdk8s';
import { Construct } from 'constructs';
import * as adapter from './adapter';

export class Chart extends k.Chart {

  protected readonly adapter: adapter.AwsCdkAdapater;

  constructor(scope: Construct, id: string, props: k.ChartProps = { }) {
    super(scope, id, props);
    this.adapter = new adapter.AwsCdkAdapater(this, 'AwsCdkAdapter', { chart: this });

    // hack that allows us to inject code just before cdk8s synthesis.
    // TODO - figure out a proper hook for synthesis in cdk8s (or maybe constructs?)
    this.node.addValidation({ validate: () => this._validate() });
  }

  private _validate(): string[] {

    const cfnResources = this.node.findAll().filter(n => aws.CfnResource.isCfnResource(n)) as aws.CfnResource[];
    const apiObjects = this.node.findAll().filter(n => n instanceof k.ApiObject) as k.ApiObject[];

    // transform all cfn resources to ack resources
    this.adapter.transformResources(cfnResources);

    // transform cfn attributes to field exports
    this.adapter.transformAttributes(apiObjects);

    // hack, we need to return something...
    return [];
  }

}
