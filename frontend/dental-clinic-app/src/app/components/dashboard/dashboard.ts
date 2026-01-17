import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardStats,
  AppointmentsByStatus,
  RevenueByMonth,
  RecentAppointment
} from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  upcomingAppointments = signal<RecentAppointment[]>([]);
  isLoading = signal(true);

  displayedColumns: string[] = ['dateTime', 'patientName', 'doctorName', 'status', 'actions'];

  // Pie Chart Configuration
  pieChartData = signal<ChartData<'pie'>>({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
      hoverBackgroundColor: ['#2563eb', '#059669', '#dc2626']
    }]
  });

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Appointments by Status'
      }
    }
  };

  // Bar Chart Configuration
  barChartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [{
      label: 'Revenue',
      data: [],
      backgroundColor: '#3b82f6',
      hoverBackgroundColor: '#2563eb',
      borderRadius: 8
    }]
  });

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Monthly Revenue (Last 6 Months)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '₹' + value.toLocaleString()
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadDashboardData();
    // Refresh data every 30 seconds
    setInterval(() => this.loadDashboardData(), 30000);
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    // Load statistics
    this.dashboardService.getStatistics().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.isLoading.set(false);
      }
    });

    // Load appointments by status for pie chart
    this.dashboardService.getAppointmentsByStatus().subscribe({
      next: (data) => {
        this.pieChartData.set({
          labels: data.map(d => d.status),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
            hoverBackgroundColor: ['#2563eb', '#059669', '#dc2626']
          }]
        });
      },
      error: (error) => console.error('Error loading appointments by status:', error)
    });

    // Load revenue by month for bar chart
    this.dashboardService.getRevenueByMonth().subscribe({
      next: (data) => {
        this.barChartData.set({
          labels: data.map(d => d.month),
          datasets: [{
            label: 'Revenue',
            data: data.map(d => d.revenue),
            backgroundColor: '#3b82f6',
            hoverBackgroundColor: '#2563eb',
            borderRadius: 8
          }]
        });
      },
      error: (error) => console.error('Error loading revenue by month:', error)
    });

    // Load upcoming appointments
    this.dashboardService.getUpcomingAppointments(10).subscribe({
      next: (appointments) => this.upcomingAppointments.set(appointments),
      error: (error) => console.error('Error loading upcoming appointments:', error)
    });
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'Scheduled': 'primary',
      'Confirmed': 'accent',
      'In Progress': 'warn',
      'Completed': 'primary',
      'Cancelled': ''
    };
    return statusColors[status] || '';
  }

  viewAppointment(appointment: RecentAppointment): void {
    console.log('View appointment:', appointment);
    // Navigate to appointment details (to be implemented)
  }

  editAppointment(appointment: RecentAppointment): void {
    console.log('Edit appointment:', appointment);
    // Navigate to appointment edit (to be implemented)
  }

  cancelAppointment(appointment: RecentAppointment): void {
    console.log('Cancel appointment:', appointment);
    // Show confirmation dialog and cancel (to be implemented)
  }
}
