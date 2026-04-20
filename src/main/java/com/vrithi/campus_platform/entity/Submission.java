package com.vrithi.campus_platform.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"challenge_id", "user_id"}
        )
)
@Data
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String contentUrl;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    @Enumerated(EnumType.STRING)
    private ContentType contentType;

    private int voteCount = 0;

    private LocalDateTime submittedAt = LocalDateTime.now();
}