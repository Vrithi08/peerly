package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);


    @Query("SELECT u FROM User u ORDER BY (u.challengePoints + u.helpPoints) DESC")
    List<User> findAllOrderByTotalPointsDesc();
}