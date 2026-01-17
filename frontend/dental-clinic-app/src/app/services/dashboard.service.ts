import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardStats,
  AppointmentsByStatus,
  RevenueByMonth,
  RecentAppointment
} from '../models/dashboard.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dashboard`;

  getStatistics(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getAppointmentsByStatus(): Observable<AppointmentsByStatus[]> {
    return this.http.get<AppointmentsByStatus[]>(`${this.apiUrl}/appointments-by-status`);
  }

  getRevenueByMonth(): Observable<RevenueByMonth[]> {
    return this.http.get<RevenueByMonth[]>(`${this.apiUrl}/revenue-by-month`);
  }

  getUpcomingAppointments(limit: number = 10): Observable<RecentAppointment[]> {
    return this.http.get<RecentAppointment[]>(`${this.apiUrl}/upcoming-appointments?limit=${limit}`);
  }

  getRecentAppointments(limit: number = 5): Observable<RecentAppointment[]> {
    return this.http.get<RecentAppointment[]>(`${this.apiUrl}/recent-appointments?limit=${limit}`);
  }
}
