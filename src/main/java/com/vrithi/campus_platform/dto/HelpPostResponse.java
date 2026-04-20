package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.Urgency;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HelpPostResponse {
    private Long id;
    private String postedByName;
    private String postedByEmail;
    private String subject;
    private String topic;
    private String description;
    private Urgency urgency;
    private boolean resolved;
    private List<HelpReplyResponse> replies;
    private LocalDateTime createdAt;
}