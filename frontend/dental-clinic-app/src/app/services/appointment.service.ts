import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentListResponse,
  TimeSlot,
  AppointmentStatus
} from '../models/appointment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/appointments`;

  createAppointment(request: AppointmentCreateRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, request);
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  getAllAppointments(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'appointmentDate',
    sortDirection: string = 'ASC',
    filters?: {
      patientId?: string;
      doctorId?: string;
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<AppointmentListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters) {
      if (filters.patientId) params = params.set('patientId', filters.patientId);
      if (filters.doctorId) params = params.set('doctorId', filters.doctorId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<AppointmentListResponse>(this.apiUrl, { params });
  }

  getUpcomingAppointments(page: number = 0, size: number = 10): Observable<AppointmentListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AppointmentListResponse>(`${this.apiUrl}/upcoming`, { params });
  }

  getAppointmentsByDateRange(start: string, end: string): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get<Appointment[]>(`${this.apiUrl}/by-date-range`, { params });
  }

  updateAppointment(id: string, request: AppointmentUpdateRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, request);
  }

  cancelAppointment(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAvailableSlots(doctorId: string, date: string): Observable<TimeSlot[]> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date);

    return this.http.get<TimeSlot[]>(`${this.apiUrl}/available-slots`, { params });
  }

  checkAvailability(doctorId: string, appointmentDate: string, duration: number): Observable<boolean> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('appointmentDate', appointmentDate)
      .set('duration', duration.toString());

    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, { params });
  }
}
