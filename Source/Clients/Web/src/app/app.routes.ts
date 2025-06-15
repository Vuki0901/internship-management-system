import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './shared/login/login.component';
import { StudentDashboardComponent } from './students/dashboard/dashboard.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { AdminGuard } from './shared/auth/admin.guard';
import { StudentGuard } from './shared/auth/student.guard';
import { MentorGuard } from './shared/auth/mentor.guard';
import { SupervisorGuard } from './shared/auth/supervisor.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'student/login',
    pathMatch: 'full'
  },
  {
    path: 'student/login',
    component: LoginComponent,
    data: { role: 'Student' }
  },
  {
    path: 'admin/login',
    component: LoginComponent,
    data: { role: 'Admin' }
  },
  {
    path: 'supervisor/login',
    component: LoginComponent,
    data: { role: 'Supervisor' }
  },
  {
    path: 'mentor/login',
    component: LoginComponent,
    data: { role: 'Mentor' }
  },
  {
    path: 'student',
    component: LayoutComponent,
    canActivate: [StudentGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: StudentDashboardComponent
      },
      {
        path: 'internships',
        loadComponent: () => import('./students/internships/internships.component').then(m => m.StudentInternshipsComponent)
      },
      {
        path: 'apply-internship',
        redirectTo: 'internships',
        pathMatch: 'full'
      },
      {
        path: 'documents',
        loadComponent: () => import('./students/documents/documents.component').then(m => m.StudentDocumentsComponent)
      },
      {
        path: 'internship',
        loadComponent: () => import('./students/internship/internship.component').then(m => m.StudentInternshipComponent)
      },
      {
        path: 'internships/:id/report',
        loadComponent: () => import('./students/report/student-report.component').then(m => m.StudentReportComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./administration/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./administration/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'internship-providers',
        loadComponent: () => import('./administration/internship-providers/internship-providers.component').then(m => m.InternshipProvidersComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./administration/documents/documents.component').then(m => m.DocumentsComponent)
      }
    ]
  },
  {
    path: 'supervisor',
    component: LayoutComponent,
    canActivate: [SupervisorGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./internship-supervisors/dashboard/dashboard.component').then(m => m.SupervisorDashboardComponent)
      },
      {
        path: 'internships',
        loadComponent: () => import('./internship-supervisors/internships/internships.component').then(m => m.SupervisorInternshipsComponent)
      },
      {
        path: 'pending-reports',
        loadComponent: () => import('./internship-supervisors/pending-reports/pending-reports.component').then(m => m.SupervisorPendingReportsComponent)
      },
      {
        path: 'providers',
        loadComponent: () => import('./internship-supervisors/providers/providers.component').then(m => m.SupervisorProvidersComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./students/documents/documents.component').then(m => m.StudentDocumentsComponent)
      },
      {
        path: 'internships/:id/report',
        loadComponent: () => import('./internship-supervisors/report/supervisor-report.component').then(m => m.SupervisorReportComponent)
      }
    ]
  },
  {
    path: 'mentor',
    component: LayoutComponent,
    canActivate: [MentorGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./mentors/dashboard/dashboard.component').then(m => m.MentorDashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./mentors/internship-applications/internship-applications.component').then(m => m.InternshipApplicationsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./mentors/students/students.component').then(m => m.MentorStudentsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./students/documents/documents.component').then(m => m.StudentDocumentsComponent)
      },
      {
        path: 'internships/:id/report',
        loadComponent: () => import('./mentors/report/mentor-report.component').then(m => m.MentorReportComponent)
      }
    ]
  }
];
