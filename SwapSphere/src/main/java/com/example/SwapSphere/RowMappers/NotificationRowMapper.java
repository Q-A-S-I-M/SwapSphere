package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.Notification;
import com.example.SwapSphere.Services.UserService;

public class NotificationRowMapper implements RowMapper<Notification> {
    @Autowired
    private UserService userService;
    @Override
    public Notification mapRow(ResultSet rs, int rowNum) throws SQLException {
        Notification n = new Notification();
        n.setNotificationId(rs.getLong("notification_id"));

        n.setUser(userService.getUserById(rs.getString("username")));

        n.setType(rs.getString("type"));
        n.setMessage(rs.getString("message"));
        n.setRead(rs.getBoolean("is_read"));
        n.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return n;
    }
}

