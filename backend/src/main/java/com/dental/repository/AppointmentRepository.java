package com.dental.repository;

import com.dental.model.Appointment;
import com.dental.model.AppointmentStatus;
import com.dental.model.Patient;
import com.dental.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    
    // Find by patient
    Page<Appointment> findByPatient(Patient patient, Pageable pageable);
    
    List<Appointment> findByPatientAndStatusNot(Patient patient, AppointmentStatus status);
    
    // Find by doctor
    Page<Appointment> findByDoctor(User doctor, Pageable pageable);
    
    List<Appointment> findByDoctorAndStatusNot(User doctor, AppointmentStatus status);
    
    // Find by date range
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate BETWEEN :start AND :end " +
           "AND a.status != 'CANCELLED'")
    List<Appointment> findByDoctorAndDateBetweenExcludingCancelled(
        @Param("doctorId") UUID doctorId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
    
    // Find by status
    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);
    
    List<Appointment> findByStatusIn(List<AppointmentStatus> statuses);
    
    // Find upcoming appointments
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate >= :now " +
           "AND a.status != 'CANCELLED' ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcoming(@Param("now") LocalDateTime now);
    
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate >= :now " +
           "AND a.status != 'CANCELLED' ORDER BY a.appointmentDate ASC")
    Page<Appointment> findUpcoming(@Param("now") LocalDateTime now, Pageable pageable);
    
    // Check doctor availability
    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM appointments a " +
           "WHERE a.doctor_id = :doctorId " +
           "AND a.status != 'CANCELLED' " +
           "AND (a.appointment_date < :endTime " +
           "AND DATEADD('MINUTE', a.duration, a.appointment_date) > :startTime)",
           nativeQuery = true)
    boolean existsOverlappingAppointment(
        @Param("doctorId") UUID doctorId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // Find appointments for a specific patient and date range
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.appointmentDate BETWEEN :start AND :end")
    List<Appointment> findByPatientAndDateRange(
        @Param("patientId") UUID patientId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
    
    // Count appointments by status
    long countByStatus(AppointmentStatus status);
    
    // Find today's appointments
    @Query(value = "SELECT * FROM appointments a WHERE CAST(a.appointment_date AS DATE) = CURRENT_DATE " +
           "AND a.status != 'CANCELLED' ORDER BY a.appointment_date ASC",
           nativeQuery = true)
    List<Appointment> findTodaysAppointments();
}
