# NgxMultiLevelPushMenu

[![npm version](https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu.svg)](https://badge.fury.io/js/@ramiz4%2Fngx-multi-level-push-menu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Multi-level push menu is a cross-browser compatible Angular component allowing endless nesting of navigation elements.

`@ramiz4/ngx-multi-level-push-menu` is built for modern browsers using _TypeScript, CSS3 and HTML5_ and is compatible with **Angular 6+** up through **Angular 19+**.

## Angular Compatibility

| Library Version | Angular Version |
|-----------------|-----------------|
| 1.x.x           | 6.x - 8.x       |
| 2.x.x           | 9.x - 11.x      |
| 3.x.x - 12.x.x  | Not Available   |
| 13.x.x - 14.x.x | 12.x - 14.x     |
| 16.x.x - 17.x.x | 15.x - 17.x     |
| 18.x.x - 19.x.x | 18.x - 19.x     |

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Features](#features)
- [Common Issues & Solutions](#common-issues--solutions)
- [Demo](#demo)

See the [changelog](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) for recent changes.

## Installation

To use @ramiz4/ngx-multi-level-push-menu in your project, install it via [npm](https://www.npmjs.com/package/@ramiz4/ngx-multi-level-push-menu):

```bash
npm i @ramiz4/ngx-multi-level-push-menu --save
```

## Install dependencies

The component requires Font Awesome for icons. You can use either Font Awesome 4.x, 5.x, or 6.x:

### Font Awesome 4.x (Classic):

```bash
npm i font-awesome --save
```

### Font Awesome 5.x or 6.x (Recommended for newer projects):

```bash
npm i @fortawesome/fontawesome-free --save
```

## Usage

### 1. Update your `angular.json`

For Font Awesome 4.x:

```json
"styles": [
  "node_modules/font-awesome/css/font-awesome.min.css",
  "styles.css"
],
"scripts": [],
```

For Font Awesome 5.x or 6.x:

```json
"styles": [
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "styles.css"
],
"scripts": [],
```

### 2. Import the `NgxMultiLevelPushMenuModule` to `app.module.ts`

Import `NgxMultiLevelPushMenuModule.forRoot()` in the root NgModule `app.module.ts` of your application.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxMultiLevelPushMenuModule, MultiLevelPushMenuService } from '@ramiz4/ngx-multi-level-push-menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NgxMultiLevelPushMenuModule.forRoot()],
  providers: [MultiLevelPushMenuService],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

You need to add the RouterModule and define some routes. In this example there are defined 4 routes and therefore you need to create 4 components:

```bash
ng g component home && ng g component about-us && ng g component collections && ng g component credits && ng g component page-not-found
```

**NOTE**
Angular automatically adds the declarations to the AppModule when generating the components. If you organize your routing as shown below, you should remove those declarations from AppModule.

Edit the generated app-routing.module.ts to this:

```ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CollectionsComponent } from './collections/collections.component';
import { CreditsComponent } from './credits/credits.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'collections', component: CollectionsComponent },
  { path: 'credits', component: CreditsComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  declarations: [HomeComponent, AboutUsComponent, CollectionsComponent, CreditsComponent, PageNotFoundComponent],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

### 3. Add menu options and items to `app.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  options = new MultiLevelPushMenuOptions();

  constructor(private multiLevelPushMenuService: MultiLevelPushMenuService) {}

  ngOnInit() {
    this.options.menu = {
      title: 'Company Name',
      id: 'menuID',
      icon: 'fa fa-reorder', // Use 'fas fa-bars' for Font Awesome 5+
    };
    this.options.menu.items = [
      { name: 'Home', id: 'home', icon: 'fa fa-home', link: 'home' }, // Use 'fas fa-home' for Font Awesome 5+
      {
        name: 'About Us',
        id: 'about-us',
        icon: 'fa fa-user', // Use 'fas fa-user' for Font Awesome 5+
        link: 'about-us',
      },
      {
        name: 'Devices',
        id: 'devices',
        icon: 'fa fa-laptop', // Use 'fas fa-laptop' for Font Awesome 5+
        link: '#',
        items: [
          {
            name: 'Mobile Phones',
            icon: 'fa fa-phone', // Use 'fas fa-phone' for Font Awesome 5+
            link: '#',
            items: [
              {
                name: 'Super Smart Phone',
                link: 'xxx',
              },
              {
                name: 'Thin Magic Mobile',
                link: 'xxx',
              },
            ],
          },
          {
            name: 'Televisions',
            icon: 'fa fa-desktop', // Use 'fas fa-desktop' for Font Awesome 5+
            link: '#',
            items: [
              {
                name: 'Flat Super Screen',
                link: '#',
              },
              {
                name: 'Gigantic LED',
                link: '#',
              },
            ],
          },
        ],
      },
      {
        name: 'Collections',
        link: 'collections',
      },
      {
        name: 'Credits',
        link: 'credits',
      },
    ];
  }

  collapseMenu(): void {
    this.multiLevelPushMenuService.collapse();
  }

  expandMenu(): void {
    this.multiLevelPushMenuService.expand();
  }
}
```

**Important**: Note the menu structure. Each submenu should be defined directly with an `items` array containing its child items. Don't add extra wrapper objects around menu items.

> **Font Awesome 5+ Note**: If using Font Awesome 5+, use class naming pattern `fas fa-icon-name` instead of `fa fa-icon-name`. Update the icon classes in your menu configuration and the options accordingly.

### 4. Replace content in `app.component.html`

```html
<ramiz4-multi-level-push-menu [options]="options">
  <button (click)="collapseMenu()">collapse menu</button>
  <button (click)="expandMenu()">expand menu</button>
  <router-outlet></router-outlet>
</ramiz4-multi-level-push-menu>
```

### 5. Add to `styles.css` (optional)

```css
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
```

### 6. Run your app from your project directory

```bash
npm start
```

## Options

```typescript
collapsed: false,                                          // Initialize menu in collapsed/expanded mode
menuID: 'multilevelpushmenu',                              // ID of <nav> element.
wrapperClass: 'multilevelpushmenu_wrapper',                // Wrapper CSS class.
menuInactiveClass: 'multilevelpushmenu_inactive',          // CSS class for inactive wrappers.
menu: arrMenu,                                             // JS array of menu items (if markup not provided).
menuWidth: 0,                                              // Wrapper width (integer, '%', 'px', 'em').
menuHeight: 0,                                             // Menu height (integer, '%', 'px', 'em').
backText: 'Back',                                          // Text for 'Back' menu item.
backItemClass: 'backItemClass',                            // CSS class for back menu item.
backItemIcon: 'fa fa-angle-right',                         // FontAvesome icon used for back menu item.
groupIcon: 'fa fa-angle-left',                             // FontAvesome icon used for menu items contaning sub-items.
mode: 'overlap',                                           // Menu sliding mode: overlap/cover.
overlapWidth: 40,                                          // Width in px of menu wrappers overlap
preventItemClick: true,                                    // set to false if you do not need event callback functionality per item click
preventGroupItemClick: true,                               // set to false if you do not need event callback functionality per group item click
direction: 'ltr',                                          // set to 'rtl' for reverse sliding direction
fullCollapse: false,                                       // set to true to fully hide base level holder when collapsed
swipe: 'both'                                              // or 'touchscreen', or 'desktop', or 'none'. everything else is concidered as 'none'
```

## Features

- Multi-level menu support
- Endless nesting of navigation elements
- Expand/Collapse navigation with a left/right swipe gesture
- Push/Slide DOM elements of choice
- Left-to-right and Right-to-left sliding directions
- Flexible, simple markup
- JS Array input, as HTML markup replacement
- A number of exposed Options, Methods and Events
- Cross-browser compatibility
  - Chrome
  - Firefox
  - Safari
  - Edge
  - Android Browser
  - iOS Safari
- Angular Versions Support (6+)
- AoT Compilation Support
- Font Awesome 4.x, 5.x and 6.x support

## Common Issues & Solutions

### Menu not visible on init

If your menu is not visible when the application loads (shows as a collapsed menu with margin-left: -100%), make sure your `options` object has `collapsed` set to `false` (which is the default). The component now properly initializes in the expanded state.

### Submenu items not appearing

If clicking on menu items with children doesn't show the child menu items, check your menu structure. Each menu item with children should have an `items` array directly containing the child items. Avoid adding extra wrapper objects between a parent and its child items.

Correct structure:

```typescript
{
  name: 'Devices',
  id: 'devices',
  icon: 'fa fa-laptop',
  link: '#',
  items: [
    {
      name: 'Mobile Phones',
      icon: 'fa fa-phone',
      link: '#',
      items: [...]
    },
    {
      name: 'Televisions',
      icon: 'fa fa-desktop',
      link: '#',
      items: [...]
    }
  ]
}
```

### Mobile Support

The menu supports both touch and mouse interactions. You can customize this with the `swipe` option:

- `both`: Support both touch and mouse (default)
- `touchscreen`: Support only touch devices
- `desktop`: Support only mouse interactions
- `none`: Disable swipe support

### Custom Styling

You can customize the appearance of the menu by overriding the CSS classes in your global styles.

### Font Awesome Version Compatibility

If you're using Font Awesome 5+ and icons aren't showing, make sure to:

1. Update your icon class prefixes from `fa fa-` to `fas fa-`
2. Adjust the menu configuration, including `backItemIcon` and `groupIcon` options

## Demo

Check out the example project in the repository to see a live implementation:

```bash
git clone https://github.com/ramiz4/ngx-multi-level-push-menu.git
cd ngx-multi-level-push-menu
npm install
npm start
```

Then navigate to `http://localhost:4200` to view the demo.
