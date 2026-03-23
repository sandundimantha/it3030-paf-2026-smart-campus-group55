package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.*;
import com.smartcampus.operationshub.repository.CommentRepository;
import com.smartcampus.operationshub.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommentService commentService;

    private User reporter;
    private User commenter;
    private User admin;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        reporter = User.builder().id(1L).email("reporter@campus.edu").name("Reporter").role(Role.USER).build();
        commenter = User.builder().id(2L).email("tech@campus.edu").name("Tech").role(Role.TECHNICIAN).build();
        admin = User.builder().id(3L).email("admin@campus.edu").name("Admin").role(Role.ADMIN).build();

        ticket = Ticket.builder()
                .id(1L)
                .reportedBy(reporter)
                .description("Broken projector")
                .status(TicketStatus.OPEN)
                .build();
    }

    @Test
    void getCommentsByTicketId_ReturnsList() {
        Comment c1 = Comment.builder().id(1L).ticket(ticket).author(reporter).content("First").build();
        Comment c2 = Comment.builder().id(2L).ticket(ticket).author(commenter).content("Second").build();
        when(commentRepository.findByTicketIdOrderByTimestampAsc(1L)).thenReturn(List.of(c1, c2));

        List<Comment> result = commentService.getCommentsByTicketId(1L);

        assertEquals(2, result.size());
        assertEquals("First", result.get(0).getContent());
    }

    @Test
    void addComment_ByDifferentUser_NotifiesReporter() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));

        Comment result = commentService.addComment(1L, "I'll look into this", commenter);

        assertEquals("I'll look into this", result.getContent());
        assertEquals(commenter, result.getAuthor());
        verify(notificationService).sendNotification(eq(reporter), contains("#1"));
    }

    @Test
    void addComment_ByReporter_NoNotification() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));

        commentService.addComment(1L, "Any updates?", reporter);

        verify(notificationService, never()).sendNotification(any(), anyString());
    }

    @Test
    void addComment_TicketNotFound_ThrowsException() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                commentService.addComment(99L, "Test", commenter));
    }

    @Test
    void deleteComment_ByAuthor_Success() {
        Comment comment = Comment.builder().id(1L).ticket(ticket).author(commenter).content("Test").build();
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(1L, commenter);

        verify(commentRepository).delete(comment);
    }

    @Test
    void deleteComment_ByAdmin_Success() {
        Comment comment = Comment.builder().id(1L).ticket(ticket).author(commenter).content("Test").build();
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(1L, admin);

        verify(commentRepository).delete(comment);
    }

    @Test
    void deleteComment_ByUnauthorizedUser_ThrowsException() {
        Comment comment = Comment.builder().id(1L).ticket(ticket).author(commenter).content("Test").build();
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        assertThrows(RuntimeException.class, () ->
                commentService.deleteComment(1L, reporter));
        verify(commentRepository, never()).delete(any());
    }

    @Test
    void deleteComment_NotFound_ThrowsException() {
        when(commentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                commentService.deleteComment(99L, admin));
    }
}
