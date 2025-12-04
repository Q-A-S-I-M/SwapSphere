package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Notification;
import com.example.SwapSphere.Entities.Rating;
import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Entities.User;
import com.example.SwapSphere.RowMappers.NotificationRowMapper;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private JdbcTemplate template;
    
    @Autowired
    private NotificationRowMapper notificationRowMapper;
    
    @Override
    public List<Notification> getByUser(String username) {
        String sql = "SELECT * FROM notifications WHERE username = ? ORDER BY created_at DESC";
        List<Notification> notifications = template.query(sql, notificationRowMapper, username);
        for (Notification notification : notifications) {
            markAsRead(notification.getNotificationId());
            notification.setRead(true);
        }
        return notifications;
    }

    @Override
    public void markAsRead(Long id) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?";
        template.update(sql, id);
    }

    @Override
    public void addNotification(Notification notification) {
        String sql = "INSERT INTO notifications (username, type, message, is_read, created_at) VALUES (?, ?, ?, FALSE, NOW())";
        template.update(sql, notification.getUser().getUsername(), notification.getType(), notification.getMessage());
    }

    @Override
    public void generateNotificationForSwaps(Swap swap, String status) {
        User username;
        String type;
        String message;
        switch (status) {
            case "ACCEPTED":
                username = swap.getSender();
                type = "GREEN";
                message = "Great news! "+swap.getReceiver().getUsername()+" has accepted your swap request for "+swap.getRequestedItem().getTitle()+". The swap is now awaiting confirmation.";
                break;
            case "REJECTED":
                username = swap.getSender();
                type = "RED";
                message = "Your swap proposal to "+swap.getReceiver().getUsername()+" for "+swap.getRequestedItem().getTitle()+" was rejected.";              
                break;
            case "CANCELLED":
                username = swap.getReceiver();
                type = "RED";
                message = swap.getSender().getUsername()+" has cancelled the swap request for "+swap.getRequestedItem().getTitle()+".";
                break;
            case "COMPLETED":
                username = swap.getSender();
                type = "GREEN";
                message = "Your swap with "+swap.getReceiver().getUsername()+" for "+swap.getRequestedItem().getTitle()+" has been completed successfully!";
                break;
            default:
                username = swap.getSender();
                type = "RED";
                message = "The swap with "+swap.getReceiver().getUsername()+" has failed";
                break;
        }
        addNotification(new Notification(null, username, type, message, false, null));
    }

    @Override
    public void tokensBought(User user, int tokens) {
        String type = "GREEN";
        String message = tokens + " tokens were added to your wallet.";
        addNotification(new Notification(null, user, type, message, false, null));
    }

    @Override
    public void tokenTransfer(String username1, User user, int tokens) {
        String type = "GREEN";
        String message = tokens + " tokens were transferred to your wallet by "+username1+".";
        addNotification(new Notification(null, user, type, message, false, null));
    }

    @Override
    public void generateReviewNotification(Rating rating) {
        String msg = rating.getRater().getUsername() +" gave you a review.";
        addNotification(new Notification(null, rating.getRatedUser(), "GREEN", msg, false, null));
    }

    @Override
    public void generatePriorityIncreaseNotification(User user, String title) {
        String msg = "Your item "+title+" has been increased by 5 priority.";
        addNotification(new Notification(null, user, "GREEN", msg, false, null));
    }
}
