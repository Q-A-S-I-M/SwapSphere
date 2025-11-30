package com.example.SwapSphere.Services;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.TokenSwapUsage;
import com.example.SwapSphere.Entities.UserWallet;

@Service
public class UserWalletServiceImpl implements UserWalletService {

    @Autowired
    private JdbcTemplate template;
    @Autowired
    TokenSwapUsageService tokenSwapUsageService;
    @Autowired
    UserService userService;
    @Autowired
    NotificationService notificationService;

    @Override
    public UserWallet getWalletByUserId(String userId) {
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

    @Override
    public UserWallet lockTokens(String username, int tokens) {
        UserWallet wallet = getWalletByUserId(username);
        try{
            if (wallet.getTokensAvailable()-wallet.getTokensLocked()>=tokens) {
                wallet.setTokensLocked(wallet.getTokensLocked()+tokens);
                String sql = "UPDATE user_wallet SET tokens_locked = ? WHERE username = ?";
                template.update(sql, wallet.getTokensLocked(), username);
                return wallet;
            }else{
                throw new RuntimeException("Not enough tokens!");
            }
        }catch(RuntimeException e){
            System.err.println(e.getMessage());
        }
        return wallet;
    }

    @Override
    public UserWallet addTokens(String username, int tokens) {
        UserWallet wallet = getWalletByUserId(username);
        String sql = "UPDATE user_wallet SET tokens_available = ? WHERE username = ?";
        wallet.setTokensAvailable(tokens+wallet.getTokensAvailable());
        template.update(sql, wallet.getTokensAvailable(), username);
        return wallet;
    }

    @Override
    public UserWallet spendTokens(String username, int tokens) {
        UserWallet wallet = getWalletByUserId(username);
        try{
            if (wallet.getTokensAvailable()-wallet.getTokensLocked()>= tokens) {
                String sql = "UPDATE user_wallet SET tokens_available = ?, tokens_spent = ? WHERE username = ?";
                wallet.setTokensAvailable(wallet.getTokensAvailable()-tokens);
                wallet.setTokensSpent(wallet.getTokensSpent()+tokens);
                template.update(sql, wallet.getTokensAvailable(), wallet.getTokensSpent(), username);
            }else{
                throw new RuntimeException("Not enough tokens!");
            }
        }catch(RuntimeException e){
            System.err.println(e.getMessage());
        }
        return wallet;
    }

    @Override
    public UserWallet tokensUnlock(String username, int tokens){
        UserWallet wallet = getWalletByUserId(username);
        String sql = "UPDATE user_wallet SET tokens_locked = ? WHERE username = ?";
        wallet.setTokensLocked(wallet.getTokensLocked()-tokens);
        template.update(sql, wallet.getTokensLocked(), username);
        return wallet;
    }

    @Override
    public void transferTokens(String username1, String username2, int tokens) {
        tokensUnlock(username1, tokens);
        spendTokens(username1, tokens);
        addTokens(username2, tokens);
        tokenSwapUsageService.addUsage(new TokenSwapUsage(null, userService.getUserById(username1), userService.getUserById(username2), tokens, null));
        notificationService.tokenTransfer(username1, userService.getUserById(username2), tokens);
    }

    @Override
    public UserWallet buyTokens(String username, int tokens){
        addTokens(username, tokens);
        notificationService.tokensBought(userService.getUserById(username), tokens);
        return getWalletByUserId(username);
    }
}
