package com.vrithi.campus_platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntry {
    private Long userId;
    private String name;
    private String college;
    private int challengePoints;
    private int helpPoints;
    private int totalPoints;
    private int rank;
}