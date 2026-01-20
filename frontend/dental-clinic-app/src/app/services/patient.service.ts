import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, PatientCreateRequest, PatientUpdateRequest, PatientListResponse } from '../models/patient.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/patients`;

  createPatient(request: PatientCreateRequest): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, request);
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  getAllPatients(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'DESC',
    activeOnly?: boolean
  ): Observable<PatientListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }

    return this.http.get<PatientListResponse>(this.apiUrl, { params });
  }

  searchPatients(
    query: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'firstName',
    sortDirection: string = 'ASC',
    activeOnly?: boolean
  ): Observable<PatientListResponse> {
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }

    return this.http.get<PatientListResponse>(`${this.apiUrl}/search`, { params });
  }

  findByPhone(phone: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/by-phone/${phone}`);
  }

  updatePatient(id: string, request: PatientUpdateRequest): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, request);
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  countActivePatients(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
