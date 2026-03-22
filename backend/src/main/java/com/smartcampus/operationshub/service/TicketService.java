package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Ticket;
import com.smartcampus.operationshub.model.TicketStatus;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository, NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByReporter(String email) {
        return ticketRepository.findByReportedByEmail(email);
    }

    public Ticket createTicket(Ticket ticket) {
        if (ticket.getAttachmentUrls() != null && ticket.getAttachmentUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 attachments allowed per ticket.");
        }
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketStatus(Long id, TicketStatus status, String resolutionNotes, User activeUser) {
        return ticketRepository.findById(id).map(t -> {
            boolean isAdmin = activeUser.getRole().name().equals("ADMIN");
            boolean isAssignedTech = t.getAssignedTechnician() != null && t.getAssignedTechnician().getEmail().equals(activeUser.getEmail());

            if (!isAdmin && !isAssignedTech) {
                throw new RuntimeException("Unauthorized to update ticket status");
            }

            t.setStatus(status);
            if (resolutionNotes != null) {
                t.setResolutionNotes(resolutionNotes);
            }
            
            notificationService.sendNotification(t.getReportedBy(), "Your ticket #" + t.getId() + " status is now " + status.name());
            
            return ticketRepository.save(t);
        }).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket assignTechnician(Long ticketId, User technician) {
        return ticketRepository.findById(ticketId).map(t -> {
            t.setAssignedTechnician(technician);
            t.setStatus(TicketStatus.IN_PROGRESS);
            return ticketRepository.save(t);
        }).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }
}
