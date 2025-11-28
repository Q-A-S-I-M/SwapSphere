package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.TokenFeatureUsage;
import com.example.SwapSphere.Services.OfferedItemsService;
import com.example.SwapSphere.Services.UserService;
import com.example.SwapSphere.Services.WantedItemsService;

public class TokenFeatureUsageRowMapper implements RowMapper<TokenFeatureUsage> {
    @Autowired
    private UserService userService;
    @Autowired
    private OfferedItemsService offeredItemsService;
    @Autowired
    private WantedItemsService wantedItemsService;

    @Override
    public TokenFeatureUsage mapRow(ResultSet rs, int rowNum) throws SQLException {

        TokenFeatureUsage t = new TokenFeatureUsage();

        t.setUsageId(rs.getLong("usage_id"));

        t.setUser(userService.getUserById(rs.getString("username")));

        Long offeredId = rs.getLong("offered_item_id");
        if (!rs.wasNull())
            t.setOfferedItem(offeredItemsService.getItemById(offeredId));

        Long wantedId = rs.getLong("wanted_item_id");
        if (!rs.wasNull())
            t.setWantedItem(wantedItemsService.getById(wantedId));

        t.setFeatureType(rs.getString("feature_type"));
        t.setTokensUsed(rs.getInt("token_used"));
        t.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return t;
    }
}

