import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentFormComponent } from '../appointment-form/appointment-form';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  templateUrl: './appointment-calendar.html',
  styleUrls: ['./appointment-calendar.scss']
})
export class AppointmentCalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  currentDate = signal(new Date());
  calendarDays = signal<CalendarDay[]>([]);
  appointments = signal<Appointment[]>([]);
  isLoading = signal(false);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit(): void {
    this.loadMonthAppointments();
  }

  loadMonthAppointments(): void {
    const date = this.currentDate();
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    this.isLoading.set(true);

    this.appointmentService.getAppointmentsByDateRange(
      start.toISOString(),
      end.toISOString()
    ).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.generateCalendar();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.notificationService.error('Failed to load appointments');
        this.isLoading.set(false);
      }
    });
  }

  generateCalendar(): void {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: this.getAppointmentsForDate(dayDate)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isToday = dayDate.getTime() === today.getTime();
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday,
        appointments: this.getAppointmentsForDate(dayDate)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: this.getAppointmentsForDate(dayDate)
      });
    }

    this.calendarDays.set(days);
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.appointments().filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  }

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    this.loadMonthAppointments();
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    this.loadMonthAppointments();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadMonthAppointments();
  }

  getMonthYear(): string {
    return this.currentDate().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  onDayClick(day: CalendarDay): void {
    if (day.isCurrentMonth) {
      this.openAppointmentDialog(day.date);
    }
  }

  openAppointmentDialog(date?: Date): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '700px',
      data: { mode: 'create', appointmentDate: date }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMonthAppointments();
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

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
