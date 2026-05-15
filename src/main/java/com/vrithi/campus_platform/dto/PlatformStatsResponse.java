package com.vrithi.campus_platform.dto;

public class PlatformStatsResponse {
    private long challengesCount;
    private long usersCount;
    private long submissionsCount;
    private long votesCount;

    public PlatformStatsResponse() {
    }

    public PlatformStatsResponse(long challengesCount, long usersCount, long submissionsCount, long votesCount) {
        this.challengesCount = challengesCount;
        this.usersCount = usersCount;
        this.submissionsCount = submissionsCount;
        this.votesCount = votesCount;
    }

    public long getChallengesCount() {
        return challengesCount;
    }

    public void setChallengesCount(long challengesCount) {
        this.challengesCount = challengesCount;
    }

    public long getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(long usersCount) {
        this.usersCount = usersCount;
    }

    public long getSubmissionsCount() {
        return submissionsCount;
    }

    public void setSubmissionsCount(long submissionsCount) {
        this.submissionsCount = submissionsCount;
    }

    public long getVotesCount() {
        return votesCount;
    }

    public void setVotesCount(long votesCount) {
        this.votesCount = votesCount;
    }
}
