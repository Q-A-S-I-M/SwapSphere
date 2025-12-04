package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.DTOs.SwapWithImages;
import com.example.SwapSphere.Services.OfferedItemsService;
import com.example.SwapSphere.Services.UserService;

@Component
public class SwapWithImagesRowMapper implements RowMapper<SwapWithImages> {
    @Autowired
    private UserService userService;
    @Autowired
    private OfferedItemsService offeredItemsService;
    @Autowired
    private JdbcTemplate template;

    @Override
    public SwapWithImages mapRow(ResultSet rs, int rowNum) throws SQLException {
        SwapWithImages swap = new SwapWithImages();
        swap.setSwapId(rs.getLong("swap_id"));

        // Nested user objects
        swap.setSender(userService.getUserById(rs.getString("sender")));
        swap.setReceiver(userService.getUserById(rs.getString("receiver")));

        // Nested offered items
        Long offeredItemId = rs.getLong("offered_item");
        Long requestedItemId = rs.getLong("requested_item");
        
        swap.setOfferedItem(offeredItemsService.getItemById(offeredItemId));
        swap.setRequestedItem(offeredItemsService.getItemById(requestedItemId));

        // Get first image for offered item
        String offeredImageSql = "SELECT img_url FROM images WHERE offered_item_id = ? LIMIT 1";
        try {
            List<String> offeredImages = template.query(offeredImageSql, 
                (rs2, rowNum2) -> rs2.getString("img_url"), offeredItemId);
            swap.setOfferedItemImage(offeredImages.isEmpty() ? null : offeredImages.get(0));
        } catch (Exception e) {
            swap.setOfferedItemImage(null);
        }

        // Get first image for requested item
        String requestedImageSql = "SELECT img_url FROM images WHERE offered_item_id = ? LIMIT 1";
        try {
            List<String> requestedImages = template.query(requestedImageSql, 
                (rs2, rowNum2) -> rs2.getString("img_url"), requestedItemId);
            swap.setRequestedItemImage(requestedImages.isEmpty() ? null : requestedImages.get(0));
        } catch (Exception e) {
            swap.setRequestedItemImage(null);
        }

        swap.setTokens(rs.getInt("tokens"));
        swap.setStatus(rs.getString("status"));
        swap.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        Timestamp completed = rs.getTimestamp("completed_at");
        if (completed != null)
            swap.setCompletedAt(completed.toLocalDateTime());

        return swap;
    }
}

