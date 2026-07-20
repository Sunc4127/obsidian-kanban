#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d node_modules ]]; then
  echo 'Runtime audit requires the frozen Yarn install tree.' >&2
  exit 1
fi

if [[ -e package-lock.json || -e npm-shrinkwrap.json ]]; then
  echo 'Refusing to overwrite an existing npm lockfile.' >&2
  exit 1
fi

# npm shrinkwrap records the versions already installed by the preceding
# frozen Yarn install. It is disposable because the whole build export is
# removed after validation.
npm shrinkwrap --ignore-scripts --legacy-peer-deps
node scripts/verify-runtime-shrinkwrap.mjs
npm audit --omit=dev --audit-level=high
