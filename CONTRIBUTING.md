# Contributing

## Commit messages

This repository uses [Conventional Commits](https://www.conventionalcommits.org/)
and enforces them locally with Commitlint through a Husky `commit-msg` hook.

After cloning, install the workspace (which also registers the hook):

```sh
npm install
```

A commit message must use one of these types:

```text
feat: add a feature
fix: correct a bug
docs: documentation only
style: formatting only
refactor: code change without behavior change
perf: performance improvement
test: tests only
build: build or dependency changes
ci: CI or tooling changes
chore: maintenance
```

Examples:

```text
feat(orbit): add reduced-motion cover fallback
fix(ci): restore pinned skill license bytes
chore(commits): enforce Conventional Commits with commitlint
```

Breaking changes use `!` after the type/scope and a `BREAKING CHANGE:` footer.

Validation commands:

```sh
npm run commitlint -- --from HEAD~1 --to HEAD
```

The `Commit messages` GitHub workflow checks pull-request commit ranges and the
latest pushed commit. The `commit-msg` hook runs on every local commit.
