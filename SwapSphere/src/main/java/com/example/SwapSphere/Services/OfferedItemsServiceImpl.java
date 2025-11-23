package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.OfferedItem;

@Service
public class OfferedItemsServiceImpl implements OfferedItemsService {

    @Autowired
    private JdbcTemplate template;
    @Override
    public OfferedItem createItem(OfferedItem item) {

        String sql = "INSERT INTO offered_items (username, title, description, category, condition, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

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
    public OfferedItem getItemById(Long id) {
        String sql = "SELECT * FROM offered_items WHERE offered_item_id = ?";

        return template.query(sql, rs -> {
            if (rs.next()) {
                return new BeanPropertyRowMapper<>(OfferedItem.class).mapRow(rs, 1);
            }
            return null;
        }, id);
    }

    @Override
    public List<OfferedItem> getAllItems() {
        String sql = "SELECT * FROM offered_items ORDER BY created_at DESC";

        return template.query(sql,
                new BeanPropertyRowMapper<>(OfferedItem.class)
        );
    }

    @Override
    public OfferedItem updateItem(Long id, OfferedItem item) {

        String sql = "UPDATE offered_items SET title = ?, description = ?, category = ?, condition = ?, priority = ?, status = ? WHERE offered_item_id = ?";

        template.update(sql,
                item.getTitle(),
                item.getDescription(),
                item.getCategory(),
                item.getCondition(),
                item.getPriority(),
                item.getStatus(),
                id
        );

        item.setOfferedItemId(id);
        return item;
    }

    @Override
    public void deleteItem(Long id) {
        String sql = "DELETE FROM offered_items WHERE offered_item_id = ?";
        template.update(sql, id);
    }
}
