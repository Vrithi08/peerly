package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.VoteMessage;
import com.vrithi.campus_platform.service.VotingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
public class VotingController {

    @Autowired
    private VotingService votingService;

    @PostMapping("/{submissionId}")
    public ResponseEntity<VoteMessage> vote(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                votingService.castVote(submissionId, userDetails.getUsername()));
    }
}