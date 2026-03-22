package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.model.Notification;
import com.smartcampus.operationshub.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getNotifications(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.getUserNotifications(jwt.getClaimAsString("email"));
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        notificationService.markAsRead(id, jwt.getClaimAsString("email"));
    }
}
