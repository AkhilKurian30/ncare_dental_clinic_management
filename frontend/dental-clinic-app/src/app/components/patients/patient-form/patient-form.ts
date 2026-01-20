import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Gender } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.scss']
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private notificationService = inject(NotificationService);

  patientForm!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  patientId: string | null = null;

  genderOptions = [
    { value: Gender.MALE, label: 'Male' },
    { value: Gender.FEMALE, label: 'Female' },
    { value: Gender.OTHER, label: 'Other' }
  ];

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      address: [''],
      emergencyContact: [''],
      emergencyPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      bloodGroup: [''],
      allergies: [''],
      notes: ['']
    });
  }

  checkEditMode(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.isEditMode.set(true);
      this.loadPatient(this.patientId);
    }
  }

  loadPatient(id: string): void {
    this.isLoading.set(true);
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.patientForm.patchValue({
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          emergencyPhone: patient.emergencyPhone,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
          notes: patient.notes
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        const errorMessage = error.error?.message || 'Failed to load patient data. Please try again.';
        this.notificationService.error(errorMessage);
        this.router.navigate(['/patients']);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.notificationService.warning('Please fill in all required fields correctly');
      return;
    }

    this.isSaving.set(true);
    const formValue = this.patientForm.value;

    const request = {
      ...formValue,
      dateOfBirth: this.formatDate(formValue.dateOfBirth)
    };

    const operation = this.isEditMode()
      ? this.patientService.updatePatient(this.patientId!, request)
      : this.patientService.createPatient(request);

    operation.subscribe({
      next: (patient) => {
        const successMessage = this.isEditMode() 
          ? `Patient ${patient.firstName} ${patient.lastName} updated successfully!` 
          : `Patient ${patient.firstName} ${patient.lastName} created successfully!`;
        this.notificationService.success(successMessage);
        this.router.navigate(['/patients']);
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error saving patient:', error);
        let errorMessage = 'Failed to save patient. Please try again.';
        
        if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid patient data provided';
        } else if (error.status === 409) {
          errorMessage = 'A patient with this phone number or email already exists';
        } else if (error.status === 404) {
          errorMessage = 'Patient not found';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please contact support if this persists.';
        }
        
        this.notificationService.error(errorMessage);
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.patientForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid format';
    }
    if (control?.hasError('minLength')) {
      return `Minimum ${control.errors?.['minLength'].requiredLength} characters required`;
    }
    return '';
  }
}
