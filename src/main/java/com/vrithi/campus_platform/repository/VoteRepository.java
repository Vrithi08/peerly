package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByChallengeIdAndVoterId(Long challengeId, Long voterId);
    long count();
}