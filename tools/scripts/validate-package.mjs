import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const libraryRoot = resolve(workspaceRoot, 'libs/ngx-multi-level-push-menu');
const distributionRoot = resolve(
  workspaceRoot,
  'dist/libs/ngx-multi-level-push-menu',
);

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const rootPackage = readJson(resolve(workspaceRoot, 'package.json'));
const packageLock = readJson(resolve(workspaceRoot, 'package-lock.json'));
const sourcePackage = readJson(resolve(libraryRoot, 'package.json'));
const builtPackagePath = resolve(distributionRoot, 'package.json');

assert(
  existsSync(builtPackagePath),
  'The library must be built before validating its package.',
);

const builtPackage = readJson(builtPackagePath);
const versions = {
  root: rootPackage.version,
  lockfile: packageLock.version,
  'lockfile root': packageLock.packages?.['']?.version,
  source: sourcePackage.version,
  distribution: builtPackage.version,
};
const uniqueVersions = new Set(Object.values(versions));

assert(
  uniqueVersions.size === 1,
  `Package versions are inconsistent: ${JSON.stringify(versions)}.`,
);
assert(
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(sourcePackage.version),
  `Package version must be stable semver: ${sourcePackage.version}.`,
);
assert(
  builtPackage.name === sourcePackage.name,
  `Built package name ${builtPackage.name} does not match ${sourcePackage.name}.`,
);
assert(builtPackage.private !== true, 'The distributable package is private.');
assert(
  builtPackage.license === 'MIT',
  `Expected the MIT license, received: ${builtPackage.license}.`,
);
assert(
  builtPackage.publishConfig?.access === 'public',
  'The distributable package must explicitly use public access.',
);
assert(
  builtPackage.devDependencies === undefined,
  'The distributable package must not contain devDependencies.',
);

for (const peer of [
  '@angular/common',
  '@angular/core',
  '@angular/router',
  'rxjs',
]) {
  assert(
    typeof builtPackage.peerDependencies?.[peer] === 'string',
    `Missing required peer dependency: ${peer}.`,
  );
}

for (const requiredFile of ['README.md', 'LICENSE']) {
  assert(
    existsSync(resolve(distributionRoot, requiredFile)),
    `Missing required package file: ${requiredFile}.`,
  );
}

const rootLicense = readFileSync(resolve(workspaceRoot, 'LICENSE'), 'utf8');
const sourceLicense = readFileSync(resolve(libraryRoot, 'LICENSE'), 'utf8');
const builtLicense = readFileSync(resolve(distributionRoot, 'LICENSE'), 'utf8');
assert(
  rootLicense === sourceLicense && sourceLicense === builtLicense,
  'Root, source-package, and distributable LICENSE files must be identical.',
);

const entryPoints = [
  ['typings', builtPackage.typings],
  ['module', builtPackage.module],
  ['exports["."].types', builtPackage.exports?.['.']?.types],
  ['exports["."].default', builtPackage.exports?.['.']?.default],
];

for (const [name, relativePath] of entryPoints) {
  assert(
    typeof relativePath === 'string',
    `Missing package entry point: ${name}.`,
  );
  assert(
    existsSync(resolve(distributionRoot, relativePath)),
    `Package entry point does not exist: ${name} -> ${relativePath}.`,
  );
}

const declarations = readFileSync(
  resolve(distributionRoot, builtPackage.typings),
  'utf8',
);
assert(
  declarations.includes('@deprecated'),
  'Published declarations must retain deprecation guidance.',
);
assert(
  !declarations.includes('commands$') &&
    !declarations.includes('MultiLevelPushMenuCommand'),
  'Internal command APIs leaked into the published declarations.',
);
assert(
  !existsSync(resolve(distributionRoot, `${builtPackage.typings}.map`)),
  'Do not publish declaration maps that reference unavailable workspace sources.',
);

const tagArgumentIndex = process.argv.indexOf('--tag');
if (tagArgumentIndex !== -1) {
  const tag = process.argv[tagArgumentIndex + 1];
  assert(tag !== undefined, 'The --tag option requires a value.');
  assert(
    tag === `v${sourcePackage.version}`,
    `Release tag ${tag} does not match package version v${sourcePackage.version}.`,
  );
}

console.log(
  `Validated ${builtPackage.name}@${builtPackage.version} and all package entry points.`,
);
