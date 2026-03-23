package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.*;
import com.smartcampus.operationshub.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TicketService ticketService;

    private User reporter;
    private User admin;
    private User technician;
    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        reporter = User.builder().id(1L).email("reporter@campus.edu").name("Reporter").role(Role.USER).build();
        admin = User.builder().id(2L).email("admin@campus.edu").name("Admin").role(Role.ADMIN).build();
        technician = User.builder().id(3L).email("tech@campus.edu").name("Technician").role(Role.TECHNICIAN).build();

        sampleTicket = Ticket.builder()
                .id(1L)
                .reportedBy(reporter)
                .category("HARDWARE_FAULT")
                .description("Projector broken in Lab 101")
                .priority("HIGH")
                .specificLocation("Lab 101")
                .status(TicketStatus.OPEN)
                .attachmentUrls(new ArrayList<>())
                .build();
    }

    @Test
    void getAllTickets_ReturnsList() {
        when(ticketRepository.findAll()).thenReturn(List.of(sampleTicket));

        List<Ticket> result = ticketService.getAllTickets();

        assertEquals(1, result.size());
    }

    @Test
    void getTicketsByReporter_ReturnsFilteredList() {
        when(ticketRepository.findByReportedByEmail("reporter@campus.edu")).thenReturn(List.of(sampleTicket));

        List<Ticket> result = ticketService.getTicketsByReporter("reporter@campus.edu");

        assertEquals(1, result.size());
    }

    @Test
    void createTicket_Success_SetsStatusToOpen() {
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.createTicket(sampleTicket);

        assertEquals(TicketStatus.OPEN, result.getStatus());
        verify(ticketRepository).save(sampleTicket);
    }

    @Test
    void createTicket_TooManyAttachments_ThrowsException() {
        sampleTicket.setAttachmentUrls(List.of("a.jpg", "b.jpg", "c.jpg", "d.jpg"));

        assertThrows(IllegalArgumentException.class, () ->
                ticketService.createTicket(sampleTicket));
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void updateTicketStatus_AdminCanUpdate() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.updateTicketStatus(1L, TicketStatus.IN_PROGRESS, null, admin);

        assertEquals(TicketStatus.IN_PROGRESS, result.getStatus());
        verify(notificationService).sendNotification(eq(reporter), contains("IN_PROGRESS"));
    }

    @Test
    void updateTicketStatus_AssignedTechCanUpdate() {
        sampleTicket.setAssignedTechnician(technician);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.updateTicketStatus(1L, TicketStatus.RESOLVED, "Fixed the projector", technician);

        assertEquals(TicketStatus.RESOLVED, result.getStatus());
        assertEquals("Fixed the projector", result.getResolutionNotes());
    }

    @Test
    void updateTicketStatus_UnauthorizedUser_ThrowsException() {
        User randomUser = User.builder().id(5L).email("random@campus.edu").role(Role.USER).build();
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));

        assertThrows(RuntimeException.class, () ->
                ticketService.updateTicketStatus(1L, TicketStatus.IN_PROGRESS, null, randomUser));
    }

    @Test
    void updateTicketStatus_NotFound_ThrowsException() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                ticketService.updateTicketStatus(99L, TicketStatus.CLOSED, null, admin));
    }

    @Test
    void assignTechnician_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Ticket result = ticketService.assignTechnician(1L, technician);

        assertEquals(technician, result.getAssignedTechnician());
        assertEquals(TicketStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    void assignTechnician_NotFound_ThrowsException() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                ticketService.assignTechnician(99L, technician));
    }

    @Test
    void getTicketById_Found() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));

        assertTrue(ticketService.getTicketById(1L).isPresent());
    }

    @Test
    void getTicketById_NotFound() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertTrue(ticketService.getTicketById(99L).isEmpty());
    }
}
