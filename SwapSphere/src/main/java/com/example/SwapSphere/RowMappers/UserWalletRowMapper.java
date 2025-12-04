package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.UserWallet;
import com.example.SwapSphere.Services.UserService;

@Component
public class UserWalletRowMapper implements RowMapper<UserWallet> {
    @Autowired
    private UserService userService;

    @Override
    public UserWallet mapRow(ResultSet rs, int rowNum) throws SQLException {
        UserWallet w = new UserWallet();

        w.setWalletId(rs.getLong("wallet_id"));
        w.setUser(userService.getUserById(rs.getString("username")));
        w.setTokensAvailable(rs.getInt("tokens_available"));
        w.setTokensSpent(rs.getInt("tokens_spent"));
        w.setTokensLocked(rs.getInt("tokens_locked"));
        w.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

        return w;
    }
}

