# NgxMultiLevelPushMenu

Multi-level push menu is cross-browser compatible angular 4+ component allowing endless nesting of navigation elements.

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Features](#features)

`@ramiz4/ngx-multi-level-push-menu` is an Angular component for generating a fancy push menu. It was built for modern browsers using _TypeScript, CSS3 and HTML5_ and Angular `>=4.0.0`.

See the [changelog](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) for recent changes.


## Installation
To use @ramiz4/ngx-multi-level-push-menu in your project install it via [npm](https://www.npmjs.com/package/@ramiz4/ngx-multi-level-push-menu):
```bash
$ npm i @ramiz4/ngx-multi-level-push-menu --save
```

## Install dependencies
```bash
$ npm i jquery --save
```

```bash
$ npm i font-awesome --save
```

## Usage

#### 1. Update your `angular-cli.json`:
```json
"styles": [
  "../node_modules/font-awesome/css/font-awesome.min.css",
  "../node_modules/@ramiz4/ngx-multi-level-push-menu/assets/css/jquery.multilevelpushmenu.min.css",
  "styles.css"
],
"scripts": [
  "../node_modules/jquery/dist/jquery.min.js",
  "../node_modules/@ramiz4/ngx-multi-level-push-menu/assets/js/jquery.multilevelpushmenu.min.js"
],
```

#### 2. Import the `MultiLevelPushMenuModule` to `app.module.ts`:
Finally, you can use @ramiz4/ngx-multi-level-push-menu in your Angular project. You have to import `MultiLevelPushMenuModule` in the root NgModule `app.module.ts` of your application.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MultiLevelPushMenuModule, MultiLevelPushMenuService } from '@ramiz4/ngx-multi-level-push-menu';

import { AppComponent } from './app.component';
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
  { path: '**', component: PageNotFoundComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutUsComponent,
    CollectionsComponent,
    CreditsComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    MultiLevelPushMenuModule.forRoot()
  ],
  providers: [
    MultiLevelPushMenuService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

You need to add the RouterModule and define some routes. In this example there are defined 4 routes and therefor you need to create 4 components:

```bash
$ ng g component home && ng g component about-us && ng g component collections && ng g component credits && ng g component page-not-found
```

#### 3. Add menu options and items to `app.component.ts`:
```ts
import { Component, OnInit } from '@angular/core';
import { 
  MultiLevelPushMenuService, 
  MultiLevelPushMenu, 
  MultiLevelPushMenuOptions, 
  MultiLevelPushMenuItem 
} from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  defaultItems: Array<MultiLevelPushMenuItem> = new Array<MultiLevelPushMenuItem>();

  constructor(private mlpmService: MultiLevelPushMenuService) {}

  ngOnInit() {
    this.defaultItems.push(new MultiLevelPushMenuItem('Home', 'home'));
    this.defaultItems.push(new MultiLevelPushMenuItem('About us', 'about-us'));
    let options: MultiLevelPushMenuOptions = new MultiLevelPushMenuOptions();
    options.mode = 'cover';
    options.menu = new MultiLevelPushMenu('Explorer', 'explorer', 'fa fa-reorder', this.defaultItems);
    this.mlpmService.initialize(options);
  }

  resetMenu(): void {
    this.mlpmService.update(this.defaultItems);
  }

  updateMenu(): void {
    let newItems = new Array<MultiLevelPushMenuItem>();
    newItems.push(new MultiLevelPushMenuItem('Collections', 'collections'));
    newItems.push(new MultiLevelPushMenuItem('Credits', 'credits'));
    this.mlpmService.update(newItems);
  }
  
  collapseMenu() {
    this.mlpmService.collapse();
  }

  expandMenu() {
    this.mlpmService.expand();
  }
}
```
Full list of options is provided below.

#### 4. Replace content in `app.component.html`:
```html
<multi-level-push-menu>
  <button (click)="updateMenu()">update menu</button>
  <button (click)="resetMenu()">reset menu</button>
  <button (click)="collapseMenu()">collapse menu</button>
  <button (click)="expandMenu()">expand menu</button>
  <router-outlet></router-outlet>
</multi-level-push-menu>
```


#### 6. Run your app from your project directory:
```bash
$ npm start
```

### Options

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


## Features
- Multi-level menu support
- Endless nesting of navigation elements
- Expand/Collapse navigation with a left/right swipe gesture
- Push/Slide DOM elements of choice
- Left-to-right and Right-to-left sliding directions
- Flexible, simple markup
- JS Array input, as HTML markup replacement
- A number of exposed Options (1 NEW! added), Methods (3 NEW! added) and Events
- Cross-browser compatibility
    - Chrome
    - Midori
    - Firefox
    - Safari
    - IE8+
    - Opera 12.16
    - Android Browser 4.1.2
    - iOS Safari 7.0.1
- AoT Compilation Support
