# Contributing to ngx-multi-level-push-menu

Thank you for helping improve the library. Bug reports, reproductions, accessibility findings, tests, documentation, and code changes are welcome.

By participating, be respectful, constructive, and inclusive.

## Before opening an issue

Search [existing issues](https://github.com/ramiz4/ngx-multi-level-push-menu/issues). A useful bug report includes:

- A minimal reproduction, preferably a small repository or StackBlitz
- Expected and actual behavior
- Package, Angular, TypeScript, RxJS, browser, and operating-system versions
- Whether the app uses SSR/hydration, zoneless change detection, RTL, and strict templates
- Relevant console output and screenshots or recordings
- Keyboard or assistive-technology details for accessibility defects

Never include credentials, private URLs, or sensitive application data. Follow [SECURITY.md](SECURITY.md) instead of filing a public issue for a suspected vulnerability.

## Development setup

The workspace requires Node.js `>=20.19 <25` and npm 11 (the exact package manager is recorded in `package.json`).

```bash
git clone https://github.com/YOUR_USERNAME/ngx-multi-level-push-menu.git
cd ngx-multi-level-push-menu
git remote add upstream https://github.com/ramiz4/ngx-multi-level-push-menu.git
npm ci
```

Start the example application:

```bash
npm start
```

It is served at `http://localhost:4200` by default. Useful focused commands are:

```bash
npm run test:lib
npm run test:app
npm run lint
npm run format
npm run build:lib
npm run build:app
```

Before opening a pull request, run the repository validation command:

```bash
npm run validate
```

This checks formatting, lint, CI-mode tests, the library package, and the example application. Use `npm run format:write` and `npm run lint:fix` for safe mechanical fixes, then inspect the diff.

## Working on a change

Create a focused branch from the current default branch:

```bash
git fetch upstream
git remote set-head upstream --auto
git switch -c fix/short-description upstream/HEAD
```

Keep changes small enough to review. Add a regression test for a bug and tests for each observable behavior of a feature. Avoid unrelated formatting or dependency updates.

### Design constraints

Changes to the library should preserve these guarantees:

- Standalone-first usage remains provider-free; NgModule compatibility is maintained deliberately.
- The public API is declarative and strongly typed. Do not expose implementation-only helpers from `src/index.ts`.
- Browser globals are not read during server rendering. Use Angular platform guards and injected browser abstractions.
- Do not require Zone.js. State changes must work with signals/Angular change detection in zoneless applications.
- Keep native button/link semantics, keyboard behavior, focus management, RTL, reduced-motion, and forced-colors support intact.
- Preserve vertical page scrolling while detecting horizontal pointer gestures.
- Never render consumer icon markup through `innerHTML`. Extend the strict SVG path allowlist only with a security review and adversarial tests.
- Prefer immutable state and pure data transformations over direct DOM construction.
- Avoid new runtime dependencies unless the benefit and bundle impact are clear.
- Keep Angular 20–22 compatibility within the published peer range. Angular 19 remains on the library's `19.x` line.

Public API changes require documentation, tests, a changelog entry, and migration guidance when behavior or types change.

### Tests

Unit tests live beside the implementation. Cover behavior rather than private implementation details, including boundary cases such as:

- Empty, disabled, deeply nested, and cyclic menu data
- LTR and RTL keyboard/swipe behavior
- Router-present and Router-absent applications
- Multiple targeted menu instances
- SSR-safe construction and teardown
- Unsafe or malformed SVG input
- Reduced-motion and accessibility state where practical

The example application should demonstrate the recommended API, not legacy-only patterns.

### Documentation

The repository-root `README.md` is canonical. Keep `libs/ngx-multi-level-push-menu/README.md` equivalent because that file becomes the npm package README. Update these files as applicable:

- `CHANGELOG.md` for user-visible changes
- `MIGRATION.md` for upgrade steps
- `SECURITY.md` for security-process changes
- `MAINTENANCE.md` for build or release-process changes

## Commits and pull requests

Every commit subject and the pull-request title must use Conventional Commit syntax:

```text
feat: add controlled collapsed state
fix: preserve vertical scrolling during swipe
docs: clarify targeted service commands
refactor: replace imperative menu construction
test: cover router-free activation
chore: update development tooling
```

Use `!` or a `BREAKING CHANGE:` footer only for an intentional breaking change with migration notes.

For squash merges, the pull-request title becomes the release commit. `fix:` and `perf:` trigger a patch, `feat:` triggers a minor, and `!` or a `BREAKING CHANGE:` footer triggers a major. Changes limited to documentation, tests, refactoring, builds, CI, or chores do not publish a new package. Never edit package versions or create release tags manually; repository manifests stay at `0.0.0-development` and Semantic Release versions the built package after successful default-branch CI.

A pull request should include:

- The problem and the chosen solution
- Scope and explicit non-goals
- Tests performed and their results
- Screenshots or recordings for visual/interaction changes
- Accessibility and SSR impact
- API, bundle-size, and compatibility impact
- Linked issues and migration notes where applicable

All required checks must pass. Review feedback should be resolved with focused follow-up commits; do not hide behavior changes in a reformat.

## License

By contributing, you agree that your contribution is licensed under the project's [MIT License](LICENSE).
