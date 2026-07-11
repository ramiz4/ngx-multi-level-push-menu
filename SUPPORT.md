# Support

## Public support

Use [GitHub Issues](https://github.com/ramiz4/ngx-multi-level-push-menu/issues) for reproducible bugs, feature proposals, documentation gaps, and usage questions.

Before opening an issue:

1. Read the canonical [README.md](README.md) and [MIGRATION.md](MIGRATION.md).
2. Search open and closed issues.
3. Reproduce with the latest patch of your supported library line.
4. Reduce the problem to the smallest menu and application configuration possible.

Include package, Angular, RxJS, TypeScript, browser, and Node versions plus whether the application uses Router, SSR/hydration, zoneless change detection, RTL, and strict templates. A repository or StackBlitz is much more useful than a screenshot alone.

Public community support is best-effort. A response time or fix timeline is not guaranteed.

## Security reports

Do not report suspected vulnerabilities in a public issue. Follow the private process in [SECURITY.md](SECURITY.md).

## Troubleshooting checklist

### Menu is blank or not visible

- Import `MultiLevelPushMenuComponent` (or the compatibility NgModule) in the consuming component/module.
- Confirm `[menu]` is an array. An explicitly bound `undefined` or `null` menu becomes an empty tree and overrides `options.menu`.
- Give the component or an ancestor a height; `menuHeight` defaults to `100%`.
- Check whether `collapsed`, `options.collapsed`, or `fullCollapse` intentionally hides the navigation.
- Inspect the browser console for template or style errors.

No Font Awesome or provider installation is required for the menu itself.

### Internal navigation does not use Angular Router

- Ensure the application actually provides Router.
- Use an internal same-context URL and no non-`_self` target.
- Leave the legacy `preventItemClick` option at its default `true`.
- Modified clicks, external/protocol-relative URLs, and fragments intentionally keep native anchor behavior.

Leaf outputs emit even when native navigation is used.

### Service command affects the wrong menu

A command without `targetId` is broadcast. Give every instance a unique `options.menuID`, then pass that value to the command:

```ts
menuService.navigateToLevel('products', 'primary');
menuService.closeMenu('primary');
```

For `collapse`, the depth is the first argument: `menuService.collapse(undefined, 'primary')`.

### Submenu does not open

- Put children directly in an `items` array.
- Ensure the group is not disabled.
- Avoid cyclic object and array references.
- Check `maxDepth`; root is depth `0`.
- `navigateToLevel('value')` matches a group by `id`, then `name` or `title`; stable unique IDs are recommended.

### Icon does not render

- A value starting with `<` must be a complete, path-only safe SVG with a four-number `viewBox`.
- Unsupported elements, unsafe attributes, invalid/overlong path data, and unsafe colors are discarded.
- A non-markup value is treated as CSS classes; load that icon library in the application.
- The package intentionally does not render arbitrary SVG markup through `innerHTML`.

### Swipe conflicts with scrolling

The directive preserves vertical scrolling with `touch-action: pan-y` and cancels a gesture that is predominantly vertical. Check nested gesture handlers in the application, and use `swipe: 'touchscreen'`, `'desktop'`, a single direction, or `'none'` to narrow behavior.

### SSR or hydration issue

The component guards browser-only focus work. Provide a minimal server stack trace and identify whether the failure occurs during server rendering, hydration, or the first browser interaction. Also check application code that constructs menu data or icons for unguarded browser globals.

### Accessibility issue

Include the interaction method, key sequence, browser, operating system, assistive technology and version, expected announcement/focus, and actual announcement/focus. Consumer labels and theme contrast remain application responsibilities.

## Commercial help

For dedicated support or custom development, contact the maintainer at [me@ramizloki.com](mailto:me@ramizloki.com). Commercial availability and response times are arranged separately from community support.

## Contributing a fix

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, design constraints, tests, and pull-request expectations.
