package com.example.SwapSphere.Services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.WantedItem;

@Service
public class WantedItemsServiceImpl implements WantedItemsService {

    @Autowired
    JdbcTemplate template;

    @Override
    public WantedItem createWantedItem(WantedItem item) {
        String sql = """
            INSERT INTO wanted_items (username, title, priority, category, description, created_at) 
            VALUES (?, ?, ?, ?, ?, ?)
        """;
        item.setCreatedAt(LocalDateTime.now());
        template.update(sql, item.getUser().getUsername(), item.getTitle(), item.getPriority(), item.getCategory(),
                item.getDescription(), item.getCreatedAt());
        return item;
    }

    @Override
    public WantedItem getById(Long id) {
        String sql = "SELECT * FROM wanted_items WHERE wanted_item_id = ?";
        return template.queryForObject(sql, new BeanPropertyRowMapper<>(WantedItem.class), id);
    }

    @Override
    public List<WantedItem> getAll() {
        String sql = "SELECT * FROM wanted_items";
        return template.query(sql, new BeanPropertyRowMapper<>(WantedItem.class));
    }

    @Override
    public WantedItem update(Long id, WantedItem item) {
        String sql = """
            UPDATE wanted_items SET title = ?, priority = ?, category = ?, description = ? 
            WHERE wanted_item_id = ?
        """;
        template.update(sql, item.getTitle(), item.getPriority(), item.getCategory(), item.getDescription(), id);
        return getById(id);
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM wanted_items WHERE wanted_item_id = ?";
        template.update(sql, id);
    }
}
