package com.vrithi.campus_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteMessage {
    private Long submissionId;
    private int voteCount;
    private Long challengeId;
}