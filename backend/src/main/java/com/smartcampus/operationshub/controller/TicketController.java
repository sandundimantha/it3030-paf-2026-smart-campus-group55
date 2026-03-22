package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.model.Comment;
import com.smartcampus.operationshub.model.Ticket;
import com.smartcampus.operationshub.model.TicketStatus;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.UserRepository;
import com.smartcampus.operationshub.service.CommentService;
import com.smartcampus.operationshub.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, CommentService commentService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Ticket> getTickets(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if ("ADMIN".equals(user.getRole().name())) {
            return ticketService.getAllTickets();
        }
        return ticketService.getTicketsByReporter(email);
    }

    @PostMapping
    public Ticket createTicket(@AuthenticationPrincipal Jwt jwt, @RequestBody Ticket ticket) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        ticket.setReportedBy(user);
        return ticketService.createTicket(ticket);
    }

    @PutMapping("/{id}/status")
    public Ticket updateTicketStatus(@AuthenticationPrincipal Jwt jwt, 
                                     @PathVariable Long id, 
                                     @RequestParam TicketStatus status, 
                                     @RequestParam(required = false) String resolutionNotes) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        return ticketService.updateTicketStatus(id, status, resolutionNotes, user);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public Ticket assignTechnician(@PathVariable Long id, @RequestParam String technicianEmail) {
        User technician = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        return ticketService.assignTechnician(id, technician);
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentService.getCommentsByTicketId(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addComment(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody Map<String, String> payload) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        return commentService.addComment(id, payload.get("content"), user);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@AuthenticationPrincipal Jwt jwt, @PathVariable Long commentId) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        commentService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}
