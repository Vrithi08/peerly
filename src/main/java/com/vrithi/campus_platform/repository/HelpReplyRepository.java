package com.vrithi.campus_platform.repository;

import com.vrithi.campus_platform.entity.HelpReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HelpReplyRepository extends JpaRepository<HelpReply, Long> {
    List<HelpReply> findByHelpPostId(Long helpPostId);
    List<HelpReply> findByUserId(Long userId);
}