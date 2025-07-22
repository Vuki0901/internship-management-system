import {Routes} from '@angular/router';
import {Dashboard} from './dashboard/dashboard';
import {AppLayout} from '../layout/component/app.layout';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {path: '', component: Dashboard,},
      {path: 'users', loadComponent: () => import('../users/users.component').then(m => m.UsersComponent)},
      {path: 'internship-providers', loadComponent: () => import('../internship-providers/internship-providers.component').then(m => m.InternshipProvidersComponent)},
      {path: 'documents', loadComponent: () => import('../documents/documents.component').then(m => m.DocumentsComponent)},
    ]
  }
];
