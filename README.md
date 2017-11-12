# NgxMultiLevelPushMenu

Multi-level push menu is cross-browser compatible angular 4+ component allowing endless nesting of navigation elements.

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Features](#features)

`ngx-multi-level-push-menu` is an Angular component for generating a fancy push menu. It was built for modern browsers using _TypeScript, CSS3 and HTML5_ and Angular `>=4.0.0`.

See the [changelog](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) for recent changes.


## Installation
To use ngx-multi-level-push-menu in your project install it via [npm](https://www.npmjs.com/package/ngx-multi-level-push-menu):
```
npm i ngx-multi-level-push-menu --save
````

## Usage

#### 1. Update you `angular-cli.json`:
```json
"styles": [
  "../node_modules/font-awesome/css/font-awesome.min.css",
  "../node_modules/ngx-multi-level-push-menu/dist/css/jquery.multilevelpushmenu.min.css",
  "styles.css"
],
"scripts": [
  "../node_modules/jquery/dist/jquery.min.js",
  "../node_modules/ngx-multi-level-push-menu/dist/js/jquery.multilevelpushmenu.min.js"
],
```

#### 2. Import the `MultiLevelPushMenuModule` to `app.module.ts`:
Finally, you can use ngx-multi-level-push-menu in your Angular project. You have to import `MultiLevelPushMenuModule` in the root NgModule `app.module.ts` of your application.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MultiLevelPushMenuModule } from 'ngx-multi-level-push-menu';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CollectionsComponent } from './collections/collections.component';
import { CreditsComponent } from './credits/credits.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'collections', component: CollectionsComponent },
  { path: 'credits', component: CreditsComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CollectionsComponent,
    CreditsComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    MultiLevelPushMenuModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

You need to add the RouterModule and define some routes. In this example there are defined 4 routes and therefor you need to create 4 components:

```shell
ng g component home && ng g component collections && ng g component credits && ng g component page-not-found
```

#### 3. Add menu options and items to `app.component.ts`:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  myMenuOptions = {
    // menuWidth: 500
  };
  myMenuItems = [
    {
      title: 'All Categories',
      id: 'menuID',
      icon: 'fa fa-reorder',
      items: [
        {
          name: 'Devices',
          id: 'itemID',
          icon: 'fa fa-laptop',
          link: '#',
          items: [
            {
              title: 'Devices',
              icon: 'fa fa-laptop',
              items: [
                {
                  name: 'Mobile Phones',
                  icon: 'fa fa-phone',
                  link: '#',
                  items: [
                    {
                      title: 'Mobile Phones',
                      icon: 'fa fa-phone',
                      link: '#',
                      items: [
                        {
                          name: 'Super Smart Phone',
                          link: '#'
                        }
                      ]
                    }
                  ]
                },
                {
                  name: 'Televisions',
                  icon: 'fa fa-desktop',
                  link: '#',
                  items: [
                    {
                      title: 'Televisions',
                      icon: 'fa fa-desktop',
                      link: '#',
                      items: [
                        {
                          name: 'Flat Super Screen',
                          link: '#'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'Magazines',
          icon: 'fa fa-book',
          link: '#',
          items: [
            {
              title: 'Magazines',
              icon: 'fa fa-book',
              items: [
                {
                  name: 'National Geographics',
                  link: '#'
                },
                {
                  name: 'Scientific American',
                  link: '#'
                }
              ]
            }
          ]
        },
        {
          name: 'Collections',
          link: 'collections'
        },
        {
          name: 'Credits',
          link: 'credits'
        }
      ]
    }
  ];
}
```
Full list of options is provided below.

#### 4. Replace content in `app.component.html`:
```
<multi-level-push-menu [menu]="myMenuItems" [options]="myMenuOptions">
  <router-outlet></router-outlet>
</multi-level-push-menu>
```

#### 5. Run your app from your project directory:
```
npm start
```

#### 6. Update your `src/style.css` (Optional step):
```
html, body {
    margin: 0;
}
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
