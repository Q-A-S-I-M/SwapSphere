package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.WantedItem;
import com.example.SwapSphere.Services.UserService;

public class WantedItemRowMapper implements RowMapper<WantedItem> {
    @Autowired
    private UserService userService;
    @Override
    public WantedItem mapRow(ResultSet rs, int rowNum) throws SQLException {
        WantedItem item = new WantedItem();
        item.setWantedItemId(rs.getLong("wanted_item_id"));

        // Nested user
        item.setUser(userService.getUserById(rs.getString("username")));

        item.setTitle(rs.getString("title"));
        item.setPriority(rs.getInt("priority"));
        item.setCategory(rs.getString("category"));
        item.setDescription(rs.getString("description"));
        item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return item;
    }
}

