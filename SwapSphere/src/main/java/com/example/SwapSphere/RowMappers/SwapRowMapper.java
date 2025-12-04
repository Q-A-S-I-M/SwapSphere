package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Services.OfferedItemsService;
import com.example.SwapSphere.Services.UserService;

@Component
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

        // Nested offered items - offered_item can be null for token-only swaps
        Object offeredItemObj = rs.getObject("offered_item");
        if (offeredItemObj != null) {
            try {
                Long offeredItemId = rs.getLong("offered_item");
                // Check if it's a valid ID (not 0, which could be a default/null value)
                if (offeredItemId != null && offeredItemId > 0) {
                    swap.setOfferedItem(offeredItemsService.getItemById(offeredItemId));
                } else {
                    swap.setOfferedItem(null);
                }
            } catch (Exception e) {
                swap.setOfferedItem(null);
            }
        } else {
            swap.setOfferedItem(null);
        }
        
        swap.setRequestedItem(offeredItemsService.getItemById(rs.getLong("requested_item")));

        swap.setStatus(rs.getString("status"));
        swap.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        Timestamp completed = rs.getTimestamp("completed_at");
        if (completed != null)
            swap.setCompletedAt(completed.toLocalDateTime());

        return swap;
    }
}

