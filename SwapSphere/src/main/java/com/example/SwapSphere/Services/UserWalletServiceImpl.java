package com.example.SwapSphere.Services;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.DTOs.TokensTransfer;
import com.example.SwapSphere.Entities.TokenPayment;
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
    @Autowired
    TokensPaymentService paymentService;

    @Override
    public UserWallet getWalletByUserId(String userId) {
        String sql = "SELECT * FROM user_wallet WHERE username = ?";
        UserWallet wallet = template.query(sql, rs -> {
            if (rs.next()) {
                return new BeanPropertyRowMapper<>(UserWallet.class).mapRow(rs, 1);
            } else {
                String insertSql = "INSERT INTO user_wallet (username, tokens_available, tokens_spent, updated_at, tokens_locked) VALUES (?, ?, ?, ?, ?)";
                Timestamp now = new Timestamp(System.currentTimeMillis());
                template.update(insertSql, userId, 0, 0, now, 0);

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
    public UserWallet transferTokens(String username1, TokensTransfer transfer) {
        int tokens = transfer.getTokens();
        String user2 = transfer.getUsername();
        tokensUnlock(username1, tokens);
        spendTokens(username1, tokens);
        addTokens(user2, tokens);
        tokenSwapUsageService.addUsage(new TokenSwapUsage(null, userService.getUserById(username1), userService.getUserById(user2), tokens, null));
        notificationService.tokenTransfer(username1, userService.getUserById(user2), tokens);
        return getWalletByUserId(username1);
    }

    @Override
    public UserWallet buyTokens(TokenPayment payment){
        String user = payment.getUser().getUsername();
        int tokens = payment.getTokensPurchased();
        addTokens(user, tokens);
        notificationService.tokensBought(userService.getUserById(user), tokens);
        paymentService.addPayment(payment);
        return getWalletByUserId(user);
    }
}
