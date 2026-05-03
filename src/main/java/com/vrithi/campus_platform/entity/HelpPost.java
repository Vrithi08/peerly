package com.vrithi.campus_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "help_posts")
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

    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    private Urgency urgency = Urgency.CHILL;

    private boolean resolved = false;

    @OneToMany(mappedBy = "helpPost", cascade = CascadeType.ALL)
    private List<HelpReply> replies;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }
    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
    public List<HelpReply> getReplies() { return replies; }
    public void setReplies(List<HelpReply> replies) { this.replies = replies; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}