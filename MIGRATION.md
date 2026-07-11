# Migrating to the declarative API

This guide covers migration from the pre-modernization `19.x` API and imperative renderer to the standalone-first declarative `20.x` API. Most existing menu data and service calls remain source-compatible, but Angular compatibility, integration, styling, icon safety, and event handling deserve review.

## 1. Check runtime compatibility

The current line requires:

- Angular `>=20 <23`
- RxJS `>=7.8 <8`
- A Node.js version supported by the chosen Angular major; see Angular's official compatibility table

Angular 19 applications must stay on the latest library `19.x` patch until Angular is upgraded. The legacy line is security-unsupported once `20.x` publishes, so upgrade Angular and resolve its migrations before installing the declarative major:

```bash
npm install @ramiz4/ngx-multi-level-push-menu@^20
```

## 2. Simplify standalone setup

The component no longer needs an application provider. Remove the helper from `app.config.ts` unless the application intentionally keeps it as a compatibility registration.

Before:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideMultiLevelPushMenu } from '@ramiz4/ngx-multi-level-push-menu';

export const appConfig: ApplicationConfig = {
  providers: [provideMultiLevelPushMenu()],
};
```

After:

```ts
import { Component } from '@angular/core';
import { MultiLevelPushMenuComponent } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  standalone: true,
  imports: [MultiLevelPushMenuComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

`provideMultiLevelPushMenu()` is still exported for compatibility, but it is deprecated and unnecessary because `MultiLevelPushMenuService` is root-provided.

## 3. Keep or modernize NgModule setup

Existing imports continue to work:

```ts
@NgModule({
  imports: [NgxMultiLevelPushMenuModule.forRoot()],
})
export class AppModule {}
```

You can simplify to `NgxMultiLevelPushMenuModule` without `forRoot()`, or import `MultiLevelPushMenuComponent` directly in the NgModule. The compatibility module is deprecated for new code, not removed.

The canonical element selector is now `ngx-multi-level-push-menu`. Existing
`ramiz4-multi-level-push-menu` templates continue to compile through a legacy
alias, so this rename can be adopted incrementally.

## 4. Prefer a separate menu input

`options.menu` remains supported, but `[menu]` separates data from presentation and accepts readonly arrays.

Before:

```ts
options = new MultiLevelPushMenuOptions({
  title: 'Products',
  menu: [{ id: 'all', name: 'All products', link: '/products' }],
});
```

After:

```ts
readonly menu: readonly MultiLevelPushMenuItem[] = [
  { id: 'all', name: 'All products', link: '/products' },
];

readonly options = new MultiLevelPushMenuOptions({ title: 'Products' });
```

```html
<ngx-multi-level-push-menu [menu]="menu" [options]="options">
  <router-outlet />
</ngx-multi-level-push-menu>
```

Important input semantics:

- Once `[menu]` is bound, it wins over `options.menu`.
- An explicitly bound `null` or `undefined` menu means an empty menu; remove the binding to use `options.menu`.
- Every `[options]` assignment is merged over fresh defaults. Do not depend on unspecified values carrying over from an older options object.
- Use immutable replacements for runtime changes so `OnPush` input detection is predictable.

## 5. Adopt controlled state and typed events

Two-way bind collapsed state when the parent needs to know or control it:

```html
<ngx-multi-level-push-menu [(collapsed)]="collapsed" (itemActivate)="onItemActivate($event)" (groupActivate)="onGroupActivate($event)" (levelChange)="activeDepth = $event" />
```

```ts
onItemActivate(event: MenuActivationEvent): void {
  // event.item, event.level, event.path, event.originalEvent
}
```

`itemClick` and `groupItemClick` still emit the item for compatibility. Prefer `itemActivate` and `groupActivate` when you need the complete typed context. `menuOpen`, `menuClose`, and `collapsedChange` now reflect actual state transitions.

The service observables `collapsed()`, `expanded()`, `onMenuItemClick()`, and `onGroupItemClick()` remain available. Component outputs are easier to scope and clean up in templates.

## 6. Target multiple menu instances

Legacy calls without a target still broadcast:

```ts
menuService.expand();
menuService.collapse();
```

For multiple menus, assign unique IDs and target commands:

```ts
primaryOptions = new MultiLevelPushMenuOptions({ menuID: 'primary' });
accountOptions = new MultiLevelPushMenuOptions({ menuID: 'account' });

menuService.openMenu('account');
menuService.navigateToLevel('security', 'account');
menuService.goBack('account');
menuService.collapse(undefined, 'account');
```

The first argument to `collapse` remains the optional depth, so pass `undefined` before a target ID for an ordinary targeted collapse. `closeMenu('account')` is the clearer alias.

## 7. Review navigation semantics

The Router is now optional. Eligible internal, same-context links use Angular Router when present. External URLs, protocol-relative URLs, fragments, modified clicks, and non-`_self` targets retain native browser behavior.

- `preventItemClick` keeps its legacy name. Its default `true` allows Angular Router interception; `false` forces native anchor navigation. Outputs emit in both cases.
- `preventGroupItemClick: true` stops the original group DOM event from bubbling; it does not suppress component/service outputs.
- `closeOnNavigation: true` collapses after navigation.
- `_blank` links get `noopener noreferrer` unless `rel` is explicitly provided.

Test guards, redirects, base href, modified clicks, external links, and analytics handlers after upgrading.

## 8. Convert length values

Numbers consistently mean pixels. Strings must be valid CSS lengths.

```ts
// Avoid: unitless strings are not valid CSS lengths.
{ menuWidth: '320', overlapWidth: '55' }

// Use either numbers (pixels) or units.
{ menuWidth: 320, overlapWidth: 55 }
{ menuWidth: '20rem', overlapWidth: '3.5rem', menuHeight: '100dvh' }
```

The new defaults are `menuWidth: '300px'`, `menuHeight: '100%'`, `overlapWidth: 55`, and `animationDuration: 280`.

## 9. Migrate styling

The imperative renderer's `.multilevelpushmenu-wrapper`, `.level-holder`, `.anchor`, `.title`, and related DOM structure are no longer a stable styling API. Remove selectors that depend on that markup.

Give the host a height and theme it through documented custom properties. A host class works from an application component stylesheet; no global stylesheet is required:

```html
<ngx-multi-level-push-menu class="brand-menu" />
```

```scss
ngx-multi-level-push-menu.brand-menu {
  display: block;
  height: 100dvh;
  --ngx-push-menu-background: #0b3d2e;
  --ngx-push-menu-surface: #115740;
  --ngx-push-menu-hover: #176b4e;
  --ngx-push-menu-active: #082d22;
  --ngx-push-menu-color: #fff;
  --ngx-push-menu-focus: #a7f3d0;
}
```

`wrapperClass`, `menuInactiveClass`, and `backItemClass` remain compatibility style hooks. Prefer a host class and custom properties over selectors tied to DOM nesting.

## 10. Validate icons

CSS class strings continue to work:

```ts
{ name: 'Home', icon: 'fa-solid fa-house' }
```

Inline SVG is intentionally stricter. It must be a complete SVG with a numeric four-value `viewBox` and at least one valid `<path>`. Only safe path/paint attributes are rendered. Shape elements, group transforms/styles, references, scripts, event attributes, and arbitrary markup are ignored or discarded.

```ts
const safeIcon = '<svg viewBox="0 0 24 24"><path d="M3 12 12 3l9 9v9h-6v-6H9v6H3z" fill="currentColor"/></svg>';
```

Convert `<circle>`, `<rect>`, `<polygon>`, and complex grouped icons to paths. If an SVG starts with `<` but fails validation, it renders blank rather than being interpreted as CSS classes.

## 11. Review accessibility behavior

The declarative renderer uses native controls, a navigation landmark, inactive-level `inert`, live announcements, and managed focus. Review application assumptions:

- Give each menu a useful, unique `ariaLabel`.
- Do not attach app shortcuts that conflict with Arrow, Home/End, or Escape behavior while focus is in the menu.
- Verify custom colors in normal, high-contrast, and forced-colors modes.
- Expect focus to move into a newly opened level and back to its parent group.
- Respect `disabled`; hiding a route is not authorization.

## 12. Verify SSR and zoneless applications

No special menu provider is required. Test server rendering and hydration with the real menu data. Application callbacks, data construction, and icon-loading code must also avoid browser globals on the server.

The component itself does not require Zone.js. In a zoneless application, verify user events, service commands, Router navigation, and parent-controlled `collapsed` updates.

## Upgrade checklist

- [ ] Angular, RxJS, and Node satisfy the supported ranges.
- [ ] Standalone provider registration was removed or intentionally retained.
- [ ] Menu arrays and option updates use immutable references.
- [ ] Unitless length strings were converted.
- [ ] Old internal DOM selectors were replaced with custom properties/style hooks.
- [ ] Every inline icon passes the path-only safe format.
- [ ] Internal, external, target, fragment, and modified-click navigation was tested.
- [ ] Multiple service-controlled menus use unique `menuID` targets.
- [ ] Keyboard, screen reader, RTL, reduced-motion, and contrast flows were checked.
- [ ] SSR/hydration and zoneless behavior were checked where used.
- [ ] Strict build, unit tests, and the consuming application's end-to-end tests pass.
