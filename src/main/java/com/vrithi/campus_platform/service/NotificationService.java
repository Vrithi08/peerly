package com.vrithi.campus_platform.service;

import com.vrithi.campus_platform.dto.NotificationResponse;
import com.vrithi.campus_platform.entity.Notification;
import com.vrithi.campus_platform.entity.User;
import com.vrithi.campus_platform.repository.NotificationRepository;
import com.vrithi.campus_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(User user, String message, String type, Long referenceId) {
        Notification notification = new Notification(user, message, type, referenceId);
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setRead(n.isRead());
        res.setReferenceId(n.getReferenceId());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public void deleteByReferenceIdAndType(Long referenceId, String type) {
        notificationRepository.deleteByReferenceIdAndType(referenceId, type);
    }
}
