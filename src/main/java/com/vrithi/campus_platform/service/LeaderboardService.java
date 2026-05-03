package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.LeaderboardEntry;
import com.vrithi.campus_platform.dto.SubmissionResponse;
import com.vrithi.campus_platform.dto.UserProfileResponse;
import com.vrithi.campus_platform.entity.Submission;
import com.vrithi.campus_platform.entity.User;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private HelpPostRepository helpPostRepository;

    @Autowired
    private HelpReplyRepository helpReplyRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<LeaderboardEntry> getLeaderboardByDepartment(String department) {
        List<User> users = userRepository.findAllOrderByTotalPointsDesc()
                .stream()
                .filter(u -> department.equalsIgnoreCase(u.getDepartment()))
                .collect(Collectors.toList());

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        for (int i = 0; i < users.size(); i++) {
            User user = users.get(i);
            int total = user.getChallengePoints() + user.getHelpPoints();
            leaderboard.add(new LeaderboardEntry(
                    user.getId(),
                    user.getName(),
                    user.getCollege(),
                    user.getChallengePoints(),
                    user.getHelpPoints(),
                    total,
                    i + 1,
                    user.getProfileImage()
            ));
        }
        return leaderboard;
    }

    // Get full leaderboard
    public List<LeaderboardEntry> getLeaderboard() {
        List<User> users = userRepository.findAllOrderByTotalPointsDesc();
        List<LeaderboardEntry> leaderboard = new ArrayList<>();

        for (int i = 0; i < users.size(); i++) {
            User user = users.get(i);
            int total = user.getChallengePoints() + user.getHelpPoints();
            leaderboard.add(new LeaderboardEntry(
                    user.getId(),
                    user.getName(),
                    user.getCollege(),
                    user.getChallengePoints(),
                    user.getHelpPoints(),
                    total,
                    i + 1,
                    user.getProfileImage()
            ));
        }

        return leaderboard;
    }

    // Get profile for any user by ID
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildProfile(user);
    }

    // Get profile for logged in user
    public UserProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildProfile(user);
    }

    private UserProfileResponse buildProfile(User user) {
        // Get rank
        List<User> allUsers = userRepository.findAllOrderByTotalPointsDesc();
        int rank = 1;
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId().equals(user.getId())) {
                rank = i + 1;
                break;
            }
        }

        // Get stats
        int totalSubmissions = submissionRepository.findByUserId(user.getId()).size();
        int totalHelpPosts = helpPostRepository.findByUserId(user.getId()).size();
        // Count replies given by this user
        int repliesGiven = helpReplyRepository.findByUserId(user.getId()).size();
        int acceptedReplies = (int) helpReplyRepository.findByUserId(user.getId())
                .stream()
                .filter(r -> r.isAccepted())
                .count();

        UserProfileResponse profile = new UserProfileResponse();
        profile.setId(user.getId());
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setCollege(user.getCollege());
        profile.setChallengePoints(user.getChallengePoints());
        profile.setHelpPoints(user.getHelpPoints());
        profile.setTotalPoints(user.getChallengePoints() + user.getHelpPoints());
        profile.setRank(rank);
        profile.setTotalSubmissions(totalSubmissions);
        profile.setTotalHelpPostsCreated(totalHelpPosts);
        profile.setTotalRepliesGiven(repliesGiven);
        profile.setAcceptedReplies(acceptedReplies);
        profile.setJoinedAt(user.getCreatedAt());
        profile.setDepartment(user.getDepartment());
        profile.setBatch(user.getBatch());
        profile.setSection(user.getSection());
        profile.setRollNumber(user.getRollNumber());
        profile.setDegreeType(user.getDegreeType());
        profile.setBio(user.getBio());
        profile.setGithubUrl(user.getGithubUrl());
        profile.setLinkedinUrl(user.getLinkedinUrl());
        profile.setProfileImage(user.getProfileImage());

        // Populate recent submissions
        List<Submission> submissions = submissionRepository.findByUserId(user.getId());
        List<SubmissionResponse> submissionResponses = submissions.stream().map(s -> {
            SubmissionResponse sr = new SubmissionResponse();
            sr.setId(s.getId());
            sr.setChallengeId(s.getChallenge().getId());
            sr.setChallengeTitle(s.getChallenge().getTitle());
            sr.setSubmittedByName(s.getUser().getName());
            sr.setSubmittedByEmail(s.getUser().getEmail());
            sr.setContentUrl(s.getContentUrl());
            sr.setTextContent(s.getTextContent());
            sr.setContentType(s.getContentType());
            sr.setVoteCount(s.getVoteCount());
            sr.setSubmittedAt(s.getSubmittedAt());
            return sr;
        }).collect(Collectors.toList());
        profile.setRecentSubmissions(submissionResponses);

        return profile;
    }

    public UserProfileResponse updateProfile(String email, UserProfileResponse request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getBatch() != null) user.setBatch(request.getBatch());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        
        userRepository.save(user);
        return buildProfile(user);
    }

    public String uploadProfileImage(String email, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            String imageUrl = cloudinaryService.uploadFile(file);
            user.setProfileImage(imageUrl);
            userRepository.save(user);
            return imageUrl;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload profile image", e);
        }
    }
}