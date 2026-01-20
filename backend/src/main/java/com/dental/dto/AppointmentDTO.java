package com.dental.dto;

import com.dental.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String patientPhone;
    private UUID doctorId;
    private String doctorName;
    private LocalDateTime appointmentDate;
    private Integer duration;
    private AppointmentStatus status;
    private String reason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
