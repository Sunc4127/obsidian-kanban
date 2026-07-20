#!/usr/bin/env bash
set -euo pipefail

output_dir=${1:?Usage: scripts/build-release.sh OUTPUT_DIR}
source_ref=${SOURCE_REF:-HEAD}
temp_root=${KANBAN_BUILD_TMP_ROOT:-${RUNNER_TEMP:-/private/tmp}}

if [[ ${CI:-} == true ]]; then
  allowed_root=${RUNNER_TEMP:?RUNNER_TEMP is required in CI}
else
  allowed_root=/private/tmp
fi

if [[ ! -d $allowed_root || ! -d $temp_root || ! -d $(dirname "$output_dir") ]]; then
  echo 'Build temp root and output parent must already exist.' >&2
  exit 1
fi

allowed_root=$(cd "$allowed_root" && pwd -P)
temp_root=$(cd "$temp_root" && pwd -P)
output_parent=$(cd "$(dirname "$output_dir")" && pwd -P)
output_dir="$output_parent/$(basename "$output_dir")"

case "$temp_root/" in
  "$allowed_root/"*) ;;
  *) echo "Build temp root is outside the allowed boundary: $temp_root" >&2; exit 1 ;;
esac

case "$output_dir" in
  "$allowed_root/"*) ;;
  *) echo "Output path is outside the allowed boundary: $output_dir" >&2; exit 1 ;;
esac

repo_root=$(git rev-parse --show-toplevel)

if [[ $source_ref == HEAD && -n $(git status --porcelain) ]]; then
  echo 'Refusing to build a dirty HEAD.' >&2
  exit 1
fi

if [[ -e $output_dir ]]; then
  echo "Output path already exists: $output_dir" >&2
  exit 1
fi

work_dir=$(mktemp -d "$temp_root/obsidian-kanban-build.XXXXXX")
staged_output=''
cleanup() {
  rm -rf "$work_dir"
  if [[ -n $staged_output && -d $staged_output ]]; then
    rm -rf "$staged_output"
  fi
}
trap cleanup EXIT

source_object=$(git -C "$repo_root" rev-parse "$source_ref")
git -C "$repo_root" archive "$source_ref" | tar -x -C "$work_dir"

(
  cd "$work_dir"
  yarn install --frozen-lockfile
  yarn typecheck
  yarn lint
  yarn test
  yarn build
  yarn audit:runtime
)

staged_output=$(mktemp -d "$output_parent/.obsidian-kanban-output.XXXXXX")
for artifact in main.js manifest.json styles.css; do
  if [[ ! -f $work_dir/$artifact ]]; then
    echo "Missing build artifact: $artifact" >&2
    exit 1
  fi
  cp "$work_dir/$artifact" "$staged_output/$artifact"
done

if [[ $(find "$staged_output" -maxdepth 1 -type f | wc -l | tr -d ' ') != 3 ]]; then
  echo 'Release output must contain exactly three files.' >&2
  exit 1
fi

mv "$staged_output" "$output_dir"
staged_output=''

echo "SOURCE_OBJECT=$source_object"
(
  cd "$output_dir"
  shasum -a 256 main.js manifest.json styles.css
)
