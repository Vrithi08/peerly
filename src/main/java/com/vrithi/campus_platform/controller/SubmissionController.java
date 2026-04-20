package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.SubmissionResponse;
import com.vrithi.campus_platform.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Submission controller is reachable!");
    }

    @PostMapping("/{challengeId}/file")
    public ResponseEntity<SubmissionResponse> submitFile(
            @PathVariable Long challengeId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        return ResponseEntity.ok(
                submissionService.submitWithFile(challengeId, file, userDetails.getUsername()));
    }

    @PostMapping("/{challengeId}/text")
    public ResponseEntity<SubmissionResponse> submitText(
            @PathVariable Long challengeId,
            @RequestParam("content") String content,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                submissionService.submitWithText(challengeId, content, userDetails.getUsername()));
    }

    @GetMapping("/{challengeId}")
    public ResponseEntity<List<SubmissionResponse>> getByChallenge(
            @PathVariable Long challengeId) {
        return ResponseEntity.ok(
                submissionService.getSubmissionsByChallenge(challengeId));
    }
}