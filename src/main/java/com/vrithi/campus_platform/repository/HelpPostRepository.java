package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.HelpPost;
import com.vrithi.campus_platform.entity.Urgency;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface HelpPostRepository extends JpaRepository<HelpPost, Long> {
    List<HelpPost> findByResolvedFalseOrderByUrgencyDesc();
    List<HelpPost> findBySubjectContainingIgnoreCase(String subject);
    List<HelpPost> findByUserId(Long userId);
    @Query("SELECT h.subject, COUNT(h) FROM HelpPost h GROUP BY h.subject ORDER BY COUNT(h) DESC")
    List<Object[]> countBySubject();
}