package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.ChallengeRequest;
import com.vrithi.campus_platform.dto.ChallengeResponse;
import com.vrithi.campus_platform.entity.Challenge;
import com.vrithi.campus_platform.entity.User;
import com.vrithi.campus_platform.repository.ChallengeRepository;
import com.vrithi.campus_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChallengeService {

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new challenge
    public ChallengeResponse createChallenge(ChallengeRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Challenge challenge = new Challenge();
        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setCategory(request.getCategory());
        challenge.setSubmissionDeadline(request.getSubmissionDeadline());
        challenge.setVotingDeadline(request.getVotingDeadline());
        challenge.setCreatedBy(user);

        Challenge saved = challengeRepository.save(challenge);
        return mapToResponse(saved);
    }

    // Get all challenges
    public List<ChallengeResponse> getAllChallenges() {
        return challengeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get challenge by ID
    public ChallengeResponse getChallengeById(Long id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return mapToResponse(challenge);
    }

    // Update challenge
    public ChallengeResponse updateChallenge(Long id, ChallengeRequest request, String email) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (!challenge.getCreatedBy().getEmail().equals(email)) {
            throw new RuntimeException("You can only edit your own challenges");
        }

        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setCategory(request.getCategory());
        challenge.setSubmissionDeadline(request.getSubmissionDeadline());
        challenge.setVotingDeadline(request.getVotingDeadline());

        return mapToResponse(challengeRepository.save(challenge));
    }

    // Delete challenge
    public void deleteChallenge(Long id, String email) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (!challenge.getCreatedBy().getEmail().equals(email)) {
            throw new RuntimeException("You can only delete your own challenges");
        }

        challengeRepository.delete(challenge);
    }

    // Helper — convert Entity to DTO
    private ChallengeResponse mapToResponse(Challenge challenge) {
        ChallengeResponse response = new ChallengeResponse();
        response.setId(challenge.getId());
        response.setTitle(challenge.getTitle());
        response.setDescription(challenge.getDescription());
        response.setCategory(challenge.getCategory());
        response.setStatus(challenge.getStatus());
        response.setCreatedByName(challenge.getCreatedBy().getName());
        response.setCreatedByEmail(challenge.getCreatedBy().getEmail());
        response.setSubmissionDeadline(challenge.getSubmissionDeadline());
        response.setVotingDeadline(challenge.getVotingDeadline());
        response.setCreatedAt(challenge.getCreatedAt());
        return response;
    }
}