# Obsidian Kanban Plugin

## Sunc4127 maintenance fork

This repository is a personal stability fork of [obsidian-community/obsidian-kanban](https://github.com/obsidian-community/obsidian-kanban). It preserves the plugin ID `obsidian-kanban`, the Markdown board format, existing setting keys, upstream authorship, and GPL-3.0 licensing.

- Maintenance branch: `codex/stable`
- Fixed upstream baseline: `5134c05ad9a7861f551cd15d57cf50db8394901a`
- First maintenance release: `2.0.52-sunc.1`
- Scope: selected upstream bug fixes plus a large-vault settings performance patch
- Upstream inventory: [triage policy and snapshot](docs/upstream-triage.md)

Dependencies and builds must run from a clean export outside an Obsidian vault. `scripts/build-release.sh` enforces a clean committed source by default and emits only `main.js`, `manifest.json`, and `styles.css`.

Release tags must be annotated and include a `Reviewed-tree: <Git tree SHA>` trailer. The release workflow also requires the independently configured `release` environment variable `OBSIDIAN_KANBAN_REVIEWED_TREE` to match the tagged commit's tree, so a candidate tag cannot authorize itself.

**The Kanban plugin is looking for new maintainers.** Interested? [Read more here.](https://github.com/mgmeyers/obsidian-kanban/blob/main/MAINTAINERS.md)

---

Create markdown-backed Kanban boards in [Obsidian](https://obsidian.md/)

- [Bugs, Issues, & Feature Requests](https://github.com/mgmeyers/obsidian-kanban/issues)
- [Development Roadmap](https://github.com/mgmeyers/obsidian-kanban/projects/1)

![Screen Shot 2021-09-16 at 12.58.22 PM.png](https://github.com/mgmeyers/obsidian-kanban/blob/main/docs/Assets/Screen%20Shot%202021-09-16%20at%2012.58.22%20PM.png)

![Screen Shot 2021-09-16 at 1.10.38 PM.png](https://github.com/mgmeyers/obsidian-kanban/blob/main/docs/Assets/Screen%20Shot%202021-09-16%20at%201.10.38%20PM.png)

## Documentation

Find the plugin documentation here: [Obsidian Kanban Plugin Documentation](https://publish.obsidian.md/kanban/)
