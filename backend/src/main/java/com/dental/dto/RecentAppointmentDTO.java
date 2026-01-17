package com.dental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentAppointmentDTO {
    private String id;
    private LocalDateTime dateTime;
    private String patientName;
    private String doctorName;
    private String status;
    private String notes;
}
