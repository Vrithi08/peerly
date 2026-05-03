package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.*;
import com.vrithi.campus_platform.entity.*;
import com.vrithi.campus_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HelpService {

    @Autowired
    private HelpPostRepository helpPostRepository;

    @Autowired
    private HelpReplyRepository helpReplyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationService notificationService;

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
        post.setMediaUrl(request.getMediaUrl());

        return mapPostToResponse(helpPostRepository.save(post));
    }

    // Get all posts sorted by status and urgency
    public List<HelpPostResponse> getAllPosts() {
        return helpPostRepository.findAllByOrderByResolvedAscUrgencyDescCreatedAtDesc()
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

        // Notify the post owner (Non-blocking)
        try {
            System.out.println("Attempting to notify owner: " + post.getUser().getEmail());
            // Real-time
            messagingTemplate.convertAndSendToUser(
                    post.getUser().getEmail(),
                    "/queue/notifications",
                    "New reply on your post: " + post.getTopic()
            );

            // Persistent
            notificationService.createNotification(
                    post.getUser(),
                    "New reply on your post: " + post.getTopic(),
                    "REPLY",
                    post.getId()
            );
        } catch (Exception e) {
            System.err.println("Notification failed: " + e.getMessage());
            // We don't throw here so the reply still gets saved successfully
        }

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

        // Notify helper about points and accepted answer
        notificationService.createNotification(
                helper,
                "Your answer was accepted! +10 points earned.",
                "BEST_ANSWER",
                post.getId()
        );

        return mapReplyToResponse(reply);
    }

    // Search posts by subject
    public List<HelpPostResponse> searchBySubject(String subject) {
        return helpPostRepository.findBySubjectContainingIgnoreCase(subject)
                .stream()
                .map(this::mapPostToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long id, String email) {
        HelpPost post = helpPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Help post not found"));
        
        if (!post.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("You are not authorized to delete this post.");
        }
        
        // Delete all replies first to avoid constraint issues
        if (post.getReplies() != null && !post.getReplies().isEmpty()) {
            helpReplyRepository.deleteAll(post.getReplies());
        }

        // Delete notifications related to this post
        notificationService.deleteByReferenceIdAndType(id, "REPLY");
        
        helpPostRepository.delete(post);
    }

    private HelpPostResponse mapPostToResponse(HelpPost post) {
        HelpPostResponse response = new HelpPostResponse();
        response.setId(post.getId());
        response.setPostedByName(post.getUser().getName());
        response.setPostedByEmail(post.getUser().getEmail());
        response.setPostedByDepartment(post.getUser().getDepartment());
        response.setPostedByBatch(post.getUser().getBatch());
        response.setSubject(post.getSubject());
        response.setTopic(post.getTopic());
        response.setDescription(post.getDescription());
        response.setUrgency(post.getUrgency());
        response.setMediaUrl(post.getMediaUrl());
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
        response.setRepliedByDepartment(reply.getUser().getDepartment());
        response.setRepliedByBatch(reply.getUser().getBatch());
        response.setContent(reply.getContent());
        response.setMediaUrl(reply.getMediaUrl());
        response.setAccepted(reply.isAccepted());
        response.setCreatedAt(reply.getCreatedAt());
        return response;
    }
}