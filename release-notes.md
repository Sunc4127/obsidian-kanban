# 2.0.52-sunc.1

Personal stability release based on upstream commit `5134c05ad9a7861f551cd15d57cf50db8394901a`.

- Replaces the eager template and folder dropdown scans with validated path text inputs, preventing settings initialization from recursively walking large vaults.
- Preserves global/local inheritance, empty-value reset behavior, the `obsidian-kanban` plugin ID, and the existing Markdown board format.
- Includes selected upstream fixes from PRs #1147, #1156, #1169, #1179, #1180, #1188, #1216, #1221, and #1222 with `cherry-pick -x` provenance.
- Adds regression tests, Node 18 CI, deterministic clean-export builds, and runtime dependency auditing.

This release is maintained for personal use and is not an upstream release.
