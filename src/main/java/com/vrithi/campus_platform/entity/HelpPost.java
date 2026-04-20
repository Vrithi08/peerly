package com.vrithi.campus_platform.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "help_posts")
@Data
public class HelpPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private Urgency urgency = Urgency.CHILL;

    private boolean resolved = false;

    @OneToMany(mappedBy = "helpPost", cascade = CascadeType.ALL)
    private List<HelpReply> replies;

    private LocalDateTime createdAt = LocalDateTime.now();
}