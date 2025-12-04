package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Services.UserService;

@Component
public class OfferedItemRowMapper implements RowMapper<OfferedItem> {
    @Autowired
    private UserService userService;

    @Override
    public OfferedItem mapRow(ResultSet rs, int rowNum) throws SQLException {
        OfferedItem item = new OfferedItem();

        item.setOfferedItemId(rs.getLong("offered_item_id"));

        // Nested User
        String username = rs.getString("username");
        item.setUser(userService.getUserById(username));

        item.setTitle(rs.getString("title"));
        item.setDescription(rs.getString("description"));
        item.setCategory(rs.getString("category"));
        item.setCondition(rs.getString("item_condition"));
        item.setPriority(rs.getInt("priority"));
        item.setStatus(rs.getString("status"));
        item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return item;
    }
}

