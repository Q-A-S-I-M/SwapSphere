package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Notification;

public interface NotificationService {

    List<Notification> getByUser(Long userId);

    void markAsRead(Long id);
    
}
