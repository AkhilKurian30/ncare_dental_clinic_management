package com.dental.controller;

import com.dental.dto.PatientCreateRequest;
import com.dental.dto.PatientDTO;
import com.dental.dto.PatientUpdateRequest;
import com.dental.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patient Management", description = "APIs for managing patients")
@CrossOrigin(origins = "http://localhost:4200")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @Operation(summary = "Create a new patient", description = "Creates a new patient record")
    public ResponseEntity<PatientDTO> createPatient(@Valid @RequestBody PatientCreateRequest request) {
        PatientDTO patient = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(patient);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID", description = "Retrieves a patient by their ID")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable UUID id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    @Operation(summary = "Get all patients", description = "Retrieves all patients with pagination and sorting")
    public ResponseEntity<Page<PatientDTO>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<PatientDTO> patients = patientService.getAllPatients(pageable, activeOnly);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/search")
    @Operation(summary = "Search patients", description = "Search patients by name, phone, or email")
    public ResponseEntity<Page<PatientDTO>> searchPatients(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<PatientDTO> patients = patientService.searchPatients(query, pageable, activeOnly);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/by-phone/{phone}")
    @Operation(summary = "Find patient by phone", description = "Retrieves a patient by their phone number")
    public ResponseEntity<PatientDTO> findByPhone(@PathVariable String phone) {
        PatientDTO patient = patientService.findByPhone(phone);
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update patient", description = "Updates an existing patient")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable UUID id,
            @Valid @RequestBody PatientUpdateRequest request
    ) {
        PatientDTO patient = patientService.updatePatient(id, request);
        return ResponseEntity.ok(patient);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete patient", description = "Soft deletes a patient")
    public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @Operation(summary = "Count active patients", description = "Returns the total number of active patients")
    public ResponseEntity<Long> countActivePatients() {
        long count = patientService.countActivePatients();
        return ResponseEntity.ok(count);
    }
}
