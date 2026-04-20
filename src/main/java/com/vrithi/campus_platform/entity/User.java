package com.vrithi.campus_platform.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String college;
    private String department;
    private String batch;
    private String rollNumber;
    private String section;
    private String degreeType;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;

    private int challengePoints = 0;
    private int helpPoints = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
}