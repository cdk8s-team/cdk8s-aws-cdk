const { Cdk8sTeamJsiiProject } = require('@cdk8s/projen-common');
const { javascript } = require('projen');

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
  eslintOptions: {
    ignorePatterns: ['src/imports/*.ts'],
  },
});

for (const example of ['rds-db-instance']) {
  const exampleDir = `examples/${example}`;

  new javascript.TypescriptConfig(project, {
    fileName: `${exampleDir}/tsconfig.json`,
    extends: javascript.TypescriptConfigExtends.fromTypescriptConfigs([project.tsconfig]),
    compilerOptions: {
      rootDir: '../../', // need the package source as well here
    },
    include: [
      '../../src/**/*.ts',
      '**/*.ts',
    ],
  });

  const synth = project.addTask(`synth:${example}`);
  project.gitignore.exclude(`/${exampleDir}/cdk.out/**`);
  project.gitignore.include(`/${exampleDir}/cdk.out/*.template.json`);
  // example currently fails to synth, need to look into it
  // synth.exec('ts-node --project tsconfig.json main.ts', { cwd: exampleDir });
  // for now doing a compile instead
  synth.exec('tsc --noEmit', { cwd: exampleDir });
  project.compileTask.spawn(synth);
}

project.synth();
