import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MultiLevelPushMenuService,
  NgxMultiLevelPushMenuModule,
} from '@ramiz4/ngx-multi-level-push-menu';
import { AboutUsComponent } from './about-us/about-us.component';
import { AppComponent } from './app.component';
import { CollectionsComponent } from './collections/collections.component';
import { CreditsComponent } from './credits/credits.component';
import { HomeComponent } from './home/home.component';
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
  declarations: [
    AppComponent,
    HomeComponent,
    AboutUsComponent,
    CollectionsComponent,
    CreditsComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
    NgxMultiLevelPushMenuModule.forRoot(),
  ],
  providers: [MultiLevelPushMenuService],
  bootstrap: [AppComponent],
})
export class AppModule {}
