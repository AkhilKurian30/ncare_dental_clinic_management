package com.dental.service;

import com.dental.dto.RegisterRequest;
import com.dental.dto.UserDTO;
import com.dental.exception.DuplicateResourceException;
import com.dental.exception.ResourceNotFoundException;
import com.dental.model.Role;
import com.dental.model.User;
import com.dental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public UserDTO createUser(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Prevent creating more than one admin
        if (request.getRole() == Role.ADMIN) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            if (!admins.isEmpty()) {
                throw new DuplicateResourceException("Only one admin user is allowed in the system");
            }
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setActive(true);
        user.setDeleted(false);

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Transactional
    public UserDTO updateUser(UUID id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Check if email is being changed and already exists
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Prevent changing role to admin if another admin exists
        if (request.getRole() == Role.ADMIN && user.getRole() != Role.ADMIN) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            if (!admins.isEmpty()) {
                throw new DuplicateResourceException("Only one admin user is allowed in the system");
            }
        }

        // Prevent changing admin role to another role (admin cannot be demoted)
        if (user.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Cannot change admin role. Admin user must remain as admin.");
        }

        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserDTO getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAll() {
        return userRepository.findAll().stream()
                .filter(user -> !user.getDeleted())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void softDelete(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        // Prevent deleting the admin user
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot delete the admin user");
        }
        
        user.setDeleted(true);
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean validateCredentials(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null || user.getDeleted() || !user.getActive()) {
            return false;
        }
        
        return passwordEncoder.matches(password, user.getPassword());
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
