package com.vrithi.campus_platform.dto;

public class LeaderboardEntry {
    private Long userId;
    private String name;
    private String college;
    private int challengePoints;
    private int helpPoints;
    private int totalPoints;
    private int rank;
    private String profileImage;

    public LeaderboardEntry() {}

    public LeaderboardEntry(Long userId, String name, String college, int challengePoints, int helpPoints, int totalPoints, int rank, String profileImage) {
        this.userId = userId;
        this.name = name;
        this.college = college;
        this.challengePoints = challengePoints;
        this.helpPoints = helpPoints;
        this.totalPoints = totalPoints;
        this.rank = rank;
        this.profileImage = profileImage;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public int getChallengePoints() { return challengePoints; }
    public void setChallengePoints(int challengePoints) { this.challengePoints = challengePoints; }
    public int getHelpPoints() { return helpPoints; }
    public void setHelpPoints(int helpPoints) { this.helpPoints = helpPoints; }
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
}