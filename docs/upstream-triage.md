# Upstream triage

Generated 2026-07-20T01:53:25.977Z from all open items in [obsidian-community/obsidian-kanban](https://github.com/obsidian-community/obsidian-kanban). The snapshot contains 44 pull requests and 547 issues (591 total). Every item is recorded in [upstream-open-items.tsv](./upstream-open-items.tsv); categories are routing hints, not merge approval.

## Fixed decisions for 2.0.52-sunc.1

- Included with exact upstream provenance: #1147, #1156, #1169, #1179, #1180, #1188, #1216, #1221, and #1222. PR #1221 contributes two commits.
- Deferred for a dedicated data-loss regression suite: #1151.
- Feature work excluded from this release: #1194, #1195, #1210, and #1211.
- Duplicate alternatives not selected: #1139 (use #1179) and #1206 (use #1216).
- No upstream pull request is planned from this personal maintenance fork.

## Category counts

- `duplicate-not-selected`: 2
- `issue-bug`: 156
- `issue-data-integrity`: 22
- `issue-feature-request`: 291
- `issue-mobile-i18n`: 24
- `issue-performance`: 22
- `issue-settings`: 20
- `issue-support-or-unclassified`: 12
- `pr-bugfix-review`: 2
- `pr-feature-review`: 13
- `pr-maintenance`: 2
- `pr-unclassified-review`: 11
- `v1-excluded-feature`: 4
- `v1-included`: 9
- `v2-data-safety-candidate`: 1

## Classification policy

Special release decisions above take priority. Remaining PRs are routed as bugfix, feature, maintenance, or unclassified review. Remaining issues are routed by data-integrity, performance, settings, mobile/i18n, feature, bug, or support/unclassified signals. A maintainer must inspect the exact diff, tests, overlap, and current head SHA before adopting any future item.
