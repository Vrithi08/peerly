package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.ChallengeCategory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChallengeRequest {
    private String title;
    private String description;
    private ChallengeCategory category;
    private LocalDateTime submissionDeadline;
    private LocalDateTime votingDeadline;
}