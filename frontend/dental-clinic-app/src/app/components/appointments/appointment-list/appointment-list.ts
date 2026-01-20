import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentFormComponent } from '../appointment-form/appointment-form';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.scss']
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  appointments = signal<Appointment[]>([]);
  displayedColumns: string[] = ['dateTime', 'patient', 'doctor', 'duration', 'status', 'actions'];
  isLoading = signal(false);
  
  // Pagination
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  pageSizeOptions = [10, 25, 50, 100];

  // Filters
  filterStatus: AppointmentStatus | 'ALL' = 'ALL';
  searchTerm = '';
  
  statuses = [
    { value: 'ALL', label: 'All Appointments' },
    { value: AppointmentStatus.SCHEDULED, label: 'Scheduled' },
    { value: AppointmentStatus.CONFIRMED, label: 'Confirmed' },
    { value: AppointmentStatus.COMPLETED, label: 'Completed' },
    { value: AppointmentStatus.CANCELLED, label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);

    const filters: any = {};
    if (this.filterStatus !== 'ALL') {
      filters.status = this.filterStatus;
    }

    this.appointmentService.getAllAppointments(
      this.pageIndex(),
      this.pageSize(),
      'appointmentDate',
      'DESC',
      filters
    ).subscribe({
      next: (response) => {
        this.appointments.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.notificationService.error('Failed to load appointments');
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAppointments();
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.loadAppointments();
  }

  onBookAppointment(): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '700px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  onEdit(appointment: Appointment): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '700px',
      data: { mode: 'edit', appointment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  onView(appointment: Appointment): void {
    // Navigate to patient details view
    this.router.navigate(['/patients', appointment.patientId]);
  }

  onCancel(appointment: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Appointment',
        message: `Are you sure you want to cancel the appointment for ${appointment.patientName}?`,
        confirmText: 'Cancel Appointment',
        cancelText: 'Keep',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.cancelAppointment(appointment.id).subscribe({
          next: () => {
            this.notificationService.success('Appointment cancelled successfully');
            this.loadAppointments();
          },
          error: (error) => {
            console.error('Error cancelling appointment:', error);
            this.notificationService.error('Failed to cancel appointment');
          }
        });
      }
    });
  }

  onComplete(appointment: Appointment): void {
    this.appointmentService.updateAppointment(appointment.id, {
      status: AppointmentStatus.COMPLETED
    }).subscribe({
      next: () => {
        this.notificationService.success('Appointment marked as completed');
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error completing appointment:', error);
        this.notificationService.error('Failed to complete appointment');
      }
    });
  }

  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'status-scheduled';
      case AppointmentStatus.CONFIRMED:
        return 'status-confirmed';
      case AppointmentStatus.COMPLETED:
        return 'status-completed';
      case AppointmentStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  canCancel(appointment: Appointment): boolean {
    return appointment.status !== AppointmentStatus.CANCELLED && 
           appointment.status !== AppointmentStatus.COMPLETED;
  }

  canComplete(appointment: Appointment): boolean {
    return appointment.status !== AppointmentStatus.COMPLETED && 
           appointment.status !== AppointmentStatus.CANCELLED;
  }
}
