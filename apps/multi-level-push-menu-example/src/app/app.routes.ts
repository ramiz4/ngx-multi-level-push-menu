import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CollectionsComponent } from './collections/collections.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GuidesComponent } from './guides/guides.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'about-us', redirectTo: 'about', pathMatch: 'full' },
  { path: 'collections', component: CollectionsComponent },
  { path: 'guides', component: GuidesComponent },
  { path: 'release-notes', component: ReleaseNotesComponent },
  { path: 'credits', redirectTo: 'guides', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];
