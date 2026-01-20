import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './patient-details.html',
  styleUrls: ['./patient-details.scss']
})
export class PatientDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  patient = signal<Patient | null>(null);
  isLoading = signal(true);
  patientId: string | null = null;

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.loadPatient(this.patientId);
    } else {
      this.notificationService.error('Invalid patient ID');
      this.router.navigate(['/patients']);
    }
  }

  loadPatient(id: string): void {
    this.isLoading.set(true);
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.patient.set(patient);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        this.notificationService.error('Failed to load patient details');
        this.router.navigate(['/patients']);
        this.isLoading.set(false);
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/patients', this.patientId, 'edit']);
  }

  onDelete(): void {
    const patient = this.patient();
    if (!patient) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Patient',
        message: `Are you sure you want to delete ${patient.fullName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.patientId) {
        this.patientService.deletePatient(this.patientId).subscribe({
          next: () => {
            this.notificationService.success(`Patient ${patient.fullName} deleted successfully`);
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            console.error('Error deleting patient:', error);
            const errorMessage = error.error?.message || 'Failed to delete patient. Please try again.';
            this.notificationService.error(errorMessage);
          }
        });
      }
    });
  }

  onNewAppointment(): void {
    this.notificationService.info('Appointment scheduling will be available soon');
    // TODO: Navigate to appointment creation with pre-filled patient
    // this.router.navigate(['/appointments/new'], { queryParams: { patientId: this.patientId } });
  }

  onBack(): void {
    this.router.navigate(['/patients']);
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getInitials(patient: Patient): string {
    return `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  }
}
