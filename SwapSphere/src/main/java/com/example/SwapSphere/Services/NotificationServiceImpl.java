package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Notification;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private JdbcTemplate template;
    
    @Override
    public List<Notification> getByUser(String username) {
        String sql = "SELECT * FROM notifications WHERE username = ? ORDER BY created_at DESC";

        return template.query(
                sql,
                new BeanPropertyRowMapper<>(Notification.class),
                username
        );
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
}
