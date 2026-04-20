package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.LeaderboardEntry;
import com.vrithi.campus_platform.dto.UserProfileResponse;
import com.vrithi.campus_platform.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getLeaderboard());
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(leaderboardService.getUserProfile(userId));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                leaderboardService.getMyProfile(userDetails.getUsername()));
    }
    @GetMapping("/department/{dept}")
    public ResponseEntity<List<LeaderboardEntry>> getByDepartment(
            @PathVariable String dept) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardByDepartment(dept));
    }
}