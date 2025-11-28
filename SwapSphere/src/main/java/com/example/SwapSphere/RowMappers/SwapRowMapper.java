package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Services.OfferedItemsService;
import com.example.SwapSphere.Services.UserService;

public class SwapRowMapper implements RowMapper<Swap> {
    @Autowired
    private UserService userService;
    @Autowired
    private OfferedItemsService offeredItemsService;

    @Override
    public Swap mapRow(ResultSet rs, int rowNum) throws SQLException {

        Swap swap = new Swap();
        swap.setSwapId(rs.getLong("swap_id"));

        // Nested user objects
        swap.setSender(userService.getUserById(rs.getString("sender")));
        swap.setReceiver(userService.getUserById(rs.getString("receiver")));

        // Nested offered items
        swap.setOfferedItem(offeredItemsService.getItemById(rs.getLong("offered_item")));
        swap.setRequestedItem(offeredItemsService.getItemById(rs.getLong("requested_item")));

        swap.setStatus(rs.getString("status"));
        swap.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        Timestamp completed = rs.getTimestamp("completed_at");
        if (completed != null)
            swap.setCompletedAt(completed.toLocalDateTime());

        return swap;
    }
}

