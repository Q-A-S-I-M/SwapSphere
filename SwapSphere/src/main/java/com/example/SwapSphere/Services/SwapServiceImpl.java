package com.example.SwapSphere.Services;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.RowMappers.SwapRowMapper;

@Service
public class SwapServiceImpl implements SwapService {

    @Autowired
    JdbcTemplate template;
    @Autowired
    UserService userService;
    @Autowired
    OfferedItemsService offeredItemsService;
    @Autowired
    UserWalletService userWalletService;
    @Autowired
    NotificationService notificationService;

    @Override
    public Swap createSwap(Swap swap) {

        String sql = """
            INSERT INTO Swap (sender, receiver, offered_item, requested_item, status, created_at, tokens)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        template.update(sql,
                swap.getSender().getUsername(),
                swap.getReceiver().getUsername(),
                swap.getOfferedItem().getOfferedItemId(),
                swap.getRequestedItem().getOfferedItemId(),
                swap.getStatus(),
                LocalDateTime.now(),
                swap.getTokens()
        );

        String lastSql = "SELECT * FROM Swap ORDER BY swap_id DESC FETCH FIRST 1 ROWS ONLY";
        userWalletService.lockTokens(swap.getSender().getUsername(), swap.getTokens());
        return template.queryForObject(lastSql, new BeanPropertyRowMapper<>(Swap.class));
    }

    @Override
    public Swap getSwapById(Long id) {
        String sql = "SELECT * FROM swap_proposals WHERE swap_id = ?";
        return template.queryForObject(sql, new SwapRowMapper(), id);
    }


    @Override
    public List<Swap> getAllSwaps() {
        String sql = "SELECT * FROM swap_proposals";
        return template.query(sql, new BeanPropertyRowMapper<>(Swap.class));
    }
    @Override
    public List<Swap> getAllSwapsForReciever(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE reciever = ? AND status = 'PENDING'";
        List<Swap> swap_proposals = template.query(sql, new SwapRowMapper(), username);
        return swap_proposals;
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
        Swap swap = getSwapById(id);
        notificationService.generateNotificationForSwaps(swap, status);
        return swap;
    }

    @Override
    public List<Swap> getSwapHistory(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE (sender = ? OR reciever = ?) AND status != 'PENDING' ORDER BY completed_at DESC";
        List<Swap> swap_proposals = template.query(sql, new SwapRowMapper(), username, username);
        return swap_proposals;
    }

    @Override
    public List<Swap> getAllSwapsForSender(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE sender = ? AND status = 'PENDING'";
        List<Swap> swap_proposals = template.query(sql, new SwapRowMapper(), username, username);
        return swap_proposals;
    }
}
