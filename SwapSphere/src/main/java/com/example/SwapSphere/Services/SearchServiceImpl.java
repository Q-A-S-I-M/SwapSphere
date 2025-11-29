package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.User;

@Service
public class SearchServiceImpl implements SearchService{
    @Autowired
    JdbcTemplate template;

    @Override
    public List<OfferedItem> searchItems(String keyword, String username) {
        String sql = "SELECT * FROM offered_items WHERE username != ? AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?)) ORDER BY priority DESC, created_at DESC";
        String search = "%" + keyword + "%";

        return template.query(sql, new BeanPropertyRowMapper<>(OfferedItem.class), username,
                search, search, search);
    }

    @Override
    public List<OfferedItem> searchItemsWithDistance(
            String keyword, User user, double maxDistanceKm) {

        String sql = """
            SELECT 
                oi.*,
                ( 6371 * acos(
                    cos(radians(?)) *
                    cos(radians(u.latitude)) *
                    cos(radians(u.longitude) - radians(?)) +
                    sin(radians(?)) *
                    sin(radians(u.latitude))
                )) AS distance
            FROM offered_items oi
            JOIN Users u ON oi.username = u.username
            WHERE oi.username != ?
            AND (
                    LOWER(oi.title) LIKE LOWER(?) 
                OR LOWER(oi.description) LIKE LOWER(?)
                OR LOWER(oi.category) LIKE LOWER(?)
            )
            HAVING distance <= ?
            ORDER BY distance ASC, oi.priority DESC, oi.created_at DESC
        """;

        String search = "%" + keyword.toLowerCase() + "%";

        return template.query(sql, (rs, rowNum) -> {
            OfferedItem item = new BeanPropertyRowMapper<>(OfferedItem.class)
                    .mapRow(rs, rowNum);

            return item;
        },
        user.getLocLat(), user.getLocLong(), user.getLocLat(),
        user.getUsername(),
        search, search, search,
        maxDistanceKm
        );
    }


    @Override
    public List<OfferedItem> searchItemsWithPotentialSwap(String keyword, User user, OfferedItem item) {
        return null;
    }

    @Override
    public List<OfferedItem> searchItemWithPotentialSwapAndDistance(String keyword, User user, double maxDistanceKm,
            OfferedItem item) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'searchItemWithPotentialSwapAndDistance'");
    }
    
}
