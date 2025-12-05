package com.example.SwapSphere.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.DTOs.WarnUserRequest;
import com.example.SwapSphere.Entities.Notification;
import com.example.SwapSphere.Services.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{username}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationService.getByUser(username));
    }

    @PostMapping("/warn/{username}")
    public ResponseEntity<Notification> giveWarning(@PathVariable String username, @RequestBody WarnUserRequest request) {
        return ResponseEntity.ok(notificationService.giveWarning(username, request.getReason()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}


