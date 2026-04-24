package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.*;
import com.vrithi.campus_platform.entity.*;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HelpService {

    @Autowired
    private HelpPostRepository helpPostRepository;

    @Autowired
    private HelpReplyRepository helpReplyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Create a help post
    public HelpPostResponse createPost(HelpPostRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HelpPost post = new HelpPost();
        post.setUser(user);
        post.setSubject(request.getSubject());
        post.setTopic(request.getTopic());
        post.setDescription(request.getDescription());
        post.setUrgency(request.getUrgency() != null ? request.getUrgency() : Urgency.CHILL);

        return mapPostToResponse(helpPostRepository.save(post));
    }

    // Get all open posts sorted by urgency
    public List<HelpPostResponse> getAllOpenPosts() {
        return helpPostRepository.findByResolvedFalseOrderByUrgencyDesc()
                .stream()
                .map(this::mapPostToResponse)
                .collect(Collectors.toList());
    }

    // Get post by ID
    public HelpPostResponse getPostById(Long id) {
        HelpPost post = helpPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Help post not found"));
        return mapPostToResponse(post);
    }

    // Reply to a post
    public HelpReplyResponse replyToPost(Long postId, HelpReplyRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HelpPost post = helpPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Help post not found"));

        if (post.isResolved()) {
            throw new RuntimeException("This post is already resolved");
        }

        HelpReply reply = new HelpReply();
        reply.setHelpPost(post);
        reply.setUser(user);
        reply.setContent(request.getContent());
        reply.setMediaUrl(request.getMediaUrl());

        HelpReply saved = helpReplyRepository.save(reply);

        // Notify the post owner in real time
        messagingTemplate.convertAndSendToUser(
                post.getUser().getEmail(),
                "/queue/notifications",
                "New reply on your post: " + post.getTopic()
        );

        return mapReplyToResponse(saved);
    }

    // Accept a reply — marks it as best answer and awards points
    public HelpReplyResponse acceptReply(Long replyId, String email) {
        HelpReply reply = helpReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        HelpPost post = reply.getHelpPost();

        if (!post.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Only the post owner can accept a reply");
        }

        // Mark reply as accepted
        reply.setAccepted(true);
        helpReplyRepository.save(reply);

        // Mark post as resolved
        post.setResolved(true);
        helpPostRepository.save(post);

        // Award help points to the helper
        User helper = reply.getUser();
        helper.setHelpPoints(helper.getHelpPoints() + 10);
        userRepository.save(helper);

        return mapReplyToResponse(reply);
    }

    // Search posts by subject
    public List<HelpPostResponse> searchBySubject(String subject) {
        return helpPostRepository.findBySubjectContainingIgnoreCase(subject)
                .stream()
                .map(this::mapPostToResponse)
                .collect(Collectors.toList());
    }

    private HelpPostResponse mapPostToResponse(HelpPost post) {
        HelpPostResponse response = new HelpPostResponse();
        response.setId(post.getId());
        response.setPostedByName(post.getUser().getName());
        response.setPostedByEmail(post.getUser().getEmail());
        response.setSubject(post.getSubject());
        response.setTopic(post.getTopic());
        response.setDescription(post.getDescription());
        response.setUrgency(post.getUrgency());
        response.setResolved(post.isResolved());
        response.setCreatedAt(post.getCreatedAt());

        if (post.getReplies() != null) {
            response.setReplies(post.getReplies()
                    .stream()
                    .map(this::mapReplyToResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private HelpReplyResponse mapReplyToResponse(HelpReply reply) {
        HelpReplyResponse response = new HelpReplyResponse();
        response.setId(reply.getId());
        response.setHelpPostId(reply.getHelpPost().getId());
        response.setRepliedByName(reply.getUser().getName());
        response.setRepliedByEmail(reply.getUser().getEmail());
        response.setContent(reply.getContent());
        response.setMediaUrl(reply.getMediaUrl());
        response.setAccepted(reply.isAccepted());
        response.setCreatedAt(reply.getCreatedAt());
        return response;
    }
}