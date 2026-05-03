package com.vrithi.campus_platform.dto;

import java.time.LocalDateTime;
import java.util.List;

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
    private String profileImage;
    private List<SubmissionResponse> recentSubmissions;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getDegreeType() { return degreeType; }
    public void setDegreeType(String degreeType) { this.degreeType = degreeType; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public int getChallengePoints() { return challengePoints; }
    public void setChallengePoints(int challengePoints) { this.challengePoints = challengePoints; }
    public int getHelpPoints() { return helpPoints; }
    public void setHelpPoints(int helpPoints) { this.helpPoints = helpPoints; }
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public int getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }
    public int getTotalHelpPostsCreated() { return totalHelpPostsCreated; }
    public void setTotalHelpPostsCreated(int totalHelpPostsCreated) { this.totalHelpPostsCreated = totalHelpPostsCreated; }
    public int getTotalRepliesGiven() { return totalRepliesGiven; }
    public void setTotalRepliesGiven(int totalRepliesGiven) { this.totalRepliesGiven = totalRepliesGiven; }
    public int getAcceptedReplies() { return acceptedReplies; }
    public void setAcceptedReplies(int acceptedReplies) { this.acceptedReplies = acceptedReplies; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    public List<ChallengeResponse> getRecentChallenges() { return recentChallenges; }
    public void setRecentChallenges(List<ChallengeResponse> recentChallenges) { this.recentChallenges = recentChallenges; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public List<SubmissionResponse> getRecentSubmissions() { return recentSubmissions; }
    public void setRecentSubmissions(List<SubmissionResponse> recentSubmissions) { this.recentSubmissions = recentSubmissions; }
}