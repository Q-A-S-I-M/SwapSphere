package com.example.SwapSphere.Services;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.DTOs.CreateSwapRequest;
import com.example.SwapSphere.DTOs.SwapResponseDTO;
import com.example.SwapSphere.DTOs.SwapWithImages;
import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Entities.UserWallet;
import com.example.SwapSphere.RowMappers.SwapResponseDTORowMapper;
import com.example.SwapSphere.RowMappers.SwapRowMapper;
import com.example.SwapSphere.RowMappers.SwapWithImagesRowMapper;

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
    @Autowired
    SwapRowMapper swapRowMapper;
    @Autowired
    SwapWithImagesRowMapper swapWithImagesRowMapper;
    @Autowired
    SwapResponseDTORowMapper swapResponseDTORowMapper;

    @Override
    public Swap createSwap(CreateSwapRequest request) {
        // Validate tokens
        if (request.getTokens() < 0) {
            throw new RuntimeException("Tokens cannot be negative");
        }

        // If no item is offered, tokens must be > 0
        if (request.getOfferedItemId() == null && request.getTokens() <= 0) {
            throw new RuntimeException("You must offer either an item or tokens (or both)");
        }

        // Validate offered item if provided
        if (request.getOfferedItemId() != null) {
            OfferedItem offeredItem = offeredItemsService.getItemById(request.getOfferedItemId());
            if (offeredItem == null) {
                throw new RuntimeException("Offered item not found");
            }
            if (!offeredItem.getUser().getUsername().equals(request.getSenderUsername())) {
                throw new RuntimeException("You can only offer your own items");
            }
        }

        // Validate that requested item exists
        OfferedItem requestedItem = offeredItemsService.getItemById(request.getRequestedItemId());
        if (requestedItem == null) {
            throw new RuntimeException("Requested item not found");
        }

        // Validate token availability BEFORE inserting swap
        if (request.getTokens() > 0) {
            UserWallet wallet = userWalletService.getWalletByUserId(request.getSenderUsername());
            int availableTokens = wallet.getTokensAvailable() - wallet.getTokensLocked();
            if (availableTokens < request.getTokens()) {
                throw new RuntimeException("Not enough tokens available. You have " + availableTokens + " tokens available, but trying to offer " + request.getTokens() + " tokens.");
            }
        }

        String sql = """
            INSERT INTO swap_proposals (sender, receiver, offered_item, requested_item, status, created_at, tokens)
            VALUES (?, ?, ?, ?, 'PENDING', NOW(), ?)
        """;

        template.update(sql,
                request.getSenderUsername(),
                request.getReceiverUsername(),
                request.getOfferedItemId(), // Can be null
                request.getRequestedItemId(),
                request.getTokens()
        );

        String lastSql = "SELECT * FROM swap_proposals ORDER BY swap_id DESC LIMIT 1";
        // Lock tokens after successful swap creation
        if (request.getTokens() > 0) {
            userWalletService.lockTokens(request.getSenderUsername(), request.getTokens());
        }
        return template.queryForObject(lastSql, swapRowMapper);
    }

    @Override
    public Swap getSwapById(Long id) {
        String sql = "SELECT * FROM swap_proposals WHERE swap_id = ?";
        return template.queryForObject(sql, swapRowMapper, id);
    }


    @Override
    public List<Swap> getAllSwaps() {
        String sql = "SELECT * FROM swap_proposals";
        return template.query(sql, new BeanPropertyRowMapper<>(Swap.class));
    }
    @Override
    public List<Swap> getAllSwapsForReciever(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE receiver = ? AND status = 'PENDING'";
        List<Swap> swap_proposals = template.query(sql, swapRowMapper, username);
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
        String sql = "SELECT * FROM swap_proposals WHERE (sender = ? OR receiver = ?) AND status != 'PENDING' ORDER BY completed_at DESC";
        List<Swap> swap_proposals = template.query(sql, swapRowMapper, username, username);
        return swap_proposals;
    }

    @Override
    public List<Swap> getAllSwapsForSender(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE sender = ? AND status = 'PENDING'";
        List<Swap> swap_proposals = template.query(sql, swapRowMapper, username);
        return swap_proposals;
    }

    @Override
    public List<SwapWithImages> getAllSwapsForRecieverWithImages(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE receiver = ? AND status = 'PENDING'";
        List<SwapWithImages> swap_proposals = template.query(sql, swapWithImagesRowMapper, username);
        return swap_proposals;
    }

    @Override
    public List<SwapWithImages> getAllSwapsForSenderWithImages(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE sender = ? AND status = 'PENDING'";
        List<SwapWithImages> swap_proposals = template.query(sql, swapWithImagesRowMapper, username);
        return swap_proposals;
    }

    @Override
    public List<SwapResponseDTO> getAllSwapsForRecieverWithImagesDTO(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE receiver = ? AND status = 'PENDING'";
        List<SwapResponseDTO> swap_proposals = template.query(sql, swapResponseDTORowMapper, username);
        return swap_proposals;
    }

    @Override
    public List<SwapResponseDTO> getAllSwapsForSenderWithImagesDTO(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE sender = ? AND status = 'PENDING'";
        List<SwapResponseDTO> swap_proposals = template.query(sql, swapResponseDTORowMapper, username);
        return swap_proposals;
    }

    @Override
    public List<SwapResponseDTO> getSwapHistoryWithImages(String username) {
        String sql = "SELECT * FROM swap_proposals WHERE (sender = ? OR receiver = ?) AND status != 'PENDING' ORDER BY COALESCE(completed_at, created_at) DESC";
        List<SwapResponseDTO> swap_proposals = template.query(sql, swapResponseDTORowMapper, username, username);
        return swap_proposals;
    }
}
