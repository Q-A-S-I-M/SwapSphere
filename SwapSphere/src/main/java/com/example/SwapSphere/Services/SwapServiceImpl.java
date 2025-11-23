package com.example.SwapSphere.Services;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Swap;

@Service
public class SwapServiceImpl implements SwapService {

    @Autowired
    JdbcTemplate template;

    @Override
    public Swap createSwap(Swap swap) {

        String sql = """
            INSERT INTO Swap (sender, receiver, offered_item, requested_item, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        template.update(sql,
                swap.getSender(),
                swap.getReceiver(),
                swap.getOfferedItem(),
                swap.getRequestedItem(),
                swap.getStatus(),
                LocalDateTime.now()
        );

        String lastSql = "SELECT * FROM Swap ORDER BY swap_id DESC FETCH FIRST 1 ROWS ONLY";

        return template.queryForObject(lastSql, new BeanPropertyRowMapper<>(Swap.class));
    }

    @Override
    public Swap getSwapById(Long id) {
        String sql = "SELECT * FROM swap_proposals WHERE swap_id = ?";
        return template.queryForObject(sql, new BeanPropertyRowMapper<>(Swap.class), id);
    }

    @Override
    public List<Swap> getAllSwaps() {
        String sql = "SELECT * FROM swap_proposals";
        return template.query(sql, new BeanPropertyRowMapper<>(Swap.class));
    }

    @Override
    public Swap updateStatus(Long id, String status) {

        String sql = """
            UPDATE swap_proposals
            SET status = ?,
                completed_at = CASE WHEN ? = 'COMPLETED' THEN ? ELSE completed_at END
            WHERE swap_id = ?
        """;

        LocalDateTime completedTime =
                status.equalsIgnoreCase("COMPLETED") ? LocalDateTime.now() : null;

        template.update(sql,
                status,
                status,
                completedTime,
                id);

        // return updated object
        return getSwapById(id);
    }
}
