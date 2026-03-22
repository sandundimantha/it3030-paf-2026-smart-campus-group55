package com.smartcampus.operationshub.repository;

import com.smartcampus.operationshub.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketIdOrderByTimestampAsc(Long ticketId);
}
