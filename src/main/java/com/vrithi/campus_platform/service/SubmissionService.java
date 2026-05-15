package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.SubmissionResponse;
import com.vrithi.campus_platform.entity.*;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
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
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            Challenge challenge = challengeRepository.findById(challengeId)
                    .orElseThrow(() -> new RuntimeException("Challenge not found: " + challengeId));

            System.out.println("Processing submission for Challenge: " + challenge.getTitle() + " (ID: " + challengeId + ") by " + email);
            System.out.println("File Details: Name=" + file.getOriginalFilename() + ", Size=" + file.getSize() + ", MIME=" + file.getContentType());

            if (challenge.getStatus() != ChallengeStatus.OPEN) {
                System.err.println("REJECTED: Challenge status is " + challenge.getStatus());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This arena is not open for conquests (Status: " + challenge.getStatus() + ")");
            }

            if (challenge.getSubmissionDeadline() != null && java.time.LocalDateTime.now().isAfter(challenge.getSubmissionDeadline())) {
                System.err.println("REJECTED: Deadline " + challenge.getSubmissionDeadline() + " has passed");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The deadline has passed. Your solution was too late for the arena!");
            }

            if (submissionRepository.existsByChallengeIdAndUserId(challengeId, user.getId())) {
                System.err.println("REJECTED: User " + email + " already submitted to " + challengeId);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already made your mark on this challenge!");
            }

            System.out.println("Starting Cloudinary upload...");
            String fileUrl = cloudinaryService.uploadFile(file);
            System.out.println("Cloudinary upload successful: " + fileUrl);

            String mimeType = file.getContentType();
            ContentType type = ContentType.DOCUMENT;

            if (mimeType != null) {
                if (mimeType.startsWith("image")) type = ContentType.IMAGE;
                else if (mimeType.startsWith("audio")) type = ContentType.AUDIO;
                else if (mimeType.startsWith("video")) type = ContentType.VIDEO;
                else if (mimeType.contains("pdf") || mimeType.contains("word") || mimeType.contains("document") || mimeType.contains("zip")) type = ContentType.DOCUMENT;
            }

            Submission submission = new Submission();
            submission.setChallenge(challenge);
            submission.setUser(user);
            submission.setContentUrl(fileUrl);
            submission.setContentType(type);

            System.out.println("Saving submission to database...");
            // Award participation points
            user.setChallengePoints(user.getChallengePoints() + 5);
            userRepository.save(user);

            Submission saved = submissionRepository.save(submission);
            System.out.println("Submission saved successfully! ID: " + saved.getId());

            return mapToResponse(saved);
        } catch (Exception e) {
            System.err.println("SUBMISSION ERROR: " + e.getMessage());
            e.printStackTrace();
            if (e instanceof ResponseStatusException) throw (ResponseStatusException) e;
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The arena encountered an internal error: " + e.getMessage());
        }
    }

    public SubmissionResponse submitWithText(Long challengeId,
                                             String textContent,
                                             String email) {
        System.out.println("Processing submission for Challenge ID: " + challengeId + " by " + email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (challenge.getStatus() != ChallengeStatus.OPEN) {
            System.err.println("Rejected: Challenge not OPEN");
            throw new RuntimeException("Challenge is not open for submissions");
        }

        if (challenge.getSubmissionDeadline() != null && java.time.LocalDateTime.now().isAfter(challenge.getSubmissionDeadline())) {
            System.err.println("Rejected: Deadline passed");
            throw new RuntimeException("Submission deadline has passed!");
        }

        if (submissionRepository.existsByChallengeIdAndUserId(challengeId, user.getId())) {
            System.err.println("Rejected: Duplicate submission");
            throw new RuntimeException("You have already submitted to this challenge!");
        }

        Submission submission = new Submission();
        submission.setChallenge(challenge);
        submission.setUser(user);
        submission.setTextContent(textContent);
        submission.setContentType(ContentType.TEXT);

        // Award participation points
        user.setChallengePoints(user.getChallengePoints() + 5);
        userRepository.save(user);

        return mapToResponse(submissionRepository.save(submission));
    }

    public List<SubmissionResponse> getSubmissionsByChallenge(Long challengeId) {
        return submissionRepository.findByChallengeId(challengeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubmissionResponse getMySubmission(Long challengeId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return submissionRepository.findByChallengeIdAndUserId(challengeId, user.getId())
                .map(this::mapToResponse)
                .orElse(null);
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