package com.vrithi.campus_platform.dto;

public class VoteMessage {
    private Long submissionId;
    private int voteCount;
    private Long challengeId;

    public VoteMessage() {}

    public VoteMessage(Long submissionId, int voteCount, Long challengeId) {
        this.submissionId = submissionId;
        this.voteCount = voteCount;
        this.challengeId = challengeId;
    }

    // Getters and Setters
    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }
    public int getVoteCount() { return voteCount; }
    public void setVoteCount(int voteCount) { this.voteCount = voteCount; }
    public Long getChallengeId() { return challengeId; }
    public void setChallengeId(Long challengeId) { this.challengeId = challengeId; }
}