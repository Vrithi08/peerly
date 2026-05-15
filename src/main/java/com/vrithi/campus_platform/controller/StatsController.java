package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.PlatformStatsResponse;
import com.vrithi.campus_platform.repository.ChallengeRepository;
import com.vrithi.campus_platform.repository.SubmissionRepository;
import com.vrithi.campus_platform.repository.UserRepository;
import com.vrithi.campus_platform.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@org.springframework.web.bind.annotation.CrossOrigin
public class StatsController {

    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final VoteRepository voteRepository;

    @Autowired
    public StatsController(ChallengeRepository challengeRepository, 
                           UserRepository userRepository, 
                           SubmissionRepository submissionRepository, 
                           VoteRepository voteRepository) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.voteRepository = voteRepository;
    }

    @GetMapping("/platform")
    public PlatformStatsResponse getPlatformStats() {
        return new PlatformStatsResponse(
                challengeRepository.count(),
                userRepository.count(),
                submissionRepository.count(),
                voteRepository.count()
        );
    }
}
