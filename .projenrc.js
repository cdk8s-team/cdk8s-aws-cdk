const { cdk } = require('projen');
const project = new cdk.JsiiProject({
  name: 'cdk8s-aws-cdk',
  author: 'Amazon Web Services',
  authorAddress: 'https://aws.amazon.com',
  defaultReleaseBranch: 'main',
  repositoryUrl: 'git@github.com:cdk8s-team/cdk8s-aws-cdk.git',
  peerDependencyOptions: {
    pinnedDevDependency: true,
  },
  devDeps: [
    'ts-node',
  ],
  deps: [
    'cdk8s-plus-24',
  ],
  peerDeps: [
    'cdk8s',
    'aws-cdk-lib',
    'constructs',
  ],
  tsconfig: {
    include: ['examples/**/*.ts'],
  },
});

for (const example of ['rds-db-instance']) {
  const exampleDir = `examples/${example}`;
  const synth = project.addTask(`synth:${example}`);
  project.gitignore.exclude(`/${exampleDir}/cdk.out/**`);
  project.gitignore.include(`/${exampleDir}/cdk.out/*.template.json`);
  synth.exec('ts-node --project ../../tsconfig.dev.json main.ts', { cwd: exampleDir });
  project.compileTask.spawn(synth);
}

project.synth();