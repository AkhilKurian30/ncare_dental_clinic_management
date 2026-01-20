package com.dental.controller;

import com.dental.dto.AppointmentCreateRequest;
import com.dental.dto.AppointmentDTO;
import com.dental.dto.AppointmentUpdateRequest;
import com.dental.dto.TimeSlotDTO;
import com.dental.model.AppointmentStatus;
import com.dental.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment Management", description = "APIs for managing appointments")
@CrossOrigin(origins = "http://localhost:4200")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Create a new appointment", description = "Creates a new appointment with validation")
    public ResponseEntity<AppointmentDTO> createAppointment(@Valid @RequestBody AppointmentCreateRequest request) {
        AppointmentDTO appointment = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID", description = "Retrieves an appointment by its ID")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable UUID id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping
    @Operation(summary = "Get all appointments", description = "Retrieves all appointments with filters")
    public ResponseEntity<Page<AppointmentDTO>> getAllAppointments(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDate") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<AppointmentDTO> appointments;

        if (patientId != null) {
            appointments = appointmentService.getAppointmentsByPatient(patientId, pageable);
        } else if (doctorId != null) {
            appointments = appointmentService.getAppointmentsByDoctor(doctorId, pageable);
        } else if (status != null) {
            appointments = appointmentService.getAppointmentsByStatus(status, pageable);
        } else {
            appointments = appointmentService.getAllAppointments(pageable);
        }

        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming appointments", description = "Retrieves all upcoming appointments")
    public ResponseEntity<Page<AppointmentDTO>> getUpcomingAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.getUpcomingAppointments(pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/by-date-range")
    @Operation(summary = "Get appointments by date range", description = "Retrieves appointments within a date range")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDateRange(start, end);
        return ResponseEntity.ok(appointments);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update appointment", description = "Updates an existing appointment")
    public ResponseEntity<AppointmentDTO> updateAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentUpdateRequest request
    ) {
        AppointmentDTO appointment = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(appointment);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel appointment", description = "Cancels an appointment")
    public ResponseEntity<Void> cancelAppointment(@PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available-slots")
    @Operation(summary = "Get available time slots", description = "Retrieves available time slots for a doctor on a specific date")
    public ResponseEntity<List<TimeSlotDTO>> getAvailableSlots(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<TimeSlotDTO> slots = appointmentService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/check-availability")
    @Operation(summary = "Check doctor availability", description = "Checks if a doctor is available for a specific time slot")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime appointmentDate,
            @RequestParam Integer duration
    ) {
        boolean available = appointmentService.checkAvailability(doctorId, appointmentDate, duration);
        return ResponseEntity.ok(available);
    }
}
