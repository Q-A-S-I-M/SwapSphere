package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.DTOs.OfferedItemWithImages;
import com.example.SwapSphere.Entities.OfferedItem;

@Service
public class OfferedItemsServiceImpl implements OfferedItemsService {

    @Autowired
    private JdbcTemplate template;
    @Override
    public OfferedItem createItem(OfferedItem item) {

        String sql = "INSERT INTO offered_items (username, title, description, category, item_condition, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

        template.update(sql,
                item.getUser().getUsername(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory(),
                item.getCondition(),
                item.getPriority(),
                item.getStatus()
        );

        String getIdSql = "SELECT LAST_INSERT_ID()";
        Long newId = template.queryForObject(getIdSql, Long.class);

        item.setOfferedItemId(newId);
        return item;
    }

    @Override
    public OfferedItemWithImages getItemByIdWithImages(Long id) {
        String sql = "SELECT * FROM offered_items WHERE offered_item_id = ?";
        OfferedItem item = template.queryForObject(sql, new BeanPropertyRowMapper<>(OfferedItem.class), id);
        sql = "SELECT img_url FROM images WHERE offered_item_id = ?";
        List<String> urls = template.query(sql, new BeanPropertyRowMapper<>(), id);
        return new OfferedItemWithImages(item, urls);
    }

    @Override
    public OfferedItem getItemById(Long id) {
        String sql = "SELECT * FROM offered_items WHERE offered_item_id = ?";
        OfferedItem item = template.queryForObject(sql, new BeanPropertyRowMapper<>(OfferedItem.class), id);
        return item;
    }

    @Override
    public List<OfferedItemWithImages> getAllItemsByUser(String username) {
        String sql = """
            SELECT o.*, i.img_url AS first_img
            FROM offered_items o
            LEFT JOIN images i ON o.offered_item_id = i.offered_item_id
            AND i.img_url IS NOT NULL
            WHERE o.username = ?
            GROUP BY o.offered_item_id
            ORDER BY o.created_at DESC
        """;

        return template.query(sql, (rs, rowNum) -> {
            OfferedItem item = new BeanPropertyRowMapper<>(OfferedItem.class).mapRow(rs, rowNum);
            String img = rs.getString("first_img");
            List<String> images = img != null ? List.of(img) : List.of();
            return new OfferedItemWithImages(item, images);
        }, username);
    }




    @Override
    public OfferedItem updateItemStatus(Long id, String status) {

        String sql = "UPDATE offered_items SET status = ? WHERE offered_item_id = ?";

        template.update(sql,
                status,
                id
        );
        return getItemById(id);
    }
    @Override
    public OfferedItem updateItemPriority(Long id, int priority) {

        String sql = "UPDATE offered_items SET priority = ? WHERE offered_item_id = ?";

        template.update(sql,
                priority,
                id
        );
        
        return getItemById(id);
    }

    @Override
    public void deleteItem(Long id) {
        String sql = "DELETE FROM offered_items WHERE offered_item_id = ?";
        template.update(sql, id);
    }
    
}
