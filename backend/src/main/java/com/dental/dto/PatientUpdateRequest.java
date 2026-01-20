package com.dental.dto;

import com.dental.model.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientUpdateRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String address;
    private String emergencyContact;
    private String emergencyPhone;
    private String bloodGroup;
    private String allergies;
    private String notes;
    private Boolean active;
}
