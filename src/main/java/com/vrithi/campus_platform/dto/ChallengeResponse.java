package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.ChallengeCategory;
import com.vrithi.campus_platform.entity.ChallengeStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private ChallengeCategory category;
    private ChallengeStatus status;
    private String createdByName;
    private String createdByEmail;
    private LocalDateTime submissionDeadline;
    private LocalDateTime votingDeadline;
    private LocalDateTime createdAt;
}