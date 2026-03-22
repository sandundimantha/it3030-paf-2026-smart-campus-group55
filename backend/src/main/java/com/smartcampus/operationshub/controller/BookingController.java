package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.model.Booking;
import com.smartcampus.operationshub.model.BookingStatus;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.UserRepository;
import com.smartcampus.operationshub.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Booking> getBookings(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        if ("ADMIN".equals(user.getRole().name())) {
            return bookingService.getAllBookings();
        } else {
            return bookingService.getBookingsByEmail(email);
        }
    }

    @PostMapping
    public Booking requestBooking(@AuthenticationPrincipal Jwt jwt, @RequestBody Booking booking) {
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        booking.setUser(user);
        return bookingService.requestBooking(booking);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Booking updateStatus(@PathVariable Long id, 
                                @RequestParam BookingStatus status, 
                                @RequestParam(required = false) String reason) {
        return bookingService.updateBookingStatus(id, status, reason);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id).orElseThrow();
        String email = jwt.getClaimAsString("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        
        if (booking.getUser().getEmail().equals(email) || "ADMIN".equals(user.getRole().name())) {
            bookingService.updateBookingStatus(id, BookingStatus.CANCELLED, null);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(403).build();
    }
}
