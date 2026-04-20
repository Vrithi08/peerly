package com.vrithi.campus_platform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HelpReplyResponse {
    private Long id;
    private Long helpPostId;
    private String repliedByName;
    private String repliedByEmail;
    private String content;
    private String mediaUrl;
    private boolean accepted;
    private LocalDateTime createdAt;
}