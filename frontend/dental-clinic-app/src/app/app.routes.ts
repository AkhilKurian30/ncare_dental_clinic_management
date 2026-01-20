import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { PatientListComponent } from './components/patients/patient-list/patient-list';
import { PatientFormComponent } from './components/patients/patient-form/patient-form';
import { PatientDetailsComponent } from './components/patients/patient-details/patient-details';
import { AppointmentListComponent } from './components/appointments/appointment-list/appointment-list';
import { AppointmentCalendarFullComponent } from './components/appointments/appointment-calendar-full/appointment-calendar-full';
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
      { path: 'patients', component: PatientListComponent },
      { path: 'patients/new', component: PatientFormComponent },
      { path: 'patients/:id/edit', component: PatientFormComponent },
      { path: 'patients/:id', component: PatientDetailsComponent },
      { path: 'appointments', component: AppointmentCalendarFullComponent },
      { path: 'appointments/list', component: AppointmentListComponent },
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
