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
| --------------- | --------------- |
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
    NgxMultiLevelPushMenuModule.forRoot(),
  ],
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
  ],
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

You can use either SVG content directly or CSS classes from an icon library for your menu icons.

#### Option 1: Using SVG icons directly (recommended)

```ts
import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  options = new MultiLevelPushMenuOptions();

  constructor(private menuService: MultiLevelPushMenuService) {}

  ngOnInit() {
    // Menu configuration with SVG icons
    this.options.title = 'All Categories';

    // Define menu items with SVG icons
    this.options.menu = [
      {
        name: 'Home',
        // SVG home icon
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>',
        link: 'home',
      },
      {
        name: 'Products',
        // SVG shopping bag icon
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M160 112c0-35.3 28.7-64 64-64s64 28.7 64 64v48H160V112zm-48 48H48c-26.5 0-48 21.5-48 48V416c0 53 43 96 96 96H352c53 0 96-43 96-96V208c0-26.5-21.5-48-48-48H336V112C336 50.1 285.9 0 224 0S112 50.1 112 112v48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/></svg>',
        items: [
          {
            name: 'Electronics',
            items: [
              { name: 'Smartphones', link: 'smartphones' },
              { name: 'Laptops', link: 'laptops' },
            ],
          },
        ],
      },
    ];

    // Set default back and group icons
    this.options.backItemIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/></svg>';
    this.options.groupIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>';

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

#### Option 2: Using CSS classes from an icon library

If you prefer using an icon library like Font Awesome, include it in your project and use CSS classes:

```ts
import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  options = new MultiLevelPushMenuOptions();

  constructor(private menuService: MultiLevelPushMenuService) {}

  ngOnInit() {
    // Menu configuration with Font Awesome icons
    this.options.title = 'All Categories';

    // Define menu items
    this.options.menu = [
      {
        name: 'Home',
        icon: 'fa fa-home',
        link: 'home',
      },
      {
        name: 'Products',
        icon: 'fa fa-shopping-bag',
        items: [
          {
            name: 'Electronics',
            items: [
              { name: 'Smartphones', link: 'smartphones' },
              { name: 'Laptops', link: 'laptops' },
            ],
          },
        ],
      },
    ];

    // Optional: Set additional options
    this.options.mode = 'overlap';
    this.options.collapsed = false;

    // Font Awesome icon classes for back and group icons
    this.options.backItemIcon = 'fa fa-angle-right';
    this.options.groupIcon = 'fa fa-angle-left';
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
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
```

## Component API

### Inputs

| Name    | Type                      | Default | Description           |
| ------- | ------------------------- | ------- | --------------------- |
| options | MultiLevelPushMenuOptions | {}      | Configuration options |

### Outputs

| Name        | Type                  | Description                       |
| ----------- | --------------------- | --------------------------------- |
| menuOpen    | EventEmitter<boolean> | Emitted when menu is opened       |
| menuClose   | EventEmitter<boolean> | Emitted when menu is closed       |
| itemClick   | EventEmitter<any>     | Emitted when menu item is clicked |
| levelChange | EventEmitter<number>  | Emitted when menu level changes   |

## Service API

The `MultiLevelPushMenuService` provides methods to control the menu programmatically:

| Method              | Parameters | Description                      |
| ------------------- | ---------- | -------------------------------- |
| collapse()          | none       | Collapses the menu               |
| expand()            | none       | Expands the menu                 |
| toggleMenu()        | none       | Toggles menu between states      |
| openMenu()          | none       | Opens the menu                   |
| closeMenu()         | none       | Closes the menu                  |
| navigateToLevel(id) | id: string | Navigates to specific menu level |
| goBack()            | none       | Navigates to previous menu level |

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
  backItemIcon: '<svg>...</svg>',     // Icon for back item (SVG content or CSS class)
  groupIcon: '<svg>...</svg>',        // Icon for items with submenus (SVG content or CSS class)
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
  title: 'Menu Title',                // Title displayed at the top
  id: 'menuID',                       // Unique identifier
  icon: '<svg>...</svg>',             // Icon (SVG content or CSS class)
  items: [                            // Array of menu items
    {
      name: 'Home',                   // Display name
      id: 'home',                     // Unique identifier (optional)
      icon: '<svg>...</svg>',         // Icon (SVG content or CSS class)
      link: 'home',                   // Router link (optional)
      items: []                       // Child items (optional)
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
- Flexible icon support - use SVG content directly or CSS classes from any icon library
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

This library supports two ways to provide icons:

1. **SVG content directly** (recommended):

   - Better performance and accessibility
   - No external dependencies
   - Example: `icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">...</svg>'`

2. **CSS classes from icon libraries**:
   - For Font Awesome 4.x: `icon: 'fa fa-home'`
   - For Font Awesome 5+: `icon: 'fas fa-home'`
   - Other icon libraries with similar class-based approaches

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
