package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.Urgency;
import lombok.Data;

@Data
public class HelpPostRequest {
    private String subject;
    private String topic;
    private String description;
    private Urgency urgency;
}