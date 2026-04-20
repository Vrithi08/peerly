package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.SubmissionResponse;
import com.vrithi.campus_platform.entity.*;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public SubmissionResponse submitWithFile(Long challengeId,
                                             MultipartFile file,
                                             String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (challenge.getStatus() != ChallengeStatus.OPEN) {
            throw new RuntimeException("Challenge is not open for submissions");
        }

        if (submissionRepository.existsByChallengeIdAndUserId(challengeId, user.getId())) {
            throw new RuntimeException("You have already submitted to this challenge");
        }

        String fileUrl = cloudinaryService.uploadFile(file);
        String contentType = file.getContentType();
        ContentType type = contentType != null && contentType.startsWith("image")
                ? ContentType.IMAGE : ContentType.AUDIO;

        Submission submission = new Submission();
        submission.setChallenge(challenge);
        submission.setUser(user);
        submission.setContentUrl(fileUrl);
        submission.setContentType(type);

        return mapToResponse(submissionRepository.save(submission));
    }

    public SubmissionResponse submitWithText(Long challengeId,
                                             String textContent,
                                             String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (challenge.getStatus() != ChallengeStatus.OPEN) {
            throw new RuntimeException("Challenge is not open for submissions");
        }

        if (submissionRepository.existsByChallengeIdAndUserId(challengeId, user.getId())) {
            throw new RuntimeException("You have already submitted to this challenge");
        }

        Submission submission = new Submission();
        submission.setChallenge(challenge);
        submission.setUser(user);
        submission.setTextContent(textContent);
        submission.setContentType(ContentType.TEXT);

        return mapToResponse(submissionRepository.save(submission));
    }

    public List<SubmissionResponse> getSubmissionsByChallenge(Long challengeId) {
        return submissionRepository.findByChallengeId(challengeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        SubmissionResponse response = new SubmissionResponse();
        response.setId(submission.getId());
        response.setChallengeId(submission.getChallenge().getId());
        response.setChallengeTitle(submission.getChallenge().getTitle());
        response.setSubmittedByName(submission.getUser().getName());
        response.setSubmittedByEmail(submission.getUser().getEmail());
        response.setContentUrl(submission.getContentUrl());
        response.setTextContent(submission.getTextContent());
        response.setContentType(submission.getContentType());
        response.setVoteCount(submission.getVoteCount());
        response.setSubmittedAt(submission.getSubmittedAt());
        return response;
    }
}