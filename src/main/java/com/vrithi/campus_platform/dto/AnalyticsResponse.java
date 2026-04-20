package com.vrithi.campus_platform.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AnalyticsResponse {
    private int totalUsers;
    private int totalChallenges;
    private int totalSubmissions;
    private int totalVotes;
    private int totalHelpPosts;
    private int totalHelpReplies;
    private Map<String, Long> challengesByCategory;
    private Map<String, Long> helpPostsBySubject;
    private List<LeaderboardEntry> topContributors;
}