package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.ChallengeCategory;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class ChallengeRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ChallengeCategory category;

    @NotNull(message = "Submission deadline is required")
    @Future(message = "Submission deadline must be in the future")
    private LocalDateTime submissionDeadline;

    @NotNull(message = "Voting deadline is required")
    @Future(message = "Voting deadline must be in the future")
    private LocalDateTime votingDeadline;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ChallengeCategory getCategory() { return category; }
    public void setCategory(ChallengeCategory category) { this.category = category; }
    public LocalDateTime getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(LocalDateTime submissionDeadline) { this.submissionDeadline = submissionDeadline; }
    public LocalDateTime getVotingDeadline() { return votingDeadline; }
    public void setVotingDeadline(LocalDateTime votingDeadline) { this.votingDeadline = votingDeadline; }
}