# Releasing

## Overview

Development / Production builds are triggered by merging a PR with feat/fix/breaking changes with either the `development` or `main` branch. No versioning is applied to merges to development, but all merges from `development` to `main` will create an automated version bump and commit. The overall release flow is:

```
feature branch → development → main → tag
```

Releases to either `development` or `main` are scoped according to projects affected with nx's `--projects=` flag. Therefore, if only ui-tokens or only ui-components has release-triggering commits, only the affected package will create a new release.

## Development Release

Merging a feature branch into development triggers the [Development Release Build](/.github/workflows/release-dev.yml) workflow, which:
  - runs the necessary branch checks from `ci.yml` to ensure the branch is in good working order (fails fast otherwise)
  - uses nx release's git-tag version resolver to locate the latest stable version release on main
  - appends `-dev.<run_id>` to the version to create a unique release number
  - adds a `development` dist tag for testing in development environments
  - publishes the branch to Quartermaster's jfrog registry

The development work flow does not create an additional merge commit, and does not create a git-tag in order to prevent git-tag pollution in the history, and allow nx release's git-tag version resolver to safely identify the `latest` (aka last stable version) git-tag from main.

## Production Release

A merging PR from the development branch into main triggers the [Production Release Build](/.github/workflows/release-prod.yml) workflow, which:
  - runs the necessary branch checks from `ci.yml` to ensure the development branch is in good working order (fails fast otherwise)
  - uses nx release's git-tag version resolver to locate the latest stable version release on main
  - uses conventional commits & semantic versioning to determine the appropriate version bump for the project, and both updates the relevant lib's package.json and the release tag's version number
  - publishes with the default `latest` npm dist-tag and creates a git-tag `{projectName}/v{version}`
  - publishes the branch to Quartermaster's jfrog registry
  - back merges a commit to the `development` branch to ensure the lib's package.json version remains in sync

### Versioning

Uses [semantic versioning](https://semver.org/), based on the [conventional commit](https://www.notion.so/Conventional-Commits-1194dc390c858036b48ffb2a73c8f3e6) type:

| Change | Bump | CC Type | Example |
|--------|------|---------|---------|
| Bug fix or patch | `patch` | `fix` | `1.2.3 → 1.2.4` |
| New feature, backwards-compatible | `minor` | `feat` | `1.2.3 → 1.3.0` |
| Breaking change or major milestone | `major` | `!` | `1.2.3 → 2.0.0` |
| ci / chore / build / docs / perf / style / refactor | none | ie. `build` | no release |
