package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.AuthResponse;
import com.vrithi.campus_platform.dto.LoginRequest;
import com.vrithi.campus_platform.dto.RegisterRequest;
import com.vrithi.campus_platform.entity.User;
import com.vrithi.campus_platform.repository.UserRepository;
import com.vrithi.campus_platform.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.vrithi.campus_platform.service.EmailParserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailParserService emailParserService;

    @Autowired
    private AuthenticationManager authenticationManager;
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        // Parse email for student details (will fail gracefully for non-Amrita emails)
        Map<String, String> emailData = emailParserService.parseAmritaEmail(request.getEmail());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Use the college provided in the request
        user.setCollege(request.getCollege());

        // Auto-fill from email (if applicable)
        user.setDepartment(emailData.getOrDefault("department", "Unknown"));
        user.setBatch(emailData.getOrDefault("batch", "Unknown"));
        user.setSection(emailData.getOrDefault("section", "Unknown"));
        user.setRollNumber(emailData.getOrDefault("rollNumber", "Unknown"));
        user.setDegreeType(emailData.getOrDefault("degreeType", "Unknown"));

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getName(), user.getProfileImage()));
    }
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("JWT is working!");
    }
    @PostMapping("/test-post")
    public ResponseEntity<?> testPost() {
        return ResponseEntity.ok("POST works!");
    }
}