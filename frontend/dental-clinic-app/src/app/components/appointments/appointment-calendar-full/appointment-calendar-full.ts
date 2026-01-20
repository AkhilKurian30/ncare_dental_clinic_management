import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg, EventInput, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentFormComponent } from '../appointment-form/appointment-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-calendar-full',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    FullCalendarModule
  ],
  templateUrl: './appointment-calendar-full.html',
  styleUrls: ['./appointment-calendar-full.scss']
})
export class AppointmentCalendarFullComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  isLoading = signal(false);
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
      startTime: '09:00',
      endTime: '18:00'
    },
    slotMinTime: '09:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    height: 'auto',
    events: [],
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    dateClick: this.handleDateClick.bind(this)
  };

  currentEvents = signal<EventInput[]>([]);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    
    // Load appointments for the next 3 months
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date();
    end.setMonth(end.getMonth() + 3);

    this.appointmentService.getAppointmentsByDateRange(
      start.toISOString(),
      end.toISOString()
    ).subscribe({
      next: (appointments) => {
        const events = this.mapAppointmentsToEvents(appointments);
        this.calendarOptions = {
          ...this.calendarOptions,
          events: events
        };
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.notificationService.error('Failed to load appointments');
        this.isLoading.set(false);
      }
    });
  }

  mapAppointmentsToEvents(appointments: Appointment[]): EventInput[] {
    return appointments.map(apt => ({
      id: apt.id,
      title: `${apt.patientName} - ${apt.reason || 'Appointment'}`,
      start: apt.appointmentDate,
      end: new Date(new Date(apt.appointmentDate).getTime() + apt.duration * 60000).toISOString(),
      backgroundColor: this.getEventColor(apt.status),
      borderColor: this.getEventBorderColor(apt.status),
      textColor: '#ffffff',
      extendedProps: {
        appointment: apt
      }
    }));
  }

  getEventColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return '#3b82f6'; // Blue
      case AppointmentStatus.CONFIRMED:
        return '#10b981'; // Green
      case AppointmentStatus.COMPLETED:
        return '#8b5cf6'; // Purple
      case AppointmentStatus.CANCELLED:
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }

  getEventBorderColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return '#2563eb';
      case AppointmentStatus.CONFIRMED:
        return '#059669';
      case AppointmentStatus.COMPLETED:
        return '#7c3aed';
      case AppointmentStatus.CANCELLED:
        return '#dc2626';
      default:
        return '#4b5563';
    }
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '700px',
      data: { 
        mode: 'create',
        appointmentDate: selectInfo.start
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
    
    if (appointment) {
      // Navigate to patient details
      this.router.navigate(['/patients', appointment.patientId]);
    }
  }

  handleDateClick(dateClickInfo: any): void {
    // This is triggered when clicking on a date in day/week view
    if (dateClickInfo.view.type === 'timeGridWeek' || dateClickInfo.view.type === 'timeGridDay') {
      const dialogRef = this.dialog.open(AppointmentFormComponent, {
        width: '700px',
        data: { 
          mode: 'create',
          appointmentDate: dateClickInfo.date
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadAppointments();
        }
      });
    }
  }

  handleEvents(events: EventApi[]): void {
    // Convert EventApi[] to EventInput[] if needed
    this.currentEvents.set(events as any);
  }

  handleEventDrop(info: any): void {
    const appointment = info.event.extendedProps['appointment'] as Appointment;
    
    if (appointment && appointment.status !== AppointmentStatus.CANCELLED) {
      const newDate = info.event.start;
      
      this.appointmentService.updateAppointment(appointment.id, {
        appointmentDate: newDate?.toISOString()
      }).subscribe({
        next: () => {
          this.notificationService.success('Appointment rescheduled successfully');
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.notificationService.error('Failed to reschedule appointment');
          info.revert();
        }
      });
    } else {
      info.revert();
      this.notificationService.warning('Cannot reschedule cancelled appointments');
    }
  }

  handleEventResize(info: any): void {
    const appointment = info.event.extendedProps['appointment'] as Appointment;
    
    if (appointment && appointment.status !== AppointmentStatus.CANCELLED) {
      const newEnd = info.event.end;
      const newStart = info.event.start;
      const newDuration = Math.round((newEnd.getTime() - newStart.getTime()) / 60000);
      
      this.appointmentService.updateAppointment(appointment.id, {
        duration: newDuration
      }).subscribe({
        next: () => {
          this.notificationService.success('Appointment duration updated');
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          this.notificationService.error('Failed to update duration');
          info.revert();
        }
      });
    } else {
      info.revert();
    }
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

  onRefresh(): void {
    this.loadAppointments();
  }
}
