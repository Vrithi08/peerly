package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByChallengeId(Long challengeId);
    List<Submission> findByUserId(Long userId);
    Optional<Submission> findByChallengeIdAndUserId(Long challengeId, Long userId);
    boolean existsByChallengeIdAndUserId(Long challengeId, Long userId);
    long countByChallengeId(Long challengeId);
}