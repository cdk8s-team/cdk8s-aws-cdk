import * as aws from 'aws-cdk-lib';
import * as k from 'cdk8s';
import { Construct } from 'constructs';
import * as adapter from './adapter';

const STACK_SYMBOL = Symbol.for('@aws-cdk/core.Stack');

export class Chart extends k.Chart {

  protected readonly adapter: adapter.AwsCdkAdapater;

  constructor(scope: Construct, id: string, props: k.ChartProps = { }) {
    super(scope, id, props);
    this.adapter = new adapter.AwsCdkAdapater(this, 'AwsCdkAdapter', { chart: this });
    this._inheritStack();

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

  /**
   * Monkey patches the chart to also inherit from an AWS CDK stack.
   * This makes it so the chart can be passed as a scope of AWS CDK constructs.
   */
  private _inheritStack() {
    Object.defineProperty(this, STACK_SYMBOL, { value: true });
    const stackMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(this.adapter)));
    const adapterProperties = Object.getOwnPropertyNames(this.adapter);
    for (const p of [...stackMethods, ...adapterProperties]) {

      if (['constructor', 'node'].includes(p)) {
        continue;
      };

      const v = (this.adapter as any)[p];

      if (typeof(v) === 'function') {
        // this is...adventurous? yeah...
        const n = new Function('...args', `return this.adapter.${p}(...args);`);
        Object.defineProperty(this, p, { value: n });
      } else {
        Object.defineProperty(this, p, { value: v });
      }
    }
  }

}

// function getAllProperties(adp: adapter.AwsCdkAdapater) {

//   let properties = new Set();
//   let currentObj = adp;
//   do {
//     Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
//   } while ((currentObj = Object.getPrototypeOf(currentObj)));
//   return properties.keys();

// }
