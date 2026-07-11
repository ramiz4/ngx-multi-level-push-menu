# Changelog

Curated migration-relevant changes are documented here. The project follows [Semantic Versioning](https://semver.org/); Semantic Release generates the authoritative per-version notes in [GitHub Releases](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) from Conventional Commits.

## Unreleased

### Added

- Provider-free standalone usage backed by a root-provided menu service
- Exported NgModule compatibility API for existing applications
- Explicit `[menu]`, `[options]`, and two-way `[(collapsed)]` inputs
- Canonical `ngx-multi-level-push-menu` selector with the historical `ramiz4-multi-level-push-menu` retained as a compatibility alias
- Typed component outputs for leaf/group activation, levels, and collapsed state
- Public component controls and targetable service commands for multiple menu instances
- Optional menu metadata, disabled state, accessible labels, link targets/relationships, navigation closing, level preservation, maximum depth, and animation duration
- Safe path-only inline SVG rendering plus CSS-class icon support without a required icon dependency
- Keyboard focus management, live announcements, inert inactive levels, RTL behavior, reduced-motion styles, and forced-colors styles
- SSR guards, optional Router integration, zoneless-compatible signal state, and Angular 20–22 peer compatibility
- Package validation, tarball inspection, browser end-to-end coverage, and provenance-enabled releases

### Changed

- Replaced imperative DOM construction and loosely coupled internal services with a declarative Angular template and immutable navigation stack
- Reworked cover/overlap layout, mobile behavior, swipe recognition, and theming around logical CSS and documented custom properties
- Made options assignments start from fresh defaults and made an explicit menu input take precedence over `options.menu`
- Preserved native browser behavior for external, fragment, target, and modified-click navigation
- Made Router optional and limited Angular Router interception to eligible internal links
- Made numeric sizing values consistently mean pixels; string values are CSS lengths
- Replaced manual release commits, PAT pushes, and tag-triggered token publishing with Conventional Commits and Semantic Release after successful default-branch CI

### Fixed

- Multiple menu instances can now be controlled independently by `menuID`
- Vertical scrolling is no longer blocked by horizontal gesture detection
- A completed swipe no longer triggers the following click accidentally
- Cyclic/malformed trees and excessive nesting are bounded safely
- Empty menus, disabled items, teardown, focus scheduling, and repeated input updates have deterministic behavior
- `_blank` links receive a safe relationship by default
- Browser-only focus work no longer runs during server rendering

### Security

- Removed arbitrary inline SVG rendering in favor of a strict, length-bounded SVG path parser that discards scripts, event handlers, external references, and unsupported markup
- Replaced long-lived npm publication tokens with npm Trusted Publishing through short-lived GitHub OIDC credentials and automatic provenance

### Deprecated

- `NgxMultiLevelPushMenuModule` and `forRoot()` remain for compatibility; import the standalone `MultiLevelPushMenuComponent` for new code

### Migration

- Internal DOM class names and layout markup changed with the declarative renderer. Use documented CSS custom properties instead of targeting old internals.
- Inline SVG icons must now be complete path-only SVG documents accepted by the safe parser.
- Unitless numeric strings used for lengths should become numbers or include a CSS unit.

See [MIGRATION.md](MIGRATION.md) for examples and a full upgrade checklist.

## Previous releases

Release history before this changelog was introduced is available in [GitHub Releases](https://github.com/ramiz4/ngx-multi-level-push-menu/releases).
