package com.vrithi.campus_platform.dto;

import jakarta.validation.constraints.*;

public class HelpReplyRequest {

    private String content;

    private String mediaUrl;

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
}