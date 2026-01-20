package com.dental.service;

import com.dental.dto.AppointmentCreateRequest;
import com.dental.dto.AppointmentDTO;
import com.dental.dto.AppointmentUpdateRequest;
import com.dental.dto.TimeSlotDTO;
import com.dental.exception.BadRequestException;
import com.dental.exception.ResourceNotFoundException;
import com.dental.model.Appointment;
import com.dental.model.AppointmentStatus;
import com.dental.model.Patient;
import com.dental.model.User;
import com.dental.repository.AppointmentRepository;
import com.dental.repository.PatientRepository;
import com.dental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    private static final LocalTime WORKING_HOURS_START = LocalTime.of(9, 0);
    private static final LocalTime WORKING_HOURS_END = LocalTime.of(18, 0);
    private static final int SLOT_DURATION = 30; // minutes

    /**
     * Create a new appointment
     */
    public AppointmentDTO createAppointment(AppointmentCreateRequest request) {
        log.info("Creating appointment for patient {} with doctor {}", 
                 request.getPatientId(), request.getDoctorId());

        // Validate patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Validate doctor exists
        User doctor = userRepository.findById(request.getDoctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Validate appointment date is not in the past
        if (request.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        // Validate working hours
        validateWorkingHours(request.getAppointmentDate(), request.getDuration());

        // Check doctor availability
        if (!checkAvailability(request.getDoctorId(), request.getAppointmentDate(), request.getDuration())) {
            throw new BadRequestException("Doctor is not available at the selected time");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setDuration(request.getDuration());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment created successfully with ID: {}", saved.getId());

        return mapToDTO(saved);
    }

    /**
     * Get appointment by ID
     */
    public AppointmentDTO getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return mapToDTO(appointment);
    }

    /**
     * Get all appointments with pagination
     */
    public Page<AppointmentDTO> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(this::mapToDTO);
    }

    /**
     * Get upcoming appointments
     */
    public Page<AppointmentDTO> getUpcomingAppointments(Pageable pageable) {
        return appointmentRepository.findUpcoming(LocalDateTime.now(), pageable)
            .map(this::mapToDTO);
    }

    /**
     * Get appointments by patient
     */
    public Page<AppointmentDTO> getAppointmentsByPatient(UUID patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return appointmentRepository.findByPatient(patient, pageable)
            .map(this::mapToDTO);
    }

    /**
     * Get appointments by doctor
     */
    public Page<AppointmentDTO> getAppointmentsByDoctor(UUID doctorId, Pageable pageable) {
        User doctor = userRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor, pageable)
            .map(this::mapToDTO);
    }

    /**
     * Get appointments by status
     */
    public Page<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findByStatus(status, pageable)
            .map(this::mapToDTO);
    }

    /**
     * Get appointments by date range
     */
    public List<AppointmentDTO> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByAppointmentDateBetween(start, end)
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Update appointment
     */
    public AppointmentDTO updateAppointment(UUID id, AppointmentUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Update doctor if provided
        if (request.getDoctorId() != null) {
            User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            appointment.setDoctor(doctor);
        }

        // Update date and check availability if provided
        if (request.getAppointmentDate() != null) {
            if (request.getAppointmentDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Appointment date cannot be in the past");
            }

            int duration = request.getDuration() != null ? request.getDuration() : appointment.getDuration();
            validateWorkingHours(request.getAppointmentDate(), duration);

            UUID doctorId = request.getDoctorId() != null ? request.getDoctorId() : appointment.getDoctor().getId();
            if (!checkAvailabilityExcludingAppointment(doctorId, request.getAppointmentDate(), duration, id)) {
                throw new BadRequestException("Doctor is not available at the selected time");
            }

            appointment.setAppointmentDate(request.getAppointmentDate());
        }

        if (request.getDuration() != null) {
            appointment.setDuration(request.getDuration());
        }

        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }

        if (request.getReason() != null) {
            appointment.setReason(request.getReason());
        }

        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        Appointment updated = appointmentRepository.save(appointment);
        return mapToDTO(updated);
    }

    /**
     * Cancel appointment
     */
    public void cancelAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        log.info("Appointment {} cancelled successfully", id);
    }

    /**
     * Check doctor availability
     */
    public boolean checkAvailability(UUID doctorId, LocalDateTime appointmentDate, Integer duration) {
        LocalDateTime endTime = appointmentDate.plusMinutes(duration);
        return !appointmentRepository.existsOverlappingAppointment(doctorId, appointmentDate, endTime);
    }

    /**
     * Check availability excluding specific appointment (for updates)
     */
    private boolean checkAvailabilityExcludingAppointment(
            UUID doctorId, LocalDateTime appointmentDate, Integer duration, UUID excludeAppointmentId) {
        LocalDateTime endTime = appointmentDate.plusMinutes(duration);
        
        List<Appointment> overlapping = appointmentRepository.findByDoctorAndDateBetweenExcludingCancelled(
            doctorId,
            appointmentDate.minusMinutes(duration),
            endTime
        );

        return overlapping.stream()
            .filter(a -> !a.getId().equals(excludeAppointmentId))
            .noneMatch(a -> a.overlaps(appointmentDate, endTime));
    }

    /**
     * Get available time slots for a doctor on a specific date
     */
    public List<TimeSlotDTO> getAvailableSlots(UUID doctorId, LocalDate date) {
        // Validate doctor exists
        if (!userRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found");
        }

        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalDateTime dayStart = LocalDateTime.of(date, WORKING_HOURS_START);
        LocalDateTime dayEnd = LocalDateTime.of(date, WORKING_HOURS_END);

        // Get all appointments for the doctor on this day
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDateBetweenExcludingCancelled(
            doctorId,
            dayStart,
            dayEnd
        );

        // Generate time slots
        LocalDateTime slotStart = dayStart;
        while (slotStart.plusMinutes(SLOT_DURATION).isBefore(dayEnd) || 
               slotStart.plusMinutes(SLOT_DURATION).equals(dayEnd)) {
            final LocalDateTime currentSlotStart = slotStart;
            final LocalDateTime slotEnd = slotStart.plusMinutes(SLOT_DURATION);
            
            // Check if slot overlaps with any existing appointment
            boolean available = appointments.stream()
                .noneMatch(app -> app.overlaps(currentSlotStart, slotEnd));

            slots.add(new TimeSlotDTO(currentSlotStart, slotEnd, available));
            slotStart = slotEnd;
        }

        return slots;
    }

    /**
     * Validate working hours
     */
    private void validateWorkingHours(LocalDateTime appointmentDate, Integer duration) {
        LocalTime startTime = appointmentDate.toLocalTime();
        LocalTime endTime = startTime.plusMinutes(duration);

        if (startTime.isBefore(WORKING_HOURS_START)) {
            throw new BadRequestException("Appointment cannot start before 9:00 AM");
        }

        if (endTime.isAfter(WORKING_HOURS_END)) {
            throw new BadRequestException("Appointment must end by 6:00 PM");
        }
    }

    /**
     * Map Appointment entity to DTO
     */
    private AppointmentDTO mapToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getFullName());
        dto.setPatientPhone(appointment.getPatient().getPhone());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getFullName());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setDuration(appointment.getDuration());
        dto.setStatus(appointment.getStatus());
        dto.setReason(appointment.getReason());
        dto.setNotes(appointment.getNotes());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());
        return dto;
    }
}
