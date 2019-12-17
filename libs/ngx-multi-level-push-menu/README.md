# NgxMultiLevelPushMenu

Multi-level push menu is cross-browser compatible angular 6+ component allowing endless nesting of navigation elements.

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Features](#features)

`@ramiz4/ngx-multi-level-push-menu` is an Angular component for generating a fancy push menu. It was built for modern browsers using _TypeScript, CSS3 and HTML5_ and Angular `>=6.0.0`.

See the [changelog](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) for recent changes.


## Installation
To use @ramiz4/ngx-multi-level-push-menu in your project install it via [npm](https://www.npmjs.com/package/@ramiz4/ngx-multi-level-push-menu):
```bash
$ npm i @ramiz4/ngx-multi-level-push-menu --save
```

## Install dependencies
```bash
$ npm i jquery font-awesome --save
```

## Usage

#### 1. Update your `angular.json`:
```json
"styles": [
  "node_modules/font-awesome/css/font-awesome.min.css",
  "node_modules/@ramiz4/ngx-multi-level-push-menu/assets/css/jquery.multilevelpushmenu.css",
  "styles.css"
],
"scripts": [
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/@ramiz4/ngx-multi-level-push-menu/assets/js/jquery.multilevelpushmenu.js"
],
```

#### 2. Import the `MultiLevelPushMenuModule` to `app.module.ts`:
Finally, you can use @ramiz4/ngx-multi-level-push-menu in your Angular project. You have to import `NgMultiLevelPushMenuModule.forRoot()` in the root NgModule `app.module.ts` of your application.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxMultiLevelPushMenuModule, MultiLevelPushMenuService } from '@ramiz4/ngx-multi-level-push-menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxMultiLevelPushMenuModule.forRoot()
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
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    AboutUsComponent,
    CollectionsComponent,
    CreditsComponent,
    PageNotFoundComponent
  ],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

#### 3. Add menu options and items to `app.component.ts`:
```ts
import { Component, OnInit } from '@angular/core';
import { MultiLevelPushMenuService, MultiLevelPushMenuOptions } from '@ramiz4/ngx-multi-level-push-menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  options = new MultiLevelPushMenuOptions();

  constructor(private multiLevelPushMenuService: MultiLevelPushMenuService) { }

  ngOnInit() {
    this.options.menu = { title: 'Company Name', id: 'menuID', icon: 'fa fa-reorder' };
    this.options.menu.items = [
      { name: 'Home', id: 'home', icon: 'fa fa-home', link: 'home' },
      { name: 'About Us', id: 'about-us', icon: 'fa fa-user', link: 'about-us' },
      {
        name: 'Devices',
        id: 'devices',
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
                        link: 'xxx'
                      },
                      {
                        name: 'Thin Magic Mobile',
                        link: 'xxx'
                      },
                      {
                        name: 'Performance Crusher',
                        link: 'xxx'
                      },
                      {
                        name: 'Futuristic Experience',
                        link: 'xxx'
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
                      },
                      {
                        name: 'Gigantic LED',
                        link: '#'
                      },
                      {
                        name: 'Power Eater',
                        link: '#'
                      },
                      {
                        name: '3D Experience',
                        link: '#'
                      },
                      {
                        name: 'Classic Comfort',
                        link: '#'
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Cameras',
                icon: 'fa fa-camera-retro',
                link: '#',
                items: [
                  {
                    title: 'Cameras',
                    icon: 'fa fa-camera-retro',
                    link: '#',
                    items: [
                      {
                        name: 'Smart Shot',
                        link: '#'
                      },
                      {
                        name: 'Power Shooter',
                        link: '#'
                      },
                      {
                        name: 'Easy Photo Maker',
                        link: '#'
                      },
                      {
                        name: 'Super Pixel',
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
              },
              {
                name: 'The Spectator',
                link: '#'
              },
              {
                name: 'Rambler',
                link: '#'
              },
              {
                name: 'Physics World',
                link: '#'
              },
              {
                name: 'The New Scientist',
                link: '#'
              }
            ]
          }
        ]
      },
      {
        name: 'Store',
        icon: 'fa fa-shopping-cart',
        link: '#',
        items: [
          {
            title: 'Store',
            icon: 'fa fa-shopping-cart',
            items: [
              {
                name: 'Clothes',
                icon: 'fa fa-tags',
                link: '#',
                items: [
                  {
                    title: 'Clothes',
                    icon: 'fa fa-tags',
                    items: [
                      {
                        name: 'Women\'s Clothing',
                        icon: 'fa fa-female',
                        link: '#',
                        items: [
                          {
                            title: 'Women\'s Clothing',
                            icon: 'fa fa-female',
                            items: [
                              {
                                name: 'Tops',
                                link: '#'
                              },
                              {
                                name: 'Dresses',
                                link: '#'
                              },
                              {
                                name: 'Trousers',
                                link: '#'
                              },
                              {
                                name: 'Shoes',
                                link: '#'
                              },
                              {
                                name: 'Sale',
                                link: '#'
                              }
                            ]
                          }
                        ]
                      },
                      {
                        name: 'Men\'s Clothing',
                        icon: 'fa fa-male',
                        link: '#',
                        items: [
                          {
                            title: 'Men\'s Clothing',
                            icon: 'fa fa-male',
                            items: [
                              {
                                name: 'Shirts',
                                link: '#'
                              },
                              {
                                name: 'Trousers',
                                link: '#'
                              },
                              {
                                name: 'Shoes',
                                link: '#'
                              },
                              {
                                name: 'Sale',
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
                name: 'Jewelry',
                link: '#'
              },
              {
                name: 'Music',
                link: '#'
              },
              {
                name: 'Grocery',
                link: '#'
              }
            ]
          }
        ]
      },
      {
        name: 'Collections',
        link: '#'
      },
      {
        name: 'Credits',
        link: '#'
      }
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
Full list of options is provided below.

#### 4. Replace content in `app.component.html`:
```html
<ramiz4-multi-level-push-menu [options]="options">
  <button (click)="collapseMenu()">collapse menu</button>
  <button (click)="expandMenu()">expand menu</button>
  <router-outlet></router-outlet>
</ramiz4-multi-level-push-menu>
```

#### 5. Add to `styles.css` (optional):
```css
html, body {
  margin: 0;
}
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
