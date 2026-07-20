import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const upstream = 'obsidian-community/obsidian-kanban';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.dirname(scriptDir);

const pages = JSON.parse(
  execFileSync(
    'gh',
    [
      'api',
      '--paginate',
      '--slurp',
      `repos/${upstream}/issues?state=open&per_page=100`,
    ],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
  )
);
const items = pages.flat();

const included = new Set([1147, 1156, 1169, 1179, 1180, 1188, 1216, 1221, 1222]);
const secondVersion = new Set([1151]);
const excludedFeatures = new Set([1194, 1195, 1210, 1211]);
const duplicateAlternatives = new Set([1139, 1206]);

function classify(item) {
  const number = item.number;
  const isPullRequest = Boolean(item.pull_request);
  const labels = item.labels.map((label) => label.name.toLowerCase());
  const text = `${item.title} ${labels.join(' ')}`.toLowerCase();

  if (included.has(number)) return 'v1-included';
  if (secondVersion.has(number)) return 'v2-data-safety-candidate';
  if (excludedFeatures.has(number)) return 'v1-excluded-feature';
  if (duplicateAlternatives.has(number)) return 'duplicate-not-selected';

  if (isPullRequest) {
    if (/doc|readme|chore|refactor|depend/.test(text)) return 'pr-maintenance';
    if (/fix|bug|crash|error|mobile|ios|android|cjk/.test(text)) return 'pr-bugfix-review';
    if (/feat|feature|add|support|implement|allow|option/.test(text)) return 'pr-feature-review';
    return 'pr-unclassified-review';
  }

  if (/data loss|lose|lost|save|saving|delete|delet|disappear|corrupt|overwrite/.test(text)) {
    return 'issue-data-integrity';
  }
  if (/slow|performance|lag|freeze|hang|load|memory|cpu/.test(text)) return 'issue-performance';
  if (/setting|configuration|config/.test(text)) return 'issue-settings';
  if (/mobile|ios|ipad|android|cjk|chinese|japanese|korean|emoji/.test(text)) {
    return 'issue-mobile-i18n';
  }
  if (labels.includes('enhancement') || /\[feature\]|feature request/.test(text)) {
    return 'issue-feature-request';
  }
  if (labels.includes('bug') || /\[bug\]|error|broken|fail|crash/.test(text)) return 'issue-bug';
  return 'issue-support-or-unclassified';
}

const rows = items
  .map((item) => ({
    number: item.number,
    kind: item.pull_request ? 'pull-request' : 'issue',
    category: classify(item),
    title: item.title.replace(/[\t\r\n]+/g, ' '),
    labels: item.labels.map((label) => label.name).join(','),
    updated: item.updated_at,
    url: item.html_url,
  }))
  .sort((a, b) => b.number - a.number);

const header = ['number', 'kind', 'category', 'title', 'labels', 'updated_at', 'url'];
const tsv = [
  header.join('\t'),
  ...rows.map((row) =>
    [row.number, row.kind, row.category, row.title, row.labels, row.updated, row.url].join('\t')
  ),
].join('\n');
writeFileSync(path.join(repoRoot, 'docs', 'upstream-open-items.tsv'), `${tsv}\n`);

const counts = rows.reduce((result, row) => {
  result[row.category] = (result[row.category] ?? 0) + 1;
  return result;
}, {});
const issueCount = rows.filter((row) => row.kind === 'issue').length;
const pullRequestCount = rows.length - issueCount;
const generated = new Date().toISOString();

const markdown = `# Upstream triage

Generated ${generated} from all open items in [${upstream}](https://github.com/${upstream}). The snapshot contains ${pullRequestCount} pull requests and ${issueCount} issues (${rows.length} total). Every item is recorded in [upstream-open-items.tsv](./upstream-open-items.tsv); categories are routing hints, not merge approval.

## Fixed decisions for 2.0.52-sunc.1

- Included with exact upstream provenance: #1147, #1156, #1169, #1179, #1180, #1188, #1216, #1221, and #1222. PR #1221 contributes two commits.
- Deferred for a dedicated data-loss regression suite: #1151.
- Feature work excluded from this release: #1194, #1195, #1210, and #1211.
- Duplicate alternatives not selected: #1139 (use #1179) and #1206 (use #1216).
- No upstream pull request is planned from this personal maintenance fork.

## Category counts

${Object.entries(counts)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([category, count]) => `- \`${category}\`: ${count}`)
  .join('\n')}

## Classification policy

Special release decisions above take priority. Remaining PRs are routed as bugfix, feature, maintenance, or unclassified review. Remaining issues are routed by data-integrity, performance, settings, mobile/i18n, feature, bug, or support/unclassified signals. A maintainer must inspect the exact diff, tests, overlap, and current head SHA before adopting any future item.
`;

writeFileSync(path.join(repoRoot, 'docs', 'upstream-triage.md'), markdown);
