# Maintenance guide

This guide is for maintainers of `@ramiz4/ngx-multi-level-push-menu`. Consumer documentation belongs in the canonical root [README.md](README.md).

## Supported baseline

The current declarative `20.x` line declares these public compatibility bounds:

- Angular Common/Core/Router: `>=20.0.0 <23.0.0`
- RxJS: `>=7.8.0 <8.0.0`
- Installed-package Node engine: `>=20.19`
- Repository toolchain: Node `>=20.19 <25`, npm 11

Angular 20, 21, and 22 are supported by `20.x`. Angular 19 consumers must stay on the latest `19.x` patch until upgrading Angular, but that legacy line is security-unsupported once `20.x` publishes. Keep peer ranges in the library package, the compatibility table in both READMEs, CI coverage, and release notes aligned. Do not widen a peer range based on compilation alone: verify installation, strict template compilation, interaction tests, and package consumption in the added Angular major.

## Routine maintenance

| Task                                    | Suggested cadence   | Command or action                           |
| --------------------------------------- | ------------------- | ------------------------------------------- |
| Review high production vulnerabilities  | Weekly              | `npm audit --omit=dev --audit-level=high`   |
| Review all dependency findings          | Monthly             | `npm run security:check`                    |
| Inspect outdated dependencies           | Monthly             | `npm outdated`                              |
| Apply reviewed dependency updates       | Quarterly           | Review, update, then run `npm run validate` |
| Exercise the example and keyboard flows | Before release      | `npm start` plus manual checks              |
| Review Angular/RxJS peer compatibility  | Each upstream major | Compatibility test branch                   |
| Review open security reports            | Ongoing             | Private security channel from `SECURITY.md` |

Commit lockfile changes with their manifest changes. Read migration notes before Angular, Nx, TypeScript, Jest, Cypress, or ng-packagr upgrades. Keep major tooling upgrades isolated from behavior changes.

The supported maintenance commands are:

```bash
npm outdated                  # inspect dependency state
npx nx migrate latest         # prepare reviewed Nx migrations
npx nx migrate --run-migrations
npm run security:check        # broad npm audit inventory
```

`security:check` is the broad advisory inventory and may exit non-zero for already-tracked development advisories. It does not replace the high-severity production audit or the PR dependency-review gate.

Never run an automated update command directly on the default branch. Review its diff, validate the generated migrations, and revert unrelated churn.

## Required validation

The pull-request workflow validates Node 20 and Node 22. Its core contract is:

```bash
npm ci
npm run format
npm run lint
npm run test:ci
npm run build:lib
npm run build:app
npm run validate:automation
node tools/scripts/validate-package.mjs
npm pack ./dist/libs/ngx-multi-level-push-menu --dry-run
```

The package validator inspects the built artifact, not only the source workspace. The dry run is a final check that the npm tarball contains the intended README, declarations, bundles, metadata, and license without workspace-only files.

On pull requests, CI also validates every commit subject and the pull-request title with Commitlint. This is part of the release contract because a squash merge normally turns the pull-request title into the default-branch commit that Semantic Release analyzes.

The browser job runs separately on Node 22:

```bash
npx nx e2e multi-level-push-menu-example-e2e \
  --configuration=production \
  --browser=chrome
```

Production dependency auditing also runs on Node 22 with `npm audit --omit=dev --audit-level=high`. A PR-only dependency-review gate rejects newly introduced vulnerabilities rated high or critical. Treat required-check failures as release blockers and review development-only advisories during every dependency update.

CodeQL runs its extended JavaScript/TypeScript security query suite on every pull request and default-branch push, and weekly even without repository changes. It is part of the CI workflow that gates release authorization.

For a convenient local aggregate, run:

```bash
npm run validate
```

Before a release, also inspect `dist/libs/ngx-multi-level-push-menu/package.json`, the generated type declarations, and the `npm pack --dry-run` file list.

## Compatibility review checklist

For every supported Angular major, verify at minimum:

- A new standalone application can import `MultiLevelPushMenuComponent` with no providers.
- An existing NgModule application can use `NgxMultiLevelPushMenuModule` and its legacy `forRoot()` form.
- A Router-free application constructs and leaf actions emit correctly.
- Angular Router handles internal links while native external/modified links remain native.
- SSR can render the initial tree without `window`, global `document`, pointer, or animation-frame failures.
- Hydration produces no DOM-shape mismatch for the initial state.
- A zoneless app updates levels and collapsed state from pointer, keyboard, component, and service commands.
- Strict templates accept the documented inputs and typed outputs.
- The published tarball installs without undeclared runtime dependencies.

Record exceptions explicitly in `CHANGELOG.md` and the compatibility table; never imply a wider support range than was tested.

## Documentation ownership

- Root `README.md` is canonical.
- `libs/ngx-multi-level-push-menu/README.md` mirrors the consumer-facing content and is shipped to npm.
- `MIGRATION.md` explains user action required by changed behavior or types.
- `CHANGELOG.md` provides curated migration context; generated per-version notes live in GitHub Releases.
- `SECURITY.md` and `SUPPORT.md` own private-reporting and public-support routes.

