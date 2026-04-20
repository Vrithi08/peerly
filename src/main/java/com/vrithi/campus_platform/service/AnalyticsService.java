package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.AnalyticsResponse;
import com.vrithi.campus_platform.dto.LeaderboardEntry;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private HelpPostRepository helpPostRepository;

    @Autowired
    private HelpReplyRepository helpReplyRepository;

    @Autowired
    private LeaderboardService leaderboardService;

    public AnalyticsResponse getAnalytics() {
        AnalyticsResponse response = new AnalyticsResponse();

        // Platform-wide counts
        response.setTotalUsers((int) userRepository.count());
        response.setTotalChallenges((int) challengeRepository.count());
        response.setTotalSubmissions((int) submissionRepository.count());
        response.setTotalVotes((int) voteRepository.count());
        response.setTotalHelpPosts((int) helpPostRepository.count());
        response.setTotalHelpReplies((int) helpReplyRepository.count());

        // Challenges by category
        List<Object[]> categoryData = challengeRepository.countByCategory();
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        for (Object[] row : categoryData) {
            categoryMap.put(row[0].toString(), (Long) row[1]);
        }
        response.setChallengesByCategory(categoryMap);

        // Help posts by subject
        List<Object[]> subjectData = helpPostRepository.countBySubject();
        Map<String, Long> subjectMap = new LinkedHashMap<>();
        for (Object[] row : subjectData) {
            subjectMap.put(row[0].toString(), (Long) row[1]);
        }
        response.setHelpPostsBySubject(subjectMap);

        // Top 5 contributors
        List<LeaderboardEntry> top5 = leaderboardService.getLeaderboard()
                .stream()
                .limit(5)
                .collect(Collectors.toList());
        response.setTopContributors(top5);

        return response;
    }
}