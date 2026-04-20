package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.Challenge;
import com.vrithi.campus_platform.entity.ChallengeCategory;
import com.vrithi.campus_platform.entity.ChallengeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByStatus(ChallengeStatus status);
    List<Challenge> findByCategory(ChallengeCategory category);
    List<Challenge> findByCreatedById(Long userId);
    @Query("SELECT c.category, COUNT(c) FROM Challenge c GROUP BY c.category")
    List<Object[]> countByCategory();
}