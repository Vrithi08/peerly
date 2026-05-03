package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.Urgency;
import java.time.LocalDateTime;
import java.util.List;

public class HelpPostResponse {
    private Long id;
    private String postedByName;
    private String postedByEmail;
    private String postedByDepartment;
    private String postedByBatch;
    private String subject;
    private String topic;
    private String description;
    private Urgency urgency;
    private String mediaUrl;
    private boolean resolved;
    private List<HelpReplyResponse> replies;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPostedByName() { return postedByName; }
    public void setPostedByName(String postedByName) { this.postedByName = postedByName; }
    public String getPostedByEmail() { return postedByEmail; }
    public void setPostedByEmail(String postedByEmail) { this.postedByEmail = postedByEmail; }
    public String getPostedByDepartment() { return postedByDepartment; }
    public void setPostedByDepartment(String postedByDepartment) { this.postedByDepartment = postedByDepartment; }
    public String getPostedByBatch() { return postedByBatch; }
    public void setPostedByBatch(String postedByBatch) { this.postedByBatch = postedByBatch; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
    public List<HelpReplyResponse> getReplies() { return replies; }
    public void setReplies(List<HelpReplyResponse> replies) { this.replies = replies; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}