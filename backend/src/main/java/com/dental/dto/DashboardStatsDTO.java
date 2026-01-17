package com.dental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long todayAppointments;
    private Long totalPatients;
    private BigDecimal monthlyRevenue;
    private Long pendingInvoices;
    private Long totalAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
}
