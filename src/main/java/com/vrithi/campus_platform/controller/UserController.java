package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.UserProfileResponse;
import com.vrithi.campus_platform.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(leaderboardService.getMyProfile(userDetails.getUsername()));
    }

    @PostMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserProfileResponse request) {
        return ResponseEntity.ok(leaderboardService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<java.util.Map<String, String>> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = leaderboardService.uploadProfileImage(userDetails.getUsername(), file);
        return ResponseEntity.ok(java.util.Map.of("profileImage", imageUrl));
    }
}
