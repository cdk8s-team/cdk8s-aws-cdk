const { Cdk8sTeamJsiiProject } = require('@cdk8s/projen-common');

const project = new Cdk8sTeamJsiiProject({
  name: 'cdk8s-aws-cdk',
  defaultReleaseBranch: 'main',
  golang: false,
  maven: false,
  nuget: false,
  pypi: false,
  peerDependencyOptions: {
    pinnedDevDependency: true,
  },
  devDeps: [
    '@cdk8s/projen-common',
    'ts-node',
  ],
  deps: [
    'cdk8s-plus-28',
  ],
  peerDeps: [
    'cdk8s',
    'aws-cdk-lib',
    'constructs',
  ],
  tsconfig: {
    include: ['examples/**/*.ts'],
  },
  eslintOptions: {
    ignorePatterns: ['src/imports/*.ts'],
  },
});

for (const example of ['rds-db-instance']) {
  const exampleDir = `examples/${example}`;
  const synth = project.addTask(`synth:${example}`);
  project.gitignore.exclude(`/${exampleDir}/cdk.out/**`);
  project.gitignore.include(`/${exampleDir}/cdk.out/*.template.json`);
  synth.exec('ts-node --project ../../tsconfig.dev.json main.ts', { cwd: exampleDir });
  // example currently fails to compile, need to look into it
  // project.compileTask.spawn(synth);
}

project.synth();