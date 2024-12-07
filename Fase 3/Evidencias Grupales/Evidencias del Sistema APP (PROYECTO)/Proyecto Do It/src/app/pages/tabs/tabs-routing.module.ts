import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./profile/profile.module').then((m) => m.ProfilePageModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsPageModule),
      },
      {
        path: 'subjects',
        loadChildren: () => import('./subjects/subjects.module').then(m => m.SubjectsPageModule)
      },
      // Redirección predeterminada a /home
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'calendar',
        loadChildren: () => import('./calendar/calendar.module').then( m => m.CalendarPageModule)
      },
      {
        path: 'notes',
        loadChildren: () => import('./notes/notes.module').then( m => m.NotesPageModule)
      },
      {
        path: 'reminders',
        loadChildren: () => import('./reminders/reminders.module').then( m => m.RemindersPageModule)
      },
      {
        path: 'feriados',
        loadChildren: () => import('./feriados/feriados.module').then( m => m.FeriadosPageModule)
      },
      {
        path: 'about-us',
        loadChildren: () => import('./about-us/about-us.module').then( m => m.AboutUsPageModule)
      },
      {
        path: 'book-search',
        loadChildren: () => import('./book-search/book-search.module').then( m => m.BookSearchPageModule)
      },
    
    ],
  },
  // En caso de rutas no encontradas
  {
    path: '**',
    redirectTo: 'dashboard',
  },
  {
    path: 'book-search',
    loadChildren: () => import('./book-search/book-search.module').then( m => m.BookSearchPageModule)
  },






];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
