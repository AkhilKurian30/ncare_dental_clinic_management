import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'patients', component: DashboardComponent }, // Placeholder
      { path: 'appointments', component: DashboardComponent }, // Placeholder
      { path: 'treatments', component: DashboardComponent }, // Placeholder
      { path: 'medicines', component: DashboardComponent }, // Placeholder
      { path: 'invoices', component: DashboardComponent }, // Placeholder
      { path: 'expenses', component: DashboardComponent }, // Placeholder
      { path: 'reports', component: DashboardComponent }, // Placeholder
      { path: 'users', component: DashboardComponent } // Placeholder
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
