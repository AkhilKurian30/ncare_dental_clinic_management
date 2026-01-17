export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

export interface AppointmentsByStatus {
  status: string;
  count: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface RecentAppointment {
  id: string;
  dateTime: string;
  patientName: string;
  doctorName: string;
  status: string;
  notes: string;
}
