package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.TokenSwapUsage;
import com.example.SwapSphere.Services.OfferedItemsService;
import com.example.SwapSphere.Services.SwapService;
import com.example.SwapSphere.Services.UserService;

public class TokenSwapUsageRowMapper implements RowMapper<TokenSwapUsage> {
    @Autowired
    private SwapService swapService;
    @Autowired
    private UserService userService;
    @Autowired
    private OfferedItemsService offeredItemsService;

    @Override
    public TokenSwapUsage mapRow(ResultSet rs, int rowNum) throws SQLException {

        TokenSwapUsage t = new TokenSwapUsage();

        t.setSwapUsageId(rs.getLong("swap_usage_id"));

        t.setSwap(swapService.getSwapById(rs.getLong("swap_id")));
        t.setUser(userService.getUserById(rs.getString("username")));
        t.setCounterparty(userService.getUserById(rs.getString("counterparty_user_id")));
        t.setOfferedItem(offeredItemsService.getItemById(rs.getLong("offered_item_id")));

        t.setTokensUsed(rs.getInt("tokens_used"));
        t.setTokensReceived(rs.getInt("tokens_recieved"));
        t.setUsageType(TokenSwapUsage.UsageType.valueOf(rs.getString("usage_type")));
        t.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return t;
    }
}

