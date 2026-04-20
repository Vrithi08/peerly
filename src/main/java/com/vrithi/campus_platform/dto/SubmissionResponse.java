package com.vrithi.campus_platform.dto;

import com.vrithi.campus_platform.entity.ContentType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubmissionResponse {
    private Long id;
    private Long challengeId;
    private String challengeTitle;
    private String submittedByName;
    private String submittedByEmail;
    private String contentUrl;
    private String textContent;
    private ContentType contentType;
    private int voteCount;
    private LocalDateTime submittedAt;
}