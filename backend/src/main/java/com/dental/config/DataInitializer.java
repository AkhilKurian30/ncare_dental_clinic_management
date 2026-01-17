package com.dental.config;

import com.dental.model.Role;
import com.dental.model.User;
import com.dental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        // Check if admin already exists
        if (!userRepository.existsByEmail("aknakn30@gmail.com")) {
            User admin = new User();
            admin.setEmail("aknakn30@gmail.com");
            admin.setPassword(passwordEncoder.encode("1001"));
            admin.setFirstName("Akhil");
            admin.setLastName("Kurian");
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            admin.setDeleted(false);
            
            userRepository.save(admin);
            log.info("✅ Default admin user created successfully");
            log.info("   Email: aknakn30@gmail.com");
            log.info("   Password: 1001");
        } else {
            log.info("✅ Admin user already exists");
        }
    }
}
