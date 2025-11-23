package com.example.SwapSphere.Services;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.UserWallet;

@Service
public class UserWalletServiceImpl implements UserWalletService {

    @Autowired
    private JdbcTemplate template;

    @Override
    public UserWallet getWalletByUserId(Long userId) {
        String sql = "SELECT * FROM user_wallet WHERE username = ?";
        UserWallet wallet = template.query(sql, rs -> {
            if (rs.next()) {
                return new BeanPropertyRowMapper<>(UserWallet.class).mapRow(rs, 1);
            } else {
                String insertSql = "INSERT INTO user_wallet (username, tokens_available, tokens_spent, updated_at) VALUES (?, ?, ?, ?)";
                Timestamp now = new Timestamp(System.currentTimeMillis());
                template.update(insertSql, userId, 0, 0, now);

                return new UserWallet();
            }
        }, userId);

        return wallet;
    }
}
