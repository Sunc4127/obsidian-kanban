import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
describe('release build path boundary', () => {
  it('rejects an output path outside the trusted temp root before building', () => {
    const forbidden = path.join(path.parse(repoRoot).root, 'obsidian-kanban-forbidden');
    const trustedTemp = process.env.CI === 'true' ? process.env.RUNNER_TEMP : '/private/tmp';
    const result = spawnSync('bash', ['scripts/build-release.sh', forbidden], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: { ...process.env, SOURCE_REF: 'HEAD', KANBAN_BUILD_TMP_ROOT: trustedTemp },
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('outside the allowed boundary');
  });
});
