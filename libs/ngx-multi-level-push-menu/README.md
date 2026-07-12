<!-- Mirrored from the repository root README.md, which is canonical. -->

# ngx-multi-level-push-menu

[![npm version](https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu.svg)](https://www.npmjs.com/package/@ramiz4/ngx-multi-level-push-menu)
[![CI](https://github.com/ramiz4/ngx-multi-level-push-menu/actions/workflows/ci.yml/badge.svg)](https://github.com/ramiz4/ngx-multi-level-push-menu/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/LICENSE)

Accessible, responsive, SSR-safe multi-level push navigation for Angular. The library is standalone-first, has no icon or animation dependency, and still supports existing NgModule applications.

## Why use it?

- One declarative menu tree; no imperative DOM construction
- Standalone component with zero required providers
- Typed item, group, level, and collapsed-state events
- Optional targeted service commands for applications with one or many menus
- Native buttons and links, keyboard navigation, focus management, live announcements, RTL, reduced motion, and forced-colors support
- Pointer-based swipe gestures that preserve vertical scrolling
- Safe inline path icons or CSS classes from any icon library
- Signals and `OnPush` change detection; compatible with zoneless applications
- Guarded browser APIs for server-side rendering and hydration
- Cover and overlap layouts with responsive behavior

## Compatibility

| Library line                      | Angular peer range                  | RxJS peer range          | Node.js                             |
| --------------------------------- | ----------------------------------- | ------------------------ | ----------------------------------- |
| `20.x` (current declarative line) | `>=20 <23` (Angular 20, 21, and 22) | `>=7.8 <8`               | Follow your Angular major's support |
| `19.x` (legacy)                   | Angular 19                          | See the release metadata | See the release metadata            |
| `<=18.x` (archived)               | See the exact npm release metadata  | See the release metadata | See the release metadata            |

Older library major numbers did not consistently match Angular major numbers. Do not infer compatibility from the package version; inspect the chosen release's `peerDependencies`. For the current line, use the [Node.js version supported by your Angular major](https://angular.dev/reference/versions). The repository development toolchain uses Node `>=20.19 <25` and npm 11.

Angular 19 applications must remain on `@ramiz4/ngx-multi-level-push-menu@^19` until the application is upgraded to Angular 20 or newer. That legacy line no longer receives supported security fixes after `20.x` publishes, so plan the Angular upgrade; do not force-install the `20.x` library over an incompatible peer range.

## Installation

```bash
npm install @ramiz4/ngx-multi-level-push-menu
```

There are no required Font Awesome, Angular Animations, or application-level stylesheet imports.

## Quick start: standalone

Import the standalone component. No provider function is required.

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuActivationEvent, MultiLevelPushMenuComponent, MultiLevelPushMenuItem, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [MultiLevelPushMenuComponent, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly menu: readonly MultiLevelPushMenuItem[] = [
    { id: 'home', name: 'Home', link: '/' },
    {
      id: 'products',
      name: 'Products',
      items: [
        { id: 'new', name: 'New products', link: '/products/new' },
        { id: 'all', name: 'All products', link: '/products' },
      ],
    },
    { id: 'help', name: 'Help', link: 'https://example.com/help', target: '_blank' },
  ];

  readonly options = new MultiLevelPushMenuOptions({
    title: 'Acme',
    ariaLabel: 'Primary navigation',
    menuWidth: '19rem',
    mode: 'cover',
    closeOnNavigation: true,
  });

  collapsed = false;

  onItemActivate(event: MenuActivationEvent): void {
    console.log(event.item, event.level, event.path, event.originalEvent);
  }
}
```

```html
<ngx-multi-level-push-menu [menu]="menu" [options]="options" [(collapsed)]="collapsed" (itemActivate)="onItemActivate($event)">
  <router-outlet />
</ngx-multi-level-push-menu>
```

Give the component (or its containing layout) a height. `menuHeight` defaults to `100%`.

```scss
:host,
ngx-multi-level-push-menu {
  display: block;
  height: 100dvh;
}
```

`ngx-multi-level-push-menu` is the canonical selector. The historical
`ramiz4-multi-level-push-menu` selector remains available as a compatibility
alias for existing templates.

The deprecated `provideMultiLevelPushMenu()` helper remains exported only for source compatibility. Remove it when convenient: `MultiLevelPushMenuService` is provided in root.

## Existing NgModule applications

The NgModule API remains available for compatibility:

```ts
import { NgModule } from '@angular/core';
import { NgxMultiLevelPushMenuModule } from '@ramiz4/ngx-multi-level-push-menu';

@NgModule({
  imports: [NgxMultiLevelPushMenuModule],
})
export class AppModule {}
```

`NgxMultiLevelPushMenuModule.forRoot()` also continues to work. Both the module and `forRoot()` are compatibility APIs; new code should import `MultiLevelPushMenuComponent` directly, even inside an NgModule.

## Menu data

`MultiLevelPushMenuItem<TData>` accepts application-specific data while keeping the navigation fields typed.

```ts
interface NavMetadata {
  permission?: string;
  analyticsId: string;
}

const menu: MultiLevelPushMenuItem<NavMetadata>[] = [
  {
    id: 'reports',
    name: 'Reports',
    ariaLabel: 'Open reports',
    icon: '<svg viewBox="0 0 24 24"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    link: '/reports',
    data: { permission: 'reports.read', analyticsId: 'nav-reports' },
  },
];
```

| Field       | Type                              | Meaning                                                                    |
| ----------- | --------------------------------- | -------------------------------------------------------------------------- |
| `name`      | `string`                          | Preferred visible label                                                    |
| `title`     | `string`                          | Fallback label; retained for older menu models                             |
| `id`        | `string`                          | Stable identity and service navigation target                              |
| `icon`      | `string`                          | Safe SVG path document or CSS class list                                   |
| `link`      | `string`                          | Internal Angular URL, external URL, fragment, or other anchor URL          |
| `items`     | `MultiLevelPushMenuItem<TData>[]` | Child items; a non-empty array makes the item a group                      |
| `disabled`  | `boolean`                         | Renders a non-navigating disabled control and prevents activation          |
| `ariaLabel` | `string`                          | Accessible name override                                                   |
| `target`    | `string`                          | Native anchor target, such as `_blank`                                     |
| `rel`       | `string`                          | Native anchor relationship; `_blank` gets `noopener noreferrer` by default |
| `data`      | `TData`                           | Consumer-owned metadata                                                    |

The visible-label fallback order is `name`, `title`, `id`, then `Untitled item`. Use immutable updates (a new menu array or options object) when changing inputs in an `OnPush` application. If both `[menu]` and `options.menu` are supplied, the explicit `[menu]` input wins.

### Routing behavior

- Same-context internal links use the optional Angular `Router` when one is available.
- External, protocol-relative, fragment, modified-click, and non-`_self` links keep native anchor behavior.
- `target="_blank"` is protected with `rel="noopener noreferrer"` unless `rel` is supplied.
- Set `closeOnNavigation` to collapse after native navigation starts or Angular Router navigation succeeds.
- The legacy-named `preventItemClick: false` option bypasses Angular Router interception. Component and service click events still emit.

## Component API

### Inputs

| Input       | Type                                                                                   | Default             | Notes                                                                   |
| ----------- | -------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `menu`      | `readonly MultiLevelPushMenuItem[] \| null \| undefined`                               | Uses `options.menu` | Explicit menu tree; once bound, it takes precedence over `options.menu` |
| `options`   | `MultiLevelPushMenuOptions \| Partial<MultiLevelPushMenuOptions> \| null \| undefined` | Class defaults      | Each assignment is merged over fresh defaults                           |
| `collapsed` | `boolean \| null \| undefined`                                                         | `options.collapsed` | Supports `[(collapsed)]`; `null` and `undefined` do not change state    |

### Outputs

| Output            | Payload                  | When it emits                                                                |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `collapsedChange` | `boolean`                | The collapsed state changes through user or public API interaction           |
| `menuOpen`        | `boolean`                | The menu expands (`true`)                                                    |
| `menuClose`       | `boolean`                | The menu collapses (`true`)                                                  |
| `itemClick`       | `MultiLevelPushMenuItem` | A leaf item activates; compatibility event                                   |
| `groupItemClick`  | `MultiLevelPushMenuItem` | A group opens; compatibility event                                           |
| `itemActivate`    | `MenuActivationEvent`    | A leaf activates, with item, zero-based level, full path, and original event |
| `groupActivate`   | `MenuActivationEvent`    | A group activates, with item, level, path, and original event                |
| `levelChange`     | `number`                 | Active zero-based depth changes; root is `0`                                 |

Prefer `itemActivate` and `groupActivate` when you need context. The shorter click outputs remain useful for existing consumers.

### Public component methods

Obtain a component instance with `@ViewChild(MultiLevelPushMenuComponent)` when controls belong to the same view.

| Method                       | Effect                                                                  |
| ---------------------------- | ----------------------------------------------------------------------- |
| `collapseMenu(level?)`       | Collapse the menu, or navigate back to an already-open numeric depth    |
| `expandMenu()`               | Expand and move focus into the active level                             |
| `toggleMenu()`               | Toggle expanded/collapsed state                                         |
| `openMenu()`                 | Alias for `expandMenu()`                                                |
| `closeMenu()`                | Alias for `collapseMenu()`                                              |
| `navigateToLevel(levelOrId)` | Navigate to an open depth, or find a group by `id`, then `name`/`title` |
| `goBack(focusParent = true)` | Return one level and optionally restore focus to the parent group       |

`collapseMenu` and `expandMenu` also accept a legacy animation-speed argument. Animation timing is configured by `animationDuration`; the speed argument is retained only for source compatibility.

## Service API and menu targeting

`MultiLevelPushMenuService` is useful when the controller is outside the menu's view. Inject it normally; no provider setup is required.

```ts
import { inject } from '@angular/core';
import { MultiLevelPushMenuService } from '@ramiz4/ngx-multi-level-push-menu';

const menus = inject(MultiLevelPushMenuService);

menus.openMenu('primary');
menus.navigateToLevel('products', 'primary');
menus.goBack('primary');
menus.closeMenu('primary');
```

Set `options.menuID` on each menu to target it. A command without `targetId` is broadcast to every mounted menu using that service instance.

| Method            | Signature                                                  | Notes                                                                                                        |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `collapse`        | `(level?: number, targetId?: string) => void`              | Collapse, or move to an already-open depth; use `collapse(undefined, 'primary')` to target a normal collapse |
| `expand`          | `(targetId?: string) => void`                              | Expand                                                                                                       |
| `toggleMenu`      | `(targetId?: string) => void`                              | Toggle                                                                                                       |
| `openMenu`        | `(targetId?: string) => void`                              | Alias for `expand`                                                                                           |
| `closeMenu`       | `(targetId?: string) => void`                              | Alias for targeted collapse                                                                                  |
| `navigateToLevel` | `(levelOrId: number \| string, targetId?: string) => void` | Navigate to an open depth or group identity                                                                  |
| `goBack`          | `(targetId?: string) => void`                              | Return one level                                                                                             |

Compatibility observables are also available: `collapsed()`, `expanded()`, `onMenuItemClick()`, and `onGroupItemClick()`. The item streams emit typed `MultiLevelPushMenuItem` values.

## Options and defaults

Create options with `new MultiLevelPushMenuOptions({...})` or pass a `Partial<MultiLevelPushMenuOptions>` directly.

| Option                          | Type                                                                  | Default              | Behavior                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `menu`                          | `MultiLevelPushMenuItem[]`                                            | `[]`                 | Menu fallback when `[menu]` is not bound                                                                                 |
| `mode`                          | `'cover' \| 'overlap'`                                                | `'cover'`            | Cover shows one panel; overlap offsets stacked levels. At `48rem` and below, overlap uses the single-panel mobile layout |
| `collapsed`                     | `boolean`                                                             | `false`              | Applied when this configured value changes; a separate `[collapsed]` input takes precedence                              |
| `menuID`                        | `string \| undefined`                                                 | `undefined`          | `<nav>` ID and service-command target                                                                                    |
| `wrapperClass`                  | `string \| undefined`                                                 | `undefined`          | Extra class on the rendered wrapper                                                                                      |
| `menuInactiveClass`             | `string \| undefined`                                                 | `undefined`          | Extra wrapper class while collapsed                                                                                      |
| `menuWidth`                     | `string \| number`                                                    | `'300px'`            | Any CSS length; a number is pixels                                                                                       |
| `menuHeight`                    | `string \| number`                                                    | `'100%'`             | Any CSS length; a number is pixels                                                                                       |
| `title`                         | `string \| undefined`                                                 | `undefined`          | Root heading; visually falls back to `Menu`                                                                              |
| `titleIcon`                     | `string`                                                              | Built-in bars SVG    | Header and toggle icon                                                                                                   |
| `backText`                      | `string`                                                              | `'Back'`             | Back-button text                                                                                                         |
| `backItemClass`                 | `string`                                                              | `'back-item'`        | Extra class on the Back button                                                                                           |
| `backItemIcon`                  | `string`                                                              | Built-in chevron SVG | Back-button icon                                                                                                         |
| `groupIcon`                     | `string`                                                              | Built-in chevron SVG | Group indicator                                                                                                          |
| `overlapWidth`                  | `string \| number`                                                    | `55`                 | Visible overlap; a number is pixels and also influences swipe threshold                                                  |
| `preventItemClick`              | `boolean`                                                             | `true`               | Legacy routing flag; `false` uses native anchor navigation instead of Angular Router interception                        |
| `preventGroupItemClick`         | `boolean`                                                             | `true`               | Legacy propagation flag; `true` stops the group activation DOM event from bubbling. Outputs still emit                   |
| `direction`                     | `'ltr' \| 'rtl'`                                                      | `'ltr'`              | Layout, swipe, and forward/back keyboard direction                                                                       |
| `fullCollapse`                  | `boolean`                                                             | `false`              | Hide the navigation completely instead of leaving the overlap/toggle edge visible                                        |
| `swipe`                         | `'both' \| 'left' \| 'right' \| 'touchscreen' \| 'desktop' \| 'none'` | `'both'`             | Enabled pointer kinds/directions; touchscreen and desktop are compatibility aliases                                      |
| `ariaLabel`                     | `string`                                                              | `'Main navigation'`  | Accessible label for the `<nav>` landmark                                                                                |
| `closeOnNavigation`             | `boolean`                                                             | `false`              | Collapse after leaf navigation                                                                                           |
| `preserveActiveLevelOnCollapse` | `boolean`                                                             | `true`               | Keep the submenu stack across collapse/expand                                                                            |
| `maxDepth`                      | `number`                                                              | `50`                 | Maximum submenu depth; also limits malformed/cyclic data                                                                 |
| `animationDuration`             | `string \| number`                                                    | `280`                | CSS time or milliseconds when numeric                                                                                    |

## Icons

Icons are optional and dependency-free.

### Safe inline SVG paths

An icon string beginning with `<` must be a complete `<svg>` containing at least one safe `<path>`. The renderer does not use `innerHTML`: it parses a numeric four-value `viewBox` plus safe path and paint attributes, then creates Angular-owned SVG elements. Scripts, event handlers, external references, unsupported elements, invalid path data, and overlong paths are discarded. An invalid SVG renders no icon.

```ts
const icon = '<svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
```

The supported path attributes are `d`, `fill`, `stroke`, `stroke-width`, `fill-rule`, and `clip-rule`. Use simple path-only SVGs; convert shapes such as circles or polygons to paths first.

### CSS icon classes

Any non-markup string is applied as a CSS class list:

```ts
{ name: 'Settings', icon: 'fa-solid fa-gear', link: '/settings' }
```

Install and load the chosen icon library in your application. This package does not bundle one.

## Styling

Set custom properties directly on the component host. This works in an application component stylesheet and can be scoped per instance with a class.

```html
<ngx-multi-level-push-menu class="app-menu" />
```

```scss
ngx-multi-level-push-menu.app-menu {
  --ngx-push-menu-background: #0b3d2e;
  --ngx-push-menu-surface: #115740;
  --ngx-push-menu-hover: #176b4e;
  --ngx-push-menu-active: #082d22;
  --ngx-push-menu-color: #fff;
  --ngx-push-menu-border: rgb(255 255 255 / 24%);
  --ngx-push-menu-focus: #a7f3d0;
  --ngx-push-menu-shadow: 0 0.75rem 2rem rgb(0 0 0 / 30%);
}
```

| CSS custom property          | Default                            |
| ---------------------------- | ---------------------------------- |
| `--ngx-push-menu-background` | `#336ca6`                          |
| `--ngx-push-menu-surface`    | `#2e6196`                          |
| `--ngx-push-menu-hover`      | `#295685`                          |
| `--ngx-push-menu-active`     | `#1f4164`                          |
| `--ngx-push-menu-color`      | `#fff`                             |
| `--ngx-push-menu-border`     | `rgb(255 255 255 / 18%)`           |
| `--ngx-push-menu-focus`      | `#fff`                             |
| `--ngx-push-menu-shadow`     | `0 0.5rem 1.5rem rgb(0 0 0 / 24%)` |

Sizing and motion are configured through `menuWidth`, `menuHeight`, `overlapWidth`, and `animationDuration`; the component exposes them internally as `--ngx-push-menu-width`, `--ngx-push-menu-height`, `--ngx-push-menu-overlap`, and `--ngx-push-menu-duration`.

## Accessibility and interaction

The component provides:

- A labeled navigation landmark and native interactive elements
- Disabled semantics and safe external-link defaults
- Up/Down looping within a level; Home/End to jump; direction-aware Left/Right for submenus; Escape to go back or collapse
- Focus movement into opened levels and restoration to the parent group
- Polite live announcements for level and collapsed-state changes
- Inert, non-focusable inactive panels
- Logical CSS properties for LTR/RTL layouts
- `prefers-reduced-motion` and Windows forced-colors adaptations
- Vertical-scroll-friendly pointer gestures using `touch-action: pan-y`

Accessibility still depends on consumer data and theming. Give every menu a useful `ariaLabel`, use meaningful item labels, keep IDs unique, and verify color contrast and keyboard flows in the consuming application.

## SSR, hydration, and zoneless Angular

- The initial menu tree renders on the server.
- Browser-only focus scheduling is guarded with `isPlatformBrowser` and the injected `DOCUMENT`.
- The Router is optional, so rendering does not require router providers.
- Pointer handling runs only in response to browser events.
- The implementation uses signals, Angular events, and `OnPush`; it does not require Zone.js from the consuming application.

No special provider is needed for SSR, hydration, or zoneless change detection. Configure those features as usual in the Angular application.

## Advanced public directives

The main component already handles items and swipes. `MenuItemDirective` (`[ramiz4MenuItem]`) and `SwipeDirective` (`[ramiz4Swipe]`) remain exported for custom templates. They emit typed `MenuItemClickEvent`, `KeyNavigationEvent`, and `SwipeEvent` values. Treat them as advanced building blocks; most applications only import `MultiLevelPushMenuComponent`.

## Troubleshooting

### The menu has no height

The default `menuHeight` is `100%`, so an ancestor must establish a height. Set a host height or pass an explicit value such as `100dvh`.

### The service controls every menu

Commands without a target are broadcasts. Give each menu a unique `menuID` and pass that ID to service methods.

### A submenu does not open

Use an `items` array, make sure the item is not disabled, and avoid cyclic object/array references. Navigation is capped by `maxDepth`.

### An icon is blank

For inline icons, use one complete path-only SVG that meets the safe parser rules. Otherwise pass CSS classes and ensure that icon library is loaded globally.

### Router navigation is not intercepted

Confirm that the application provides Angular Router, the link is an internal same-context URL, `target` is absent or `_self`, and `preventItemClick` is not `false`.

## Development

```bash
npm ci
npm start                 # example app on http://localhost:4200
npm run test:lib
npm run lint
npm run build:lib
npm run build:app
npm run validate          # format, lint, CI tests, library and example builds
```

See [CONTRIBUTING.md](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/CONTRIBUTING.md) for the contributor workflow, [MAINTENANCE.md](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/MAINTENANCE.md) for releases, [MIGRATION.md](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/MIGRATION.md) for upgrading, and [CHANGELOG.md](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/CHANGELOG.md) for notable changes.

## Support and security

- Bugs and feature requests: [GitHub Issues](https://github.com/ramiz4/ngx-multi-level-push-menu/issues)
- Usage help: [SUPPORT.md](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/SUPPORT.md)
- Security reports: follow [SECURITY.md](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/SECURITY.md); do not open a public issue for a suspected vulnerability

## License

[MIT](https://github.com/ramiz4/ngx-multi-level-push-menu/blob/main/LICENSE) © Ramiz Loki
