package com.vrithi.campus_platform.dto;

import java.time.LocalDateTime;

public class HelpReplyResponse {
    private Long id;
    private Long helpPostId;
    private String repliedByName;
    private String repliedByEmail;
    private String repliedByDepartment;
    private String repliedByBatch;
    private String content;
    private String mediaUrl;
    private boolean accepted;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHelpPostId() { return helpPostId; }
    public void setHelpPostId(Long helpPostId) { this.helpPostId = helpPostId; }
    public String getRepliedByName() { return repliedByName; }
    public void setRepliedByName(String repliedByName) { this.repliedByName = repliedByName; }
    public String getRepliedByEmail() { return repliedByEmail; }
    public void setRepliedByEmail(String repliedByEmail) { this.repliedByEmail = repliedByEmail; }
    public String getRepliedByDepartment() { return repliedByDepartment; }
    public void setRepliedByDepartment(String repliedByDepartment) { this.repliedByDepartment = repliedByDepartment; }
    public String getRepliedByBatch() { return repliedByBatch; }
    public void setRepliedByBatch(String repliedByBatch) { this.repliedByBatch = repliedByBatch; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}