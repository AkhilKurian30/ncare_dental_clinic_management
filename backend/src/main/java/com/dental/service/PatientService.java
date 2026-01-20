package com.dental.service;

import com.dental.dto.PatientCreateRequest;
import com.dental.dto.PatientDTO;
import com.dental.dto.PatientUpdateRequest;
import com.dental.exception.DuplicateResourceException;
import com.dental.exception.ResourceNotFoundException;
import com.dental.model.Patient;
import com.dental.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;

    /**
     * Create a new patient
     */
    public PatientDTO createPatient(PatientCreateRequest request) {
        log.info("Creating new patient: {} {}", request.getFirstName(), request.getLastName());
        
        // Check if phone already exists
        if (patientRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new DuplicateResourceException("Phone number already exists: " + request.getPhone());
        }
        
        // Check if email already exists (if provided)
        if (request.getEmail() != null && !request.getEmail().isBlank() 
            && patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        
        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setEmergencyPhone(request.getEmergencyPhone());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setNotes(request.getNotes());
        patient.setActive(true);
        
        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient created successfully with ID: {}", savedPatient.getId());
        
        return mapToDTO(savedPatient);
    }

    /**
     * Update an existing patient
     */
    public PatientDTO updatePatient(UUID id, PatientUpdateRequest request) {
        log.info("Updating patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        
        // Check if phone is being changed and if new phone already exists
        if (!patient.getPhone().equals(request.getPhone()) 
            && patientRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
            throw new DuplicateResourceException("Phone number already exists: " + request.getPhone());
        }
        
        // Check if email is being changed and if new email already exists
        if (request.getEmail() != null && !request.getEmail().isBlank()
            && !request.getEmail().equals(patient.getEmail())
            && patientRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setEmergencyPhone(request.getEmergencyPhone());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setNotes(request.getNotes());
        if (request.getActive() != null) {
            patient.setActive(request.getActive());
        }
        
        Patient updatedPatient = patientRepository.save(patient);
        log.info("Patient updated successfully: {}", id);
        
        return mapToDTO(updatedPatient);
    }

    /**
     * Get patient by ID
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(UUID id) {
        log.info("Fetching patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        
        return mapToDTO(patient);
    }

    /**
     * Get all patients with pagination
     */
    @Transactional(readOnly = true)
    public Page<PatientDTO> getAllPatients(Pageable pageable, Boolean activeOnly) {
        log.info("Fetching all patients with pagination: page={}, size={}, activeOnly={}", 
                 pageable.getPageNumber(), pageable.getPageSize(), activeOnly);
        
        Page<Patient> patients = activeOnly != null && activeOnly
            ? patientRepository.findByActiveTrue(pageable)
            : patientRepository.findAll(pageable);
        
        return patients.map(this::mapToDTO);
    }

    /**
     * Search patients by name, phone, or email
     */
    @Transactional(readOnly = true)
    public Page<PatientDTO> searchPatients(String query, Pageable pageable, Boolean activeOnly) {
        log.info("Searching patients with query: '{}', activeOnly={}", query, activeOnly);
        
        if (query == null || query.isBlank()) {
            return getAllPatients(pageable, activeOnly);
        }
        
        Page<Patient> patients = activeOnly != null && activeOnly
            ? patientRepository.searchActivePatients(query, pageable)
            : patientRepository.searchPatients(query, pageable);
        
        return patients.map(this::mapToDTO);
    }

    /**
     * Find patient by phone
     */
    @Transactional(readOnly = true)
    public PatientDTO findByPhone(String phone) {
        log.info("Finding patient by phone: {}", phone);
        
        Patient patient = patientRepository.findByPhone(phone)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with phone: " + phone));
        
        return mapToDTO(patient);
    }

    /**
     * Soft delete a patient
     */
    public void deletePatient(UUID id) {
        log.info("Soft deleting patient with ID: {}", id);
        
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        
        patient.setActive(false);
        patient.setDeleted(true);
        patientRepository.save(patient);
        
        log.info("Patient soft deleted successfully: {}", id);
    }

    /**
     * Get total active patients count
     */
    @Transactional(readOnly = true)
    public long countActivePatients() {
        return patientRepository.countByActiveTrue();
    }

    /**
     * Map Patient entity to PatientDTO
     */
    private PatientDTO mapToDTO(Patient patient) {
        return PatientDTO.builder()
            .id(patient.getId().toString())
            .firstName(patient.getFirstName())
            .lastName(patient.getLastName())
            .fullName(patient.getFullName())
            .dateOfBirth(patient.getDateOfBirth())
            .age(patient.getAge())
            .gender(patient.getGender())
            .phone(patient.getPhone())
            .email(patient.getEmail())
            .address(patient.getAddress())
            .emergencyContact(patient.getEmergencyContact())
            .emergencyPhone(patient.getEmergencyPhone())
            .bloodGroup(patient.getBloodGroup())
            .allergies(patient.getAllergies())
            .notes(patient.getNotes())
            .active(patient.getActive())
            .createdAt(patient.getCreatedAt())
            .updatedAt(patient.getUpdatedAt())
            .build();
    }
}
