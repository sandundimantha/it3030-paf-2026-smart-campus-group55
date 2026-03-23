package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.*;
import com.smartcampus.operationshub.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Resource resource;
    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("john@campus.edu").name("John").role(Role.USER).build();
        resource = Resource.builder().id(1L).name("Lab 101").type(ResourceType.LAB).status(ResourceStatus.ACTIVE).build();
        sampleBooking = Booking.builder()
                .id(1L)
                .user(user)
                .resource(resource)
                .startTime(LocalDateTime.of(2026, 3, 25, 10, 0))
                .endTime(LocalDateTime.of(2026, 3, 25, 12, 0))
                .purpose("Lab Session")
                .status(BookingStatus.PENDING)
                .build();
    }

    @Test
    void getAllBookings_ReturnsList() {
        when(bookingRepository.findAll()).thenReturn(List.of(sampleBooking));

        List<Booking> result = bookingService.getAllBookings();

        assertEquals(1, result.size());
        verify(bookingRepository).findAll();
    }

    @Test
    void getBookingsByEmail_ReturnsUserBookings() {
        when(bookingRepository.findByUserEmail("john@campus.edu")).thenReturn(List.of(sampleBooking));

        List<Booking> result = bookingService.getBookingsByEmail("john@campus.edu");

        assertEquals(1, result.size());
        assertEquals("john@campus.edu", result.get(0).getUser().getEmail());
    }

    @Test
    void requestBooking_Success_NoConflict() {
        when(bookingRepository.countOverlappingBookings(eq(1L), any(), any(), anyList())).thenReturn(0L);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId(1L);
            return b;
        });

        Booking result = bookingService.requestBooking(sampleBooking);

        assertEquals(BookingStatus.PENDING, result.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void requestBooking_ConflictingTime_ThrowsException() {
        when(bookingRepository.countOverlappingBookings(eq(1L), any(), any(), anyList())).thenReturn(1L);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.requestBooking(sampleBooking));

        assertTrue(ex.getMessage().contains("conflict"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void updateBookingStatus_Approve() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking result = bookingService.updateBookingStatus(1L, BookingStatus.APPROVED, null);

        assertEquals(BookingStatus.APPROVED, result.getStatus());
        assertNull(result.getRejectionReason());
        verify(notificationService).sendNotification(eq(user), contains("APPROVED"));
    }

    @Test
    void updateBookingStatus_Reject_WithReason() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking result = bookingService.updateBookingStatus(1L, BookingStatus.REJECTED, "Room under maintenance");

        assertEquals(BookingStatus.REJECTED, result.getStatus());
        assertEquals("Room under maintenance", result.getRejectionReason());
        verify(notificationService).sendNotification(eq(user), contains("REJECTED"));
    }

    @Test
    void updateBookingStatus_NotFound_ThrowsException() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                bookingService.updateBookingStatus(99L, BookingStatus.APPROVED, null));
    }

    @Test
    void getBookingById_Found() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        Optional<Booking> result = bookingService.getBookingById(1L);

        assertTrue(result.isPresent());
        assertEquals("Lab Session", result.get().getPurpose());
    }

    @Test
    void getBookingById_NotFound() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertTrue(bookingService.getBookingById(99L).isEmpty());
    }
}
