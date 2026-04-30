package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.Notification;
import com.vrithi.campus_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndReadFalse(User user);
    void deleteByReferenceIdAndType(Long referenceId, String type);
}
