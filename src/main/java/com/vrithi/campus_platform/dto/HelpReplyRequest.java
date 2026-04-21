package com.vrithi.campus_platform.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class HelpReplyRequest {

    @NotBlank(message = "Content is required")
    @Size(min = 5, message = "Reply must be at least 5 characters")
    private String content;

    private String mediaUrl;
}