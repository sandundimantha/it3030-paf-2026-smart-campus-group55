package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Notification;
import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void sendNotification(User recipient, String message) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByTimestampDesc(email);
    }

    public void markAsRead(Long id, String email) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getRecipient().getEmail().equals(email)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}
