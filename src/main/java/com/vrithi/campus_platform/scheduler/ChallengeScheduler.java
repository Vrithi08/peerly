package com.vrithi.campus_platform.scheduler;

import com.vrithi.campus_platform.entity.*;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ChallengeScheduler {

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Scheduled(fixedRate = 60000) // runs every 60 seconds
    @Transactional
    public void updateChallengePhases() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println(">>> Scheduler running at: " + now);

        // OPEN → VOTING: submission deadline has passed
        List<Challenge> openChallenges = challengeRepository.findByStatus(ChallengeStatus.OPEN);
        for (Challenge challenge : openChallenges) {
            if (challenge.getSubmissionDeadline() != null
                    && now.isAfter(challenge.getSubmissionDeadline())) {
                challenge.setStatus(ChallengeStatus.VOTING);
                challengeRepository.save(challenge);
                System.out.println(">>> Challenge " + challenge.getId()
                        + " moved to VOTING: " + challenge.getTitle());
            }
        }

        // VOTING → CLOSED: voting deadline has passed
        List<Challenge> votingChallenges = challengeRepository.findByStatus(ChallengeStatus.VOTING);
        for (Challenge challenge : votingChallenges) {
            if (challenge.getVotingDeadline() != null
                    && now.isAfter(challenge.getVotingDeadline())) {
                challenge.setStatus(ChallengeStatus.CLOSED);
                challengeRepository.save(challenge);
                awardPoints(challenge);
                System.out.println(">>> Challenge " + challenge.getId()
                        + " CLOSED: " + challenge.getTitle());
            }
        }
    }

    private void awardPoints(Challenge challenge) {
        // Get all submissions for this challenge sorted by vote count
        List<Submission> submissions = submissionRepository
                .findByChallengeId(challenge.getId())
                .stream()
                .sorted(Comparator.comparingInt(Submission::getVoteCount).reversed())
                .collect(Collectors.toList());

        // Award points to top 3
        int[] points = {50, 30, 20};

        for (int i = 0; i < Math.min(submissions.size(), 3); i++) {
            Submission submission = submissions.get(i);
            User user = submission.getUser();
            user.setChallengePoints(user.getChallengePoints() + points[i]);
            userRepository.save(user);
            System.out.println(">>> Awarded " + points[i] + " points to "
                    + user.getName() + " (rank " + (i + 1) + ")");
        }
    }
}