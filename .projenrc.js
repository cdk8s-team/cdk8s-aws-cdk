const { cdk } = require('projen');
const project = new cdk.JsiiProject({
  name: '@cdk8s/aws-cdk',
  author: 'Amazon Web Services',
  authorAddress: 'https://aws.amazon.com',
  defaultReleaseBranch: 'main',
  repositoryUrl: 'git@github.com:cdk8s-team/cdk8s-aws-cdk.git',
  peerDependencyOptions: {
    pinnedDevDependency: true,
  },
  deps: [
    'cdk8s-plus-24',
  ],
  peerDeps: [
    'cdk8s',
    'aws-cdk-lib',
    'constructs',
  ],
});
project.synth();