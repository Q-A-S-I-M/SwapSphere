package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.TokenFeatureUsage;
import com.example.SwapSphere.Services.OfferedItemsService;
import com.example.SwapSphere.Services.UserService;

@Component
public class TokenFeatureUsageRowMapper implements RowMapper<TokenFeatureUsage> {
    private final UserService userService;
    private final OfferedItemsService offeredItemsService;

    public TokenFeatureUsageRowMapper(UserService userService, @Lazy OfferedItemsService offeredItemsService) {
        this.userService = userService;
        this.offeredItemsService = offeredItemsService;
    }

    @Override
    public TokenFeatureUsage mapRow(ResultSet rs, int rowNum) throws SQLException {

        TokenFeatureUsage t = new TokenFeatureUsage();

        t.setUsageId(rs.getLong("usage_id"));

        t.setUser(userService.getUserById(rs.getString("username")));

        Long offeredId = rs.getLong("offered_item_id");
        if (!rs.wasNull())
            t.setOfferedItem(offeredItemsService.getItemById(offeredId));

        t.setFeatureType(rs.getString("feature_type"));
        t.setTokensUsed(rs.getInt("token_used"));
        t.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return t;
    }
}

