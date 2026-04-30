package com.vrithi.campus_platform.controller;

import com.vrithi.campus_platform.dto.*;
import com.vrithi.campus_platform.service.HelpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/help")
public class HelpController {

    @Autowired
    private HelpService helpService;

    @PostMapping("/posts")
    public ResponseEntity<HelpPostResponse> createPost(
            @Valid @RequestBody HelpPostRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                helpService.createPost(request, userDetails.getUsername()));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<HelpPostResponse>> getAllPosts() {
        return ResponseEntity.ok(helpService.getAllPosts());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<HelpPostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(helpService.getPostById(id));
    }

    @PostMapping("/posts/{postId}/replies")
    public ResponseEntity<HelpReplyResponse> reply(
            @PathVariable Long postId,
            @Valid @RequestBody HelpReplyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                helpService.replyToPost(postId, request, userDetails.getUsername()));
    }

    @PutMapping("/replies/{replyId}/accept")
    public ResponseEntity<HelpReplyResponse> acceptReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                helpService.acceptReply(replyId, userDetails.getUsername()));
    }

    @GetMapping("/posts/search")
    public ResponseEntity<List<HelpPostResponse>> search(
            @RequestParam String subject) {
        return ResponseEntity.ok(helpService.searchBySubject(subject));
    }

    @PostMapping("/posts/{id}/delete")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id, 
            @AuthenticationPrincipal UserDetails userDetails) {
        helpService.deletePost(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}