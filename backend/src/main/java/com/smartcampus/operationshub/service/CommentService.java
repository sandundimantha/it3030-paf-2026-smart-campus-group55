package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Comment;
import com.smartcampus.operationshub.model.Ticket;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.CommentRepository;
import com.smartcampus.operationshub.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketIdOrderByTimestampAsc(ticketId);
    }

    public Comment addComment(Long ticketId, String content, User author) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .content(content)
                .build();
                
        // Notify the reporter if someone else commented
        if (!ticket.getReportedBy().getEmail().equals(author.getEmail())) {
            notificationService.sendNotification(ticket.getReportedBy(), "New comment on your ticket #" + ticket.getId());
        }
        
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, User activeUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (comment.getAuthor().getEmail().equals(activeUser.getEmail()) || activeUser.getRole().name().equals("ADMIN")) {
            commentRepository.delete(comment);
        } else {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
    }
}
