package com.dental.dto;

import com.dental.model.AppointmentStatus;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentUpdateRequest {
    
    private UUID doctorId;
    private LocalDateTime appointmentDate;
    
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer duration;
    
    private AppointmentStatus status;
    private String reason;
    private String notes;
}
