package com.dental.dto;

import com.dental.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    
    private String token;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Boolean active;
}
