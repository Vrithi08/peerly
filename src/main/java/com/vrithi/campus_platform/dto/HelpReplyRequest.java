package com.vrithi.campus_platform.dto;

import jakarta.validation.constraints.*;

public class HelpReplyRequest {

    @NotBlank(message = "Content is required")
    @Size(min = 5, message = "Reply must be at least 5 characters")
    private String content;

    private String mediaUrl;

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
}