package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.VoteMessage;
import com.vrithi.campus_platform.entity.*;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VotingService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public VoteMessage castVote(Long submissionId, String email) {

        User voter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Challenge challenge = submission.getChallenge();

        // Check challenge is in VOTING phase
        if (challenge.getStatus() != ChallengeStatus.VOTING) {
            throw new RuntimeException("Challenge is not in voting phase");
        }

        // Check user hasn't already voted in this challenge
        if (voteRepository.existsByChallengeIdAndVoterId(challenge.getId(), voter.getId())) {
            throw new RuntimeException("You have already voted in this challenge");
        }

        // Check user is not voting for their own submission
        if (submission.getUser().getId().equals(voter.getId())) {
            throw new RuntimeException("You cannot vote for your own submission");
        }

        // Save vote
        Vote vote = new Vote();
        vote.setChallenge(challenge);
        vote.setVoter(voter);
        vote.setSubmission(submission);
        voteRepository.save(vote);

        // Increment vote count on submission
        submission.setVoteCount(submission.getVoteCount() + 1);
        submissionRepository.save(submission);

        // Create broadcast message
        VoteMessage message = new VoteMessage(
                submissionId,
                submission.getVoteCount(),
                challenge.getId()
        );

        // Broadcast to all clients watching this challenge
        messagingTemplate.convertAndSend(
                "/topic/challenge/" + challenge.getId() + "/votes",
                message
        );

        return message;
    }
}