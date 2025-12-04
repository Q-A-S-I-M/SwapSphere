package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.DTOs.OfferedItemWithImages;
import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.TokenFeatureUsage;
import com.example.SwapSphere.Entities.UserWallet;
import com.example.SwapSphere.RowMappers.OfferedItemRowMapper;

@Service
public class OfferedItemsServiceImpl implements OfferedItemsService {

    @Autowired
    private JdbcTemplate template;
    @Autowired
    private UserWalletService userWalletService;
    @Autowired
    private TokenFeatureUsageService tokenFeatureUsageService;
    @Autowired
    private OfferedItemRowMapper offeredItemRowMapper;
    @Autowired
    private UserService userService;
    @Autowired
    private NotificationService notificationService;
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
        OfferedItem item = template.queryForObject(sql, offeredItemRowMapper, id);
        sql = "SELECT img_url FROM images WHERE offered_item_id = ?";
        List<String> urls = template.query(sql, (rs, rowNum) -> rs.getString("img_url"), id);
        return new OfferedItemWithImages(item, urls);
    }

    @Override
    public OfferedItem getItemById(Long id) {
        String sql = "SELECT * FROM offered_items WHERE offered_item_id = ?";
        OfferedItem item = template.queryForObject(sql, offeredItemRowMapper, id);
        return item;
    }

    @Override
    public List<OfferedItemWithImages> getAllItemsByUser(String username) {
        String sql = """
            SELECT o.*, MIN(i.img_url) AS first_img
            FROM offered_items o
            LEFT JOIN images i ON o.offered_item_id = i.offered_item_id
            WHERE o.username = ? AND o.status != 'DELETED'
            GROUP BY o.offered_item_id
            ORDER BY o.created_at DESC;
        """;

        return template.query(sql, (rs, rowNum) -> {
            OfferedItem item = offeredItemRowMapper.mapRow(rs, rowNum);
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
    public OfferedItem updateItemPriority(Long id, String username) {
        OfferedItem item = getItemById(id);
        if (item == null) {
            throw new RuntimeException("Item not found");
        }

        if (!item.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only increase priority of your own items");
        }

        final int TOKENS_COST = 5;
        final int PRIORITY_INCREASE = 5;

        UserWallet wallet = userWalletService.getWalletByUserId(username);
        int freeTokens = wallet.getTokensAvailable() - wallet.getTokensLocked();
        
        if (freeTokens < TOKENS_COST) {
            String message;
            if (wallet.getTokensAvailable() < TOKENS_COST) {
                message = "Not enough tokens! You need " + TOKENS_COST + " tokens but only have " + wallet.getTokensAvailable() + " tokens available.";
            } else {
                message = "Not enough free tokens! You have " + wallet.getTokensAvailable() + " tokens, but " + wallet.getTokensLocked() + " are locked. Only " + freeTokens + " tokens are available. You need " + TOKENS_COST + " tokens.";
            }
            throw new RuntimeException(message);
        }

        int tokensAvailableBefore = wallet.getTokensAvailable();
        UserWallet updatedWallet = userWalletService.spendTokens(username, TOKENS_COST);
        int tokensAvailableAfter = updatedWallet.getTokensAvailable();

        if (tokensAvailableAfter >= tokensAvailableBefore) {
            throw new RuntimeException("Failed to deduct tokens. Please try again.");
        }

        int newPriority = item.getPriority() + PRIORITY_INCREASE;
        String sql = "UPDATE offered_items SET priority = ? WHERE offered_item_id = ?";
        template.update(sql, newPriority, id);

        TokenFeatureUsage featureUsage = new TokenFeatureUsage();
        featureUsage.setUser(userService.getUserById(username));
        featureUsage.setOfferedItem(item);
        featureUsage.setFeatureType("PRIORITY_INCREASE");
        featureUsage.setTokensUsed(TOKENS_COST);
        tokenFeatureUsageService.addUsage(featureUsage);

        notificationService.generatePriorityIncreaseNotification(userService.getUserById(username), item.getTitle());
        
        return getItemById(id);
    }

    @Override
    public void deleteItem(Long id) {
    // Now delete parent item
    String deleteItem = "UPDATE offered_items SET status = 'DELETED' WHERE offered_item_id = ?";
    template.update(deleteItem, id);
    }
    
}
