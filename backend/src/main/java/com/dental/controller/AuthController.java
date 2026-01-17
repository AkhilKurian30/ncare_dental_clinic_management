package com.dental.controller;

import com.dental.dto.LoginRequest;
import com.dental.dto.LoginResponse;
import com.dental.dto.RegisterRequest;
import com.dental.dto.UserDTO;
import com.dental.exception.InvalidCredentialsException;
import com.dental.model.User;
import com.dental.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        if (!userService.validateCredentials(request.getEmail(), request.getPassword())) {
            throw new InvalidCredentialsException();
        }
        
        User user = userService.getUserByEmail(request.getEmail());
        
        // Generate simple token (UUID) - will be replaced with JWT later
        String token = UUID.randomUUID().toString();
        
        LoginResponse response = new LoginResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getActive()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user info")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        // For now, this is a placeholder - will be implemented with JWT
        // TODO: Implement proper token validation and user retrieval
        return ResponseEntity.ok("Token validation not yet implemented. Will be added with JWT.");
    }
}
