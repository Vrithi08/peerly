package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.Urgency;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class HelpPostRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    private Urgency urgency;
}