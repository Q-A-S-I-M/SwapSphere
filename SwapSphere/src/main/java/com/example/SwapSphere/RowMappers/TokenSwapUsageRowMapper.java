package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.TokenSwapUsage;
import com.example.SwapSphere.Services.UserService;

public class TokenSwapUsageRowMapper implements RowMapper<TokenSwapUsage> {
    @Autowired
    private UserService userService;

    @Override
    public TokenSwapUsage mapRow(ResultSet rs, int rowNum) throws SQLException {

        TokenSwapUsage t = new TokenSwapUsage();

        t.setSwapUsageId(rs.getLong("swap_usage_id"));

        t.setUser(userService.getUserById(rs.getString("username")));
        t.setCounterparty(userService.getUserById(rs.getString("counterparty_user_id")));

        t.setTokensUsed(rs.getInt("tokens_used"));
        t.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return t;
    }
}

