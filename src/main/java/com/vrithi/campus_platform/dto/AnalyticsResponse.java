package com.vrithi.campus_platform.dto;

import java.util.List;
import java.util.Map;

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

    // Getters and Setters
    public int getTotalUsers() { return totalUsers; }
    public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }
    public int getTotalChallenges() { return totalChallenges; }
    public void setTotalChallenges(int totalChallenges) { this.totalChallenges = totalChallenges; }
    public int getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }
    public int getTotalVotes() { return totalVotes; }
    public void setTotalVotes(int totalVotes) { this.totalVotes = totalVotes; }
    public int getTotalHelpPosts() { return totalHelpPosts; }
    public void setTotalHelpPosts(int totalHelpPosts) { this.totalHelpPosts = totalHelpPosts; }
    public int getTotalHelpReplies() { return totalHelpReplies; }
    public void setTotalHelpReplies(int totalHelpReplies) { this.totalHelpReplies = totalHelpReplies; }
    public Map<String, Long> getChallengesByCategory() { return challengesByCategory; }
    public void setChallengesByCategory(Map<String, Long> challengesByCategory) { this.challengesByCategory = challengesByCategory; }
    public Map<String, Long> getHelpPostsBySubject() { return helpPostsBySubject; }
    public void setHelpPostsBySubject(Map<String, Long> helpPostsBySubject) { this.helpPostsBySubject = helpPostsBySubject; }
    public List<LeaderboardEntry> getTopContributors() { return topContributors; }
    public void setTopContributors(List<LeaderboardEntry> topContributors) { this.topContributors = topContributors; }
}