package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.User;

public class UserRowMapper implements RowMapper<User> {
    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        User u = new User();
        u.setUsername(rs.getString("username"));
        u.setFullName(rs.getString("full_name"));
        u.setEmail(rs.getString("email"));
        u.setPassword(rs.getString("password"));
        u.setContact(rs.getString("contact"));
        u.setRole(rs.getString("role"));
        u.setRating(rs.getInt("rating"));
        u.setCreatedAt(rs.getTimestamp("created_at"));
        u.setLocLat(rs.getDouble("latitude"));
        u.setLocLong(rs.getDouble("longitude"));
        u.setProfilePicUrl(rs.getString("profile_pic_url"));
        return u;
    }
}

