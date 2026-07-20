import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const shrinkwrap = JSON.parse(
  fs.readFileSync(path.join(root, 'npm-shrinkwrap.json'), 'utf8')
);
const packages = shrinkwrap.packages;

if (!packages || typeof packages !== 'object') {
  throw new Error('Shrinkwrap has no package inventory.');
}

for (const dependency of Object.keys(sourcePackage.dependencies ?? {})) {
  if (!packages[`node_modules/${dependency}`]) {
    throw new Error(`Shrinkwrap is missing direct runtime dependency: ${dependency}`);
  }
}

let runtimePackageCount = 0;

for (const [packagePath, metadata] of Object.entries(packages)) {
  if (!packagePath.startsWith('node_modules/') || metadata.dev === true) continue;

  const installedManifest = JSON.parse(
    fs.readFileSync(path.join(root, packagePath, 'package.json'), 'utf8')
  );

  if (installedManifest.version !== metadata.version) {
    throw new Error(
      `Shrinkwrap mismatch for ${packagePath}: installed ${installedManifest.version}, recorded ${metadata.version}`
    );
  }

  runtimePackageCount += 1;
}

if (runtimePackageCount === 0) {
  throw new Error('Shrinkwrap contains no runtime packages.');
}

console.log(`Verified ${runtimePackageCount} exact runtime package versions.`);
