export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  duration: number;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  duration: number;
  reason?: string;
  notes?: string;
}

export interface AppointmentUpdateRequest {
  doctorId?: string;
  appointmentDate?: string;
  duration?: number;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentListResponse {
  content: Appointment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
