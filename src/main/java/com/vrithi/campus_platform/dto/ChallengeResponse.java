package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.ChallengeCategory;
import com.vrithi.campus_platform.entity.ChallengeStatus;
import java.time.LocalDateTime;

public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private ChallengeCategory category;
    private ChallengeStatus status;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime submissionDeadline;
    private LocalDateTime votingDeadline;
    private LocalDateTime createdAt;
    private int participantsCount;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ChallengeCategory getCategory() { return category; }
    public void setCategory(ChallengeCategory category) { this.category = category; }
    public ChallengeStatus getStatus() { return status; }
    public void setStatus(ChallengeStatus status) { this.status = status; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
    public LocalDateTime getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(LocalDateTime submissionDeadline) { this.submissionDeadline = submissionDeadline; }
    public LocalDateTime getVotingDeadline() { return votingDeadline; }
    public void setVotingDeadline(LocalDateTime votingDeadline) { this.votingDeadline = votingDeadline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public int getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(int participantsCount) { this.participantsCount = participantsCount; }
}