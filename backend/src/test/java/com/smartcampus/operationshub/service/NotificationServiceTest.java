package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Notification;
import com.smartcampus.operationshub.model.Role;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("john@campus.edu").name("John").role(Role.USER).build();
    }

    @Test
    void sendNotification_CreatesAndSaves() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        notificationService.sendNotification(user, "Booking approved");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals("Booking approved", captor.getValue().getMessage());
        assertEquals(user, captor.getValue().getRecipient());
    }

    @Test
    void sendNotification_NullRecipient_DoesNothing() {
        notificationService.sendNotification(null, "Test message");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void getUserNotifications_ReturnsSortedList() {
        Notification n1 = Notification.builder().id(1L).recipient(user).message("Msg 1").build();
        Notification n2 = Notification.builder().id(2L).recipient(user).message("Msg 2").build();
        when(notificationRepository.findByRecipientEmailOrderByTimestampDesc("john@campus.edu"))
                .thenReturn(List.of(n2, n1));

        List<Notification> result = notificationService.getUserNotifications("john@campus.edu");

        assertEquals(2, result.size());
        assertEquals("Msg 2", result.get(0).getMessage());
    }

    @Test
    void markAsRead_CorrectUser_MarksRead() {
        Notification notification = Notification.builder()
                .id(1L).recipient(user).message("Test").isRead(false).build();
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(1L, "john@campus.edu");

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_WrongUser_DoesNotUpdate() {
        Notification notification = Notification.builder()
                .id(1L).recipient(user).message("Test").isRead(false).build();
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(1L, "other@campus.edu");

        assertFalse(notification.isRead());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAsRead_NotFound_DoesNothing() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        notificationService.markAsRead(99L, "john@campus.edu");

        verify(notificationRepository, never()).save(any());
    }
}
