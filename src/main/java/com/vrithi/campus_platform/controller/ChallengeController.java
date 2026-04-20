package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.ChallengeRequest;
import com.vrithi.campus_platform.dto.ChallengeResponse;
import com.vrithi.campus_platform.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @PostMapping
    public ResponseEntity<ChallengeResponse> create(
            @RequestBody ChallengeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                challengeService.createChallenge(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getAll() {
        return ResponseEntity.ok(challengeService.getAllChallenges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChallengeResponse> update(
            @PathVariable Long id,
            @RequestBody ChallengeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                challengeService.updateChallenge(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        challengeService.deleteChallenge(id, userDetails.getUsername());
        return ResponseEntity.ok("Challenge deleted");
    }
}