import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.scss']
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  patients = signal<Patient[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');

  // Pagination
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  pageSizeOptions = [10, 25, 50, 100];

  displayedColumns: string[] = ['photo', 'name', 'phone', 'email', 'age', 'bloodGroup', 'actions'];

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    const query = this.searchQuery();

    const request$ = query
      ? this.patientService.searchPatients(
          query,
          this.pageIndex(),
          this.pageSize(),
          'firstName',
          'ASC',
          true
        )
      : this.patientService.getAllPatients(
          this.pageIndex(),
          this.pageSize(),
          'createdAt',
          'DESC',
          true
        );

    request$.subscribe({
      next: (response) => {
        this.patients.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.notificationService.error('Failed to load patients. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    this.pageIndex.set(0);
    this.loadPatients();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadPatients();
  }

  onAddPatient(): void {
    this.router.navigate(['/patients/new']);
  }

  onViewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id]);
  }

  onEditPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id, 'edit']);
  }

  onDeletePatient(patient: Patient): void {
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
      if (result) {
        this.patientService.deletePatient(patient.id).subscribe({
          next: () => {
            this.notificationService.success(`Patient ${patient.fullName} deleted successfully`);
            this.loadPatients();
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

  getInitials(patient: Patient): string {
    return `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  }
}
