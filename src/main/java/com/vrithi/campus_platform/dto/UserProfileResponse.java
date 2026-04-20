package com.vrithi.campus_platform.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String college;
    private String department;
    private String batch;
    private String section;
    private String rollNumber;
    private String degreeType;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private int challengePoints;
    private int helpPoints;
    private int totalPoints;
    private int rank;
    private int totalSubmissions;
    private int totalHelpPostsCreated;
    private int totalRepliesGiven;
    private int acceptedReplies;
    private LocalDateTime joinedAt;
    private List<ChallengeResponse> recentChallenges;
}