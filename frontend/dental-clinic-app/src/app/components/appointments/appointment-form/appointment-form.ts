import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../services/appointment.service';
import { PatientService } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Appointment, TimeSlot } from '../../../models/appointment.model';
import { Patient } from '../../../models/patient.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface DialogData {
  mode: 'create' | 'edit';
  appointment?: Appointment;
  appointmentDate?: Date;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './appointment-form.html',
  styleUrls: ['./appointment-form.scss']
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AppointmentFormComponent>);
  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  appointmentForm!: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  
  patients = signal<Patient[]>([]);
  filteredPatients = signal<Patient[]>([]);
  availableSlots = signal<TimeSlot[]>([]);
  loadingSlots = signal(false);

  doctors = signal<any[]>([]);
  
  durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadDoctors();
    this.setupPatientSearch();

    if (this.data.mode === 'edit' && this.data.appointment) {
      this.populateForm(this.data.appointment);
    }
  }

  initializeForm(): void {
    const currentUser = this.authService.currentUser();
    
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      patientSearch: [''],
      doctorId: [currentUser?.userId || '', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      duration: [30, [Validators.required, Validators.min(15)]],
      reason: [''],
      notes: ['']
    });

    // Watch for date/doctor changes to load available slots
    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.loadAvailableSlots();
    });

    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.loadAvailableSlots();
    });
  }

  setupPatientSearch(): void {
    this.appointmentForm.get('patientSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(searchTerm => {
          if (typeof searchTerm === 'string' && searchTerm.length >= 2) {
            return this.patientService.searchPatients(searchTerm, 0, 10);
          }
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 });
        })
      )
      .subscribe(response => {
        this.filteredPatients.set(response.content);
      });
  }

  loadDoctors(): void {
    // For now, use current user as the only doctor
    // In a real app, you'd fetch all doctors from a user service
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.doctors.set([{
        id: currentUser.userId,
        name: `${currentUser.firstName} ${currentUser.lastName}`
      }]);
    }
  }

  loadAvailableSlots(): void {
    const date = this.appointmentForm.get('appointmentDate')?.value;
    const doctorId = this.appointmentForm.get('doctorId')?.value;

    if (!date || !doctorId) {
      this.availableSlots.set([]);
      return;
    }

    this.loadingSlots.set(true);
    const dateStr = this.formatDateForAPI(date);

    this.appointmentService.getAvailableSlots(doctorId, dateStr).subscribe({
      next: (slots) => {
        this.availableSlots.set(slots.filter(slot => slot.available));
        this.loadingSlots.set(false);
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.notificationService.error('Failed to load available slots');
        this.loadingSlots.set(false);
      }
    });
  }

  onPatientSelected(patient: Patient): void {
    this.appointmentForm.patchValue({
      patientId: patient.id,
      patientSearch: patient.fullName
    });
  }

  displayPatient(patient: Patient | null): string {
    return patient ? patient.fullName : '';
  }

  populateForm(appointment: Appointment): void {
    const date = new Date(appointment.appointmentDate);
    const timeStr = date.toTimeString().substring(0, 5);

    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      patientSearch: appointment.patientName,
      doctorId: appointment.doctorId,
      appointmentDate: date,
      appointmentTime: timeStr,
      duration: appointment.duration,
      reason: appointment.reason,
      notes: appointment.notes
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.notificationService.warning('Please fill all required fields');
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const control = this.appointmentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.appointmentForm.value;
    
    // Combine date and time
    const appointmentDateTime = this.combineDateTime(
      formValue.appointmentDate,
      formValue.appointmentTime
    );

    const request = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId,
      appointmentDate: appointmentDateTime,
      duration: formValue.duration,
      reason: formValue.reason || undefined,
      notes: formValue.notes || undefined
    };

    if (this.data.mode === 'create') {
      this.appointmentService.createAppointment(request).subscribe({
        next: () => {
          this.notificationService.success('Appointment created successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          const errorMessage = error.error?.message || 'Failed to create appointment';
          this.notificationService.error(errorMessage);
          this.isSaving.set(false);
        }
      });
    } else {
      this.appointmentService.updateAppointment(this.data.appointment!.id, request).subscribe({
        next: () => {
          this.notificationService.success('Appointment updated successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          const errorMessage = error.error?.message || 'Failed to update appointment';
          this.notificationService.error(errorMessage);
          this.isSaving.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private combineDateTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours, 10));
    combined.setMinutes(parseInt(minutes, 10));
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined.toISOString();
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatSlotTime(slot: TimeSlot): string {
    const date = new Date(slot.startTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getMinDate(): Date {
    return new Date();
  }
}
