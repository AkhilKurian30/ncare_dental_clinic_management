package com.dental.controller;

import com.dental.dto.AppointmentsByStatusDTO;
import com.dental.dto.DashboardStatsDTO;
import com.dental.dto.RecentAppointmentDTO;
import com.dental.dto.RevenueByMonthDTO;
import com.dental.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics and analytics")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics", description = "Returns all key statistics for the dashboard")
    public ResponseEntity<DashboardStatsDTO> getStatistics() {
        return ResponseEntity.ok(dashboardService.getStatistics());
    }

    @GetMapping("/appointments-by-status")
    @Operation(summary = "Get appointments by status", description = "Returns appointment counts grouped by status for pie chart")
    public ResponseEntity<List<AppointmentsByStatusDTO>> getAppointmentsByStatus() {
        return ResponseEntity.ok(dashboardService.getAppointmentsByStatus());
    }

    @GetMapping("/revenue-by-month")
    @Operation(summary = "Get revenue by month", description = "Returns revenue for the last 6 months for bar chart")
    public ResponseEntity<List<RevenueByMonthDTO>> getRevenueByMonth() {
        return ResponseEntity.ok(dashboardService.getRevenueByMonth());
    }

    @GetMapping("/upcoming-appointments")
    @Operation(summary = "Get upcoming appointments", description = "Returns list of upcoming appointments")
    public ResponseEntity<List<RecentAppointmentDTO>> getUpcomingAppointments(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getUpcomingAppointments(limit));
    }

    @GetMapping("/recent-appointments")
    @Operation(summary = "Get recent appointments", description = "Returns list of recent appointments")
    public ResponseEntity<List<RecentAppointmentDTO>> getRecentAppointments(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getRecentAppointments(limit));
    }
}
