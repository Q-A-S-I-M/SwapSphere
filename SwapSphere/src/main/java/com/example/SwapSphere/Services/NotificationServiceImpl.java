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
    public List<Notification> getByUser(Long userId) {
        String sql = "SELECT * FROM notifications WHERE username = ? ORDER BY created_at DESC";

        return template.query(
                sql,
                new BeanPropertyRowMapper<>(Notification.class),
                userId
        );
    }

    @Override
    public void markAsRead(Long id) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?";
        template.update(sql, id);
    }
}
