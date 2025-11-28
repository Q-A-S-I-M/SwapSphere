package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Notification;

public interface NotificationService {
    void addNotification(Notification notification);

    List<Notification> getByUser(String username);

    void markAsRead(Long id);
    
}
