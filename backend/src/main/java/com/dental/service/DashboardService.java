package com.dental.service;

import com.dental.dto.AppointmentsByStatusDTO;
import com.dental.dto.DashboardStatsDTO;
import com.dental.dto.RecentAppointmentDTO;
import com.dental.dto.RevenueByMonthDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final Random random = new Random();

    /**
     * Get dashboard statistics
     * Note: This returns mock data until Patient, Appointment, and Invoice entities are implemented
     */
    public DashboardStatsDTO getStatistics() {
        return DashboardStatsDTO.builder()
                .todayAppointments(5L)
                .totalPatients(156L)
                .monthlyRevenue(new BigDecimal("45000.00"))
                .pendingInvoices(8L)
                .totalAppointments(245L)
                .completedAppointments(198L)
                .cancelledAppointments(12L)
                .build();
    }

    /**
     * Get appointments grouped by status for pie chart
     */
    public List<AppointmentsByStatusDTO> getAppointmentsByStatus() {
        List<AppointmentsByStatusDTO> stats = new ArrayList<>();
        stats.add(AppointmentsByStatusDTO.builder()
                .status("Scheduled")
                .count(35L)
                .build());
        stats.add(AppointmentsByStatusDTO.builder()
                .status("Completed")
                .count(198L)
                .build());
        stats.add(AppointmentsByStatusDTO.builder()
                .status("Cancelled")
                .count(12L)
                .build());
        return stats;
    }

    /**
     * Get revenue by month for the last 6 months
     */
    public List<RevenueByMonthDTO> getRevenueByMonth() {
        List<RevenueByMonthDTO> revenueList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            String monthName = monthDate.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            BigDecimal revenue = new BigDecimal(30000 + random.nextInt(20000));
            
            revenueList.add(RevenueByMonthDTO.builder()
                    .month(monthName)
                    .revenue(revenue)
                    .build());
        }
        
        return revenueList;
    }

    /**
     * Get upcoming appointments
     */
    public List<RecentAppointmentDTO> getUpcomingAppointments(int limit) {
        List<RecentAppointmentDTO> appointments = new ArrayList<>();
        String[] patients = {"John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Brown", 
                            "Sarah Wilson", "David Martinez", "Lisa Anderson", "James Taylor", "Maria Garcia"};
        String[] doctors = {"Dr. Akhil Kurian", "Dr. Sarah Wilson", "Dr. Michael Chen"};
        String[] statuses = {"Scheduled", "Confirmed", "In Progress"};
        
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 0; i < Math.min(limit, 10); i++) {
            appointments.add(RecentAppointmentDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .dateTime(now.plusDays(i).plusHours(random.nextInt(8) + 9))
                    .patientName(patients[i % patients.length])
                    .doctorName(doctors[i % doctors.length])
                    .status(statuses[i % statuses.length])
                    .notes("Regular checkup")
                    .build());
        }
        
        return appointments;
    }

    /**
     * Get recent appointments
     */
    public List<RecentAppointmentDTO> getRecentAppointments(int limit) {
        List<RecentAppointmentDTO> appointments = new ArrayList<>();
        String[] patients = {"Alice Cooper", "Bob Martin", "Charlie Davis", "Diana Prince", "Ethan Hunt"};
        String[] doctors = {"Dr. Akhil Kurian", "Dr. Sarah Wilson", "Dr. Michael Chen"};
        String[] statuses = {"Completed", "Cancelled"};
        
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 0; i < Math.min(limit, 5); i++) {
            appointments.add(RecentAppointmentDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .dateTime(now.minusDays(i + 1))
                    .patientName(patients[i % patients.length])
                    .doctorName(doctors[i % doctors.length])
                    .status(statuses[i % statuses.length])
                    .notes("Follow-up visit")
                    .build());
        }
        
        return appointments;
    }
}
