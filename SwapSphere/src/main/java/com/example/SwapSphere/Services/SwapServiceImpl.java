package com.example.SwapSphere.Services;

import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.DTOs.CreateSwapRequest;
import com.example.SwapSphere.DTOs.SwapResponseDTO;
import com.example.SwapSphere.DTOs.SwapWithImages;
import com.example.SwapSphere.Entities.Notification;
import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Entities.User;
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

        // No token validation - users can offer any amount of tokens in swaps
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
    public Swap updateStatus(Long id, String status, String currentUsername) {
        // Get the swap before updating to check current status
        Swap swapBeforeUpdate = getSwapById(id);
        String previousStatus = swapBeforeUpdate.getStatus();
        
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
        
        Long requestedItemId = swap.getRequestedItem() != null ? swap.getRequestedItem().getOfferedItemId() : null;
        Long offeredItemId = swap.getOfferedItem() != null ? swap.getOfferedItem().getOfferedItemId() : null;
        
        // Handle ACCEPTED status
        if (status.equalsIgnoreCase("ACCEPTED")) {
            // Set both items to UNAVAILABLE
            if (requestedItemId != null) {
                offeredItemsService.updateItemStatus(requestedItemId, "UNAVAILABLE");
            }
            if (offeredItemId != null) {
                offeredItemsService.updateItemStatus(offeredItemId, "UNAVAILABLE");
            }
            
            // Find all PENDING swaps involving either of these items and set them to HOLD
            List<Swap> relatedSwaps = findRelatedSwaps(id, offeredItemId, requestedItemId, "PENDING");
            
            for (Swap relatedSwap : relatedSwaps) {
                String holdSql = "UPDATE swap_proposals SET status = 'HOLD' WHERE swap_id = ?";
                template.update(holdSql, relatedSwap.getSwapId());
            }
        }
        // Handle CANCELLED status
        else if (status.equalsIgnoreCase("CANCELLED")) {
            // If cancelling from ACCEPTED, restore items to AVAILABLE and reactivate HOLD swaps
            if (previousStatus != null && previousStatus.equalsIgnoreCase("ACCEPTED")) {
                // Set both items back to AVAILABLE
                if (requestedItemId != null) {
                    offeredItemsService.updateItemStatus(requestedItemId, "AVAILABLE");
                }
                if (offeredItemId != null) {
                    offeredItemsService.updateItemStatus(offeredItemId, "AVAILABLE");
                }
                
                // Find all HOLD swaps involving either of these items and set them back to PENDING
                List<Swap> holdSwaps = findRelatedSwaps(id, offeredItemId, requestedItemId, "HOLD");
                
                for (Swap holdSwap : holdSwaps) {
                    String pendingSql = "UPDATE swap_proposals SET status = 'PENDING' WHERE swap_id = ?";
                    template.update(pendingSql, holdSwap.getSwapId());
                }
            }
            // If cancelling from PENDING, no token action needed (items remain AVAILABLE)
        }
        // Handle COMPLETED status
        else if (status.equalsIgnoreCase("COMPLETED")) {
            // Items should already be UNAVAILABLE (set when swap was ACCEPTED)
            // Cancel all related swaps (PENDING, HOLD, ACCEPTED)
            List<Swap> relatedSwaps = new ArrayList<>();
            
            // Find swaps with status PENDING, HOLD, or ACCEPTED
            if (offeredItemId != null && requestedItemId != null) {
                String findRelatedSwapsSql = """
                    SELECT * FROM swap_proposals 
                    WHERE swap_id != ? 
                    AND status IN ('PENDING', 'HOLD', 'ACCEPTED')
                    AND (
                        offered_item = ? OR requested_item = ? 
                        OR offered_item = ? OR requested_item = ?
                    )
                """;
                relatedSwaps = template.query(findRelatedSwapsSql, swapRowMapper,
                        id, offeredItemId, offeredItemId, requestedItemId, requestedItemId);
            } else if (offeredItemId != null) {
                String findRelatedSwapsSql = """
                    SELECT * FROM swap_proposals 
                    WHERE swap_id != ? 
                    AND status IN ('PENDING', 'HOLD', 'ACCEPTED')
                    AND (offered_item = ? OR requested_item = ?)
                """;
                relatedSwaps = template.query(findRelatedSwapsSql, swapRowMapper,
                        id, offeredItemId, offeredItemId);
            } else if (requestedItemId != null) {
                String findRelatedSwapsSql = """
                    SELECT * FROM swap_proposals 
                    WHERE swap_id != ? 
                    AND status IN ('PENDING', 'HOLD', 'ACCEPTED')
                    AND (offered_item = ? OR requested_item = ?)
                """;
                relatedSwaps = template.query(findRelatedSwapsSql, swapRowMapper,
                        id, requestedItemId, requestedItemId);
            }
            
            // Cancel all related swaps (auto-cancellation - no notifications)
            for (Swap relatedSwap : relatedSwaps) {
                String cancelSql = "UPDATE swap_proposals SET status = 'CANCELLED' WHERE swap_id = ?";
                template.update(cancelSql, relatedSwap.getSwapId());
                // No notification for auto-cancellations when swap is completed
            }
        }
        
        // Generate notifications
        if (status.equalsIgnoreCase("CANCELLED") && previousStatus != null && previousStatus.equalsIgnoreCase("ACCEPTED")) {
            // When cancelling an accepted swap, notify the OTHER party
            User cancellingUser = null;
            User otherUser = null;
            
            // Determine who cancelled and who to notify
            if (currentUsername != null && currentUsername.equals(swap.getSender().getUsername())) {
                cancellingUser = swap.getSender();
                otherUser = swap.getReceiver();
            } else if (currentUsername != null && currentUsername.equals(swap.getReceiver().getUsername())) {
                cancellingUser = swap.getReceiver();
                otherUser = swap.getSender();
            } else {
                // Fallback: if we can't determine, notify receiver (common case)
                cancellingUser = swap.getSender();
                otherUser = swap.getReceiver();
            }
            
            // Notify the other party
            String itemTitle = swap.getRequestedItem() != null ? swap.getRequestedItem().getTitle() : "the item";
            String message = cancellingUser.getUsername() + " has cancelled the accepted swap for " + itemTitle + ". The items are now available again.";
            notificationService.addNotification(new Notification(null, otherUser, "RED", message, false, null));
        } else if (!status.equalsIgnoreCase("CANCELLED") || (previousStatus != null && !previousStatus.equalsIgnoreCase("ACCEPTED"))) {
            // Generate normal notifications for other statuses (not auto-cancellation)
            notificationService.generateNotificationForSwaps(swap, status);
        }
        return swap;
    }
    
    // Helper method to find related swaps
    private List<Swap> findRelatedSwaps(Long excludeSwapId, Long offeredItemId, Long requestedItemId, String statusFilter) {
        List<Swap> relatedSwaps = new ArrayList<>();
        
        if (offeredItemId != null && requestedItemId != null) {
            String findRelatedSwapsSql = """
                SELECT * FROM swap_proposals 
                WHERE swap_id != ? 
                AND status = ?
                AND (
                    offered_item = ? OR requested_item = ? 
                    OR offered_item = ? OR requested_item = ?
                )
            """;
            relatedSwaps = template.query(findRelatedSwapsSql, swapRowMapper,
                    excludeSwapId, statusFilter, offeredItemId, offeredItemId, requestedItemId, requestedItemId);
        } else if (offeredItemId != null) {
            String findRelatedSwapsSql = """
                SELECT * FROM swap_proposals 
                WHERE swap_id != ? 
                AND status = ?
                AND (offered_item = ? OR requested_item = ?)
            """;
            relatedSwaps = template.query(findRelatedSwapsSql, swapRowMapper,
                    excludeSwapId, statusFilter, offeredItemId, offeredItemId);
        } else if (requestedItemId != null) {
            String findRelatedSwapsSql = """
                SELECT * FROM swap_proposals 
                WHERE swap_id != ? 
                AND status = ?
                AND (offered_item = ? OR requested_item = ?)
            """;
            relatedSwaps = template.query(findRelatedSwapsSql, swapRowMapper,
                    excludeSwapId, statusFilter, requestedItemId, requestedItemId);
        }
        
        return relatedSwaps;
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