Check README equivalence before release. Absolute repository links are preferred in mirrored/npm documentation because relative root links resolve differently from the packaged README.

## Versioning

Use semantic versioning based on consumer impact:

- Patch: compatible bug, security, or performance fix
- Minor: backward-compatible capability or public API addition
- Major: removal, incompatible type/behavior/style change, or intentionally narrowed compatibility

Semantic Release derives this impact from Conventional Commits: `fix:` and `perf:` produce a patch, `feat:` produces a minor, and `!` or a `BREAKING CHANGE:` footer produces a major. Documentation, test, refactor, build, CI, and chore-only changes do not publish an identical package. Use the consumer impact, not the preferred version number, to choose the commit type.

Do not infer the next version solely from the Angular major. The package peer range is the source of truth. Deprecate compatibility APIs and document a replacement before removal whenever practical. Repository manifests deliberately remain at `0.0.0-development`; only Semantic Release writes the calculated version into the built package.

## Release process

Every successful CI run for a push to the repository's actual default branch hands the exact validated commit to the **Release** workflow. With branch protection requiring pull requests, this means a merge to `main` (or the current `master` default) is the only normal release entry point. Direct pushes must be disabled in repository rules.

Semantic Release then:

1. Reads the Conventional Commits since the last `vX.Y.Z` tag and calculates the next version.
2. Stops successfully without publishing when no commit affects the package release.
3. Rebuilds and validates the distributable, while `@semantic-release/npm` writes the calculated version only into `dist`.
4. Creates and validates one immutable npm tarball.
5. Publishes the public package through npm Trusted Publishing with automatically generated provenance.
6. Creates the matching Git tag and GitHub Release, attaches the tarball, and posts release links to referenced issues and pull requests.

The workflow uses the scoped `GITHUB_TOKEN` for GitHub and an ephemeral OIDC identity for npm. Do not add `GH_PAT`, `NPM_TOKEN`, manual version commits, or hand-created release tags.

### One-time npm Trusted Publisher setup

Configure this before merging the release automation:

1. Open the settings for `@ramiz4/ngx-multi-level-push-menu` on npm.
2. Add a GitHub Actions trusted publisher with organization/user `ramiz4`, repository `ngx-multi-level-push-menu`, workflow filename `release.yml`, no environment, and allowed action **npm publish**.
3. Merge a release-worthy pull request and verify the first OIDC publication.
4. Set publishing access to require 2FA and disallow tokens, revoke the old automation token, and delete the repository's obsolete `NPM_TOKEN` and `GH_PAT` secrets.

The workflow intentionally uses a GitHub-hosted runner, npm `>=11.5.1`, Node `>=22.14`, `id-token: write`, and no shared package-manager cache. These are requirements of npm Trusted Publishing, not optional repository conventions.

### Required repository rules

Protect the default branch with pull requests, required approvals, resolved conversations, and these required checks: both `Validate` jobs, all three `Consumer` jobs, `End-to-end (Chrome)`, `Dependency review`, and `CodeQL (JavaScript/TypeScript)`. Require a linear history or squash merges, block force pushes and deletions, and prevent bypass/direct pushes. Protect the `v*` tag namespace as well, while allowing only the Release workflow's GitHub Actions identity to create release tags. Keep pull-request titles in Conventional Commit form because a squash merge uses that title as release input.

The workflows accept `main` and `master` during branch migration, but publication always compares against `github.event.repository.default_branch`. Rename the default branch separately if `main` is the desired canonical name, then update `nx.json`, documentation links, and branch rules in the same administrative migration.

### Verify a publication

After a release-worthy merge, verify:

```bash
npm view @ramiz4/ngx-multi-level-push-menu version
npm view @ramiz4/ngx-multi-level-push-menu dist-tags --json
npm pack @ramiz4/ngx-multi-level-push-menu@X.Y.Z --dry-run
```

Confirm the npm version, provenance, README, license, peer dependencies, tarball contents, `vX.Y.Z` tag, and generated GitHub Release. Breaking pull requests must already link `MIGRATION.md` before merge.

### Handle failures safely

- If CI fails, no release workflow receives publish authority. Fix the failure in a new pull request.
- If release analysis or validation fails before publication, fix the cause and rerun the failed Release workflow or merge a corrective commit.
- If npm publication succeeds but a later GitHub step fails, inspect npm and GitHub state before rerunning; Semantic Release is designed to resume from repository state.
- Never move or recreate an existing release tag.
- If an incorrect package was already published, do not overwrite that version. Follow npm policy and issue a corrected patch release.
- Treat revoking credentials, changing dist-tags, deprecating, or unpublishing a version as explicit maintainer actions with a recorded reason.

## Security maintenance

Use `npm audit fix` only after reviewing the proposed graph changes. Never use `--force` as routine maintenance. For a runtime vulnerability:

1. Confirm reachability and affected released versions privately.
2. Prepare the smallest safe fix and regression test.
3. Validate the built tarball and supported Angular range.
4. Coordinate disclosure and release timing under [SECURITY.md](SECURITY.md).
5. Publish a security patch and clear upgrade guidance.

Do not disclose reporter details or exploit information before a coordinated release.
