# NgxMultiLevelPushMenu

Multi-level push menu is cross-browser compatible angular 4+ component allowing endless nesting of navigation elements.

[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg?style=flat-square)](https://renovateapp.com/)
[![CircleCI](https://img.shields.io/circleci/project/github/dherges/ng-packaged/master.svg?style=flat-square&label=Circle%20CI)](https://circleci.com/gh/dherges/ng-packaged)


> `ngx-multi-level-push-menu` is an Angular component for generating a fancy push menu. It was built for modern browsers using _TypeScript, CSS3 and HTML5_ and Angular `>=4.0.0`.

See the [changelog](https://github.com/ramiz4/ngx-multi-level-push-menu/releases) for recent changes.

This repository features the `@ramiz4/ngx-multi-level-push-menu` library package: `@ramiz4/ngx-multi-level-push-menu` is packaged with [ng-packagr](https://github.com/dherges/ng-packagr) and then imported into an Angular CLI app.
To run the example, do the following steps:

```bash
$ yarn install
$ yarn build:lib
$ ng serve
```


#### Build

Now, build your library:

```bash
$ yarn build:lib
```


Finally, include in your application.
In `app.module.ts`:

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MultiLevelPushMenuModule } from '@ramiz4/ngx-multi-level-push-menu';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: '**', component: PageNotFoundComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    MultiLevelPushMenuModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

And use them in components like `app.component.ts`:

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
}
```

in `app.component.html`
```html
<multi-level-push-menu>
    <button (click)="updateMenu()">update menu</button>
    <button (click)="resetMenu()">reset menu</button>
    <router-outlet></router-outlet>
</multi-level-push-menu>
```