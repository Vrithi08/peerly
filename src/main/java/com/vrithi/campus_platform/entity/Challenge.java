package com.vrithi.campus_platform.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "challenges")
@Data
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ChallengeCategory category;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private LocalDateTime submissionDeadline;
    private LocalDateTime votingDeadline;

    @Enumerated(EnumType.STRING)
    private ChallengeStatus status = ChallengeStatus.OPEN;

    private LocalDateTime createdAt = LocalDateTime.now();
}