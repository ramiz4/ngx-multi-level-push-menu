# NgxMultiLevelPushMenu

<a href="https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu"><img src="https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu.svg" alt="npm version" height="18"></a>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Angular component for creating accessible, responsive multi-level push menus with extensive customization options.

- [Angular Compatibility](#angular-compatibility)
- [Installation](#installation)
- [Usage](#usage)
- [Component API](#component-api)
- [Service API](#service-api)
- [Options](#options)
- [Menu Structure](#menu-structure)
- [Features](#features)
- [Common Issues & Solutions](#common-issues--solutions)
- [Accessibility](#accessibility)
- [Performance Considerations](#performance-considerations)
- [Demo](#demo)

See the [changelog](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) for recent changes.

## Angular Compatibility

| Library Version | Angular Version |
|-----------------|-----------------|
| 1.x.x           | 6.x - 8.x       |
| 2.x.x           | 9.x - 11.x      |
| 3.x.x - 12.x.x  | Not Available   |
| 13.x.x - 14.x.x | 12.x - 14.x     |
| 16.x.x - 17.x.x | 15.x - 17.x     |
| 18.x.x - 19.x.x | 18.x - 19.x     |

## Installation

```bash
npm i @ramiz4/ngx-multi-level-push-menu --save
```

### Install dependencies

```bash
# For Font Awesome 4.x
npm i font-awesome --save

# OR for Font Awesome 5+/6+ (recommended for newer projects)
npm i @fortawesome/fontawesome-free --save
```

## Usage

### 1. Update your `angular.json`

```json
"styles": [
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "styles.css"
],
"scripts": [],
```

### 2. Import the module

#### For NgModule-based applications:

```ts
import { NgxMultiLevelPushMenuModule, MultiLevelPushMenuService } from '@ramiz4/ngx-multi-level-push-menu';

@NgModule({
  imports: [
    // ...
    NgxMultiLevelPushMenuModule.forRoot()
  ]
})
export class AppModule {}
```

#### For standalone applications (Angular 14+):

```ts
// In app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideMultiLevelPushMenu } from '@ramiz4/ngx-multi-level-push-menu';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...other providers
    provideMultiLevelPushMenu(),
  ]
};
```

```ts
// In your component
import { Component } from '@angular/core';
import { MultiLevelPushMenuComponent } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  // ...
  standalone: true,
  imports: [MultiLevelPushMenuComponent],
})
export class AppComponent {
  // ...
}
```

### 3. Configure your component

```ts
import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  options = new MultiLevelPushMenuOptions();

  constructor(private menuService: MultiLevelPushMenuService) {}

  ngOnInit() {
    // Menu configuration
    this.options.menu = {
      title: 'All Categories',
      id: 'menu',
      icon: 'fas fa-bars'
    };
    
    // Define menu items
    this.options.menu.items = [
      {
        name: 'Home',
        icon: 'fas fa-home',
        link: 'home'
      },
      {
        name: 'Products',
        icon: 'fas fa-shopping-bag',
        items: [
          {
            name: 'Electronics',
            items: [
              { name: 'Smartphones', link: 'smartphones' },
              { name: 'Laptops', link: 'laptops' }
            ]
          }
        ]
      }
    ];
    
    // Optional: Set additional options
    this.options.mode = 'overlap';
    this.options.collapsed = false;
  }

  // Control methods
  collapseMenu(): void {
    this.menuService.collapse();
  }

  expandMenu(): void {
    this.menuService.expand();
  }
}
```

### 4. Add to your template

```html
<ramiz4-multi-level-push-menu [options]="options">
  <button (click)="collapseMenu()">Collapse Menu</button>
  <button (click)="expandMenu()">Expand Menu</button>
  <router-outlet></router-outlet>
</ramiz4-multi-level-push-menu>
```

### 5. Add styles (optional)

```css
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
```

## Component API

### Inputs

| Name    | Type                       | Default | Description                     |
|---------|----------------------------|---------|----------------------------------|
| options | MultiLevelPushMenuOptions  | {}      | Configuration options            |

### Outputs

| Name       | Type                  | Description                           |
|------------|------------------------|---------------------------------------|
| menuOpen   | EventEmitter<boolean> | Emitted when menu is opened           |
| menuClose  | EventEmitter<boolean> | Emitted when menu is closed           |
| itemClick  | EventEmitter<any>     | Emitted when menu item is clicked     |
| levelChange| EventEmitter<number>  | Emitted when menu level changes       |

## Service API

The `MultiLevelPushMenuService` provides methods to control the menu programmatically:

| Method               | Parameters | Description                         |
|----------------------|------------|-------------------------------------|
| collapse()           | none       | Collapses the menu                  |
| expand()             | none       | Expands the menu                    |
| toggleMenu()         | none       | Toggles menu between states         |
| openMenu()           | none       | Opens the menu                      |
| closeMenu()          | none       | Closes the menu                     |
| navigateToLevel(id)  | id: string | Navigates to specific menu level    |
| goBack()             | none       | Navigates to previous menu level    |

## Options

```typescript
// Default options
{
  collapsed: false,                   // Initialize menu collapsed
  menuID: 'multilevelpushmenu',       // ID for the menu
  wrapperClass: 'multilevelpushmenu_wrapper',
  menuInactiveClass: 'multilevelpushmenu_inactive',
  menu: [],                           // Menu structure
  menuWidth: 0,                       // Width of menu (integer, %, px, em)
  menuHeight: 0,                      // Height of menu
  backText: 'Back',                   // Text for back menu item
  backItemClass: 'backItemClass',     // CSS class for back item
  backItemIcon: 'fa fa-angle-right',  // Icon for back item (use fas for FA5+)
  groupIcon: 'fa fa-angle-left',      // Icon for items with submenus
  mode: 'overlap',                    // Menu sliding mode: overlap/cover
  overlapWidth: 40,                   // Width of menu overlap in px
  preventItemClick: true,             // Event callback per item click
  preventGroupItemClick: true,        // Event callback per group item click
  direction: 'ltr',                   // Direction: ltr/rtl
  fullCollapse: false,                // Hide base level when collapsed
  swipe: 'both'                       // Swipe support: both/touchscreen/desktop/none
}
```

## Menu Structure

The menu structure follows this format:

```typescript
{
  title: 'Menu Title',    // Title displayed at the top
  id: 'menuID',           // Unique identifier
  icon: 'fas fa-bars',    // Icon class
  items: [                // Array of menu items
    {
      name: 'Home',       // Display name
      id: 'home',         // Unique identifier (optional)
      icon: 'fas fa-home',// Icon class (optional)
      link: 'home',       // Router link (optional)
      items: []           // Child items (optional)
    }
  ]
}
```

**Important**: Each submenu should be defined directly within an `items` array. Don't add extra wrapper objects around menu items.

## Features

- Multi-level menu support with endless nesting
- Expand/Collapse navigation with left/right swipe gestures
- Support for both overlay and cover sliding modes
- Flexible sizing options
- Left-to-right and Right-to-left sliding directions
- Font Awesome icon integration
- Keyboard navigation and accessibility features
- Customizable styling
- Cross-browser compatibility
- Angular Versions Support (6+)
- AoT Compilation Support

## Common Issues & Solutions

### Menu not visible on init

If your menu is not visible initially, check:
- Ensure `options.collapsed` is set to `false`
- Verify CSS is properly loaded
- Check console for errors

### Submenu items not appearing

Ensure your menu structure is correct:

```typescript
// Correct structure
{
  name: 'Products',
  items: [
    { name: 'Item 1' },
    { name: 'Item 2' }
  ]
}

// Incorrect structure
{
  name: 'Products',
  items: {
    item1: { name: 'Item 1' },
    item2: { name: 'Item 2' }
  }
}
```

### Mobile Support

Configure the swipe behavior with the `swipe` option:
- `both`: Support touch and mouse (default)
- `touchscreen`: Support only touch
- `desktop`: Support only mouse
- `none`: Disable swipe support

### Font Awesome Version Compatibility

For Font Awesome 5+:
- Update icon prefixes from `fa fa-` to `fas fa-`
- Example: `backItemIcon: 'fas fa-angle-right'`

## Accessibility

The component includes several accessibility enhancements:
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Screen reader announcements for menu changes

## Performance Considerations

For large menus, consider:
- Lazy loading submenus
- Using `trackBy` with `*ngFor` directives
- Implementing virtual scrolling for very large menus

## Demo

To view the demo:

```bash
git clone https://github.com/ramiz4/ngx-multi-level-push-menu.git
cd ngx-multi-level-push-menu
npm install
npm start
```

Then navigate to `http://localhost:4200`
