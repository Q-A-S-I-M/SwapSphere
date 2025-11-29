package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Notification;
import com.example.SwapSphere.Entities.Rating;
import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Entities.User;

public interface NotificationService {
    void addNotification(Notification notification);

    List<Notification> getByUser(String username);

    void markAsRead(Long id);

    void generateNotificationForSwaps(Swap swap, String status);

    void tokensBought(User username, int tokens);

    void tokenTransfer(String username1, User username2, int tokens);

    void generateReviewNotification(Rating rating);
    
}
