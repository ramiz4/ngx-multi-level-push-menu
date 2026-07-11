# Maintenance guide

This guide is for maintainers of `@ramiz4/ngx-multi-level-push-menu`. Consumer documentation belongs in the canonical root [README.md](README.md).

## Supported baseline

The current declarative `20.x` line declares these public compatibility bounds:

- Angular Common/Core/Router: `>=20.0.0 <23.0.0`
- RxJS: `>=7.8.0 <8.0.0`
- Installed-package Node engine: `>=20.19`
- Repository toolchain: Node `>=20.19 <25`, npm 10

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
node tools/scripts/validate-package.mjs
npm pack ./dist/libs/ngx-multi-level-push-menu --dry-run
```

The package validator inspects the built artifact, not only the source workspace. The dry run is a final check that the npm tarball contains the intended README, declarations, bundles, metadata, and license without workspace-only files.

The browser job runs separately on Node 22:

```bash
npx nx e2e multi-level-push-menu-example-e2e \
  --configuration=production \
  --browser=chrome
```

Production dependency auditing also runs on Node 22 with `npm audit --omit=dev --audit-level=high`. A PR-only dependency-review gate rejects newly introduced vulnerabilities rated high or critical. Treat required-check failures as release blockers and review development-only advisories during every dependency update.

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
- `CHANGELOG.md` records notable user-visible changes under `Unreleased` until a version is prepared.
- `SECURITY.md` and `SUPPORT.md` own private-reporting and public-support routes.

Check README equivalence before release. Absolute repository links are preferred in mirrored/npm documentation because relative root links resolve differently from the packaged README.

## Versioning

Use semantic versioning based on consumer impact:

- Patch: compatible bug, security, performance, or documentation fix
- Minor: backward-compatible capability or public API addition
- Major: removal, incompatible type/behavior/style change, or intentionally narrowed compatibility

Do not infer the next version solely from the Angular major. The package peer range is the source of truth. Deprecate compatibility APIs and document a replacement before removal whenever practical.

## Release process

Releases are intentionally prepared by a manual GitHub Actions workflow and published only from a version tag. Normal pushes to `master` do not bump or publish a version.

### 1. Prepare the release content

- Ensure the default branch is green.
- Move relevant `Unreleased` changelog entries into a dated version section.
- Confirm migration guidance, compatibility tables, examples, package metadata, and both READMEs.
- Choose an exact unused semantic version `X.Y.Z`.
- Confirm npm and GitHub release credentials are available to the workflows; never place token values in the repository or logs.

### 2. Run “Prepare release”

In GitHub Actions, select the **Prepare release** workflow, choose `master`, enter the exact `X.Y.Z`, and run it.

The workflow is responsible for:

1. Validating the requested version and confirming its tag does not already exist
2. Updating the root package version, library package version, and lockfile consistently
3. Running the full validation/package checks
4. Creating the release commit and an annotated `vX.Y.Z` tag
5. Atomically pushing the commit and tag so a partial release is not published

Do not create a second manual version commit or lightweight tag around this process.

### 3. Verify tag-triggered publication

The `vX.Y.Z` tag starts the publish workflow. It rebuilds and validates the package, then publishes to npm with provenance. Verify:

```bash
npm view @ramiz4/ngx-multi-level-push-menu version
npm view @ramiz4/ngx-multi-level-push-menu dist-tags --json
npm pack @ramiz4/ngx-multi-level-push-menu@X.Y.Z --dry-run
```

Confirm the npm version, provenance, README, license, peer dependencies, and tarball contents. Create or verify the matching GitHub release notes and link `MIGRATION.md` for any required user action.

### 4. Handle failures safely

- If preparation fails before the atomic push, fix the cause and rerun with the same still-unused version.
- If the tag exists but npm publication failed, fix the workflow or credential issue and rerun the tag-triggered publish job; do not move the tag.
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
