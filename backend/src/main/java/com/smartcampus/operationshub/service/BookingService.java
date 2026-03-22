package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Booking;
import com.smartcampus.operationshub.model.BookingStatus;
import com.smartcampus.operationshub.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByEmail(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    public Booking requestBooking(Booking booking) {
        long overlapCount = bookingRepository.countOverlappingBookings(
                booking.getResource().getId(),
                booking.getStartTime(),
                booking.getEndTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        if (overlapCount > 0) {
            throw new RuntimeException("Scheduling conflict: Resource is already booked for this time range.");
        }

        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(Long id, BookingStatus newStatus, String rejectionReason) {
        return bookingRepository.findById(id).map(b -> {
            b.setStatus(newStatus);
            if (newStatus == BookingStatus.REJECTED) {
                b.setRejectionReason(rejectionReason);
            }
            
            notificationService.sendNotification(b.getUser(), "Your booking for " + b.getResource().getName() + " is now " + newStatus.name());
            
            return bookingRepository.save(b);
        }).orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
}
