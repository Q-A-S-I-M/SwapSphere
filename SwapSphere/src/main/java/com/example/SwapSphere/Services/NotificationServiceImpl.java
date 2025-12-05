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
        String itemTitle = swap.getRequestedItem() != null ? swap.getRequestedItem().getTitle() : "the item";
        
        switch (status) {
            case "ACCEPTED":
                username = swap.getSender();
                type = "BLUE";
                message = "Great news! "+swap.getReceiver().getUsername()+" has accepted your swap request for "+itemTitle+". The swap is now awaiting confirmation.";
                break;
            case "REJECTED":
                username = swap.getSender();
                type = "RED";
                message = "Your swap proposal to "+swap.getReceiver().getUsername()+" for "+itemTitle+" was rejected.";              
                break;
            case "CANCELLED":
                // This handles cancellation from PENDING status
                username = swap.getReceiver();
                type = "RED";
                message = swap.getSender().getUsername()+" has cancelled the swap request for "+itemTitle+".";
                break;
            case "COMPLETED":
                // Notify both parties
                String completedMessage = "Your swap with "+swap.getReceiver().getUsername()+" for "+itemTitle+" has been completed successfully!";
                addNotification(new Notification(null, swap.getSender(), "BLUE", completedMessage, false, null));
                
                String completedMessageReceiver = "Your swap with "+swap.getSender().getUsername()+" for "+itemTitle+" has been completed successfully!";
                addNotification(new Notification(null, swap.getReceiver(), "BLUE", completedMessageReceiver, false, null));
                return; // Already added notifications, return early
            default:
                username = swap.getSender();
                type = "RED";
                message = "The swap with "+swap.getReceiver().getUsername()+" has failed";
                break;
        }
        addNotification(new Notification(null, username, type, message, false, null));
    }
    
    @Override
    public void generateNotificationForCancelledAcceptedSwap(Swap swap, User cancellingUser, User otherUser) {
        String itemTitle = swap.getRequestedItem() != null ? swap.getRequestedItem().getTitle() : "the item";
        String type = "RED";
        
        // Notify the other party that the swap was cancelled
        String message = cancellingUser.getUsername() + " has cancelled the accepted swap for " + itemTitle + ". The items are now available again.";
        addNotification(new Notification(null, otherUser, type, message, false, null));
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
