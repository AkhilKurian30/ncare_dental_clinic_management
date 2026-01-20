package com.dental.repository;

import com.dental.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    
    // Find by phone
    Optional<Patient> findByPhone(String phone);
    
    // Find by email
    Optional<Patient> findByEmail(String email);
    
    // Check if phone exists (excluding given patient id for updates)
    boolean existsByPhoneAndIdNot(String phone, UUID id);
    
    // Check if email exists (excluding given patient id for updates)
    boolean existsByEmailAndIdNot(String email, UUID id);
    
    // Find all active patients with pagination
    Page<Patient> findByActiveTrue(Pageable pageable);
    
    // Find all patients including inactive
    Page<Patient> findAll(Pageable pageable);
    
    // Search by name (case-insensitive)
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Patient> searchPatients(@Param("query") String query, Pageable pageable);
    
    // Search only active patients
    @Query("SELECT p FROM Patient p WHERE p.active = true AND (" +
           "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Patient> searchActivePatients(@Param("query") String query, Pageable pageable);
    
    // Count active patients
    long countByActiveTrue();
}
