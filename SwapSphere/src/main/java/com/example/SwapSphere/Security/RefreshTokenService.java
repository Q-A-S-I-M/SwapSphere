package com.example.SwapSphere.Security;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.RowMappers.RefreshTokenRowMapper;
import com.example.SwapSphere.Entities.RefreshToken;
import com.example.SwapSphere.Entities.User;

@Service
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_DURATION_MS = 60 * 60 * 1000; // 7 days

    @Autowired
    private JdbcTemplate template;

    public RefreshToken createRefreshToken(String username, String userAgent, String ipAddress) {
        Optional<User> optionalUser = findByUsername(username);

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found for username: " + username);
        }

        User user = optionalUser.get();
        deleteByUserIdAndUserAgentAndIp(user.getUser_id(), userAgent, ipAddress);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setExpiryDate(Instant.now().plusMillis(REFRESH_TOKEN_DURATION_MS));
        refreshToken.setUserAgent(userAgent);

        return save(refreshToken);
    }

    public void deleteByUserIdAndUserAgentAndIp(String username, String userAgent, String ipAddress) {
        template.update("DELETE FROM refresh_tokens WHERE user_id = ? AND user_agent = ? AND ip_address = ?", username, userAgent, ipAddress);
    }

    public RefreshToken save(RefreshToken token) {
        template.update(
            "INSERT INTO refresh_tokens (token, expiry_date, user_id, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)",
            token.getToken(),
            token.getExpiryDate(),
            token.getUser().getUser_id(),
            token.getUserAgent(),
            token.getIpAddress()
        );
        return token;
    }

    public String validateAndGetUsername(String token, String ipAddress, String userAgent) {
        System.out.println(token);
        Optional<RefreshToken> optional = findByToken(token);
        if (optional.isEmpty()) {
            System.out.println("blaah");
            throw new RuntimeException("Invalid refresh token");
        }

        RefreshToken refreshToken = optional.get();
        if(!refreshToken.getIpAddress().equals(ipAddress)||!refreshToken.getUserAgent().equals(userAgent)){
            throw new RuntimeException("Invalid refresh token");
        }
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            delete(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        return refreshToken.getUser().getUser_id();
    }

    public Optional<RefreshToken> findByToken(String token) {
        try {
            System.out.println(token);
            String sql = "SELECT * FROM refresh_tokens WHERE token = ?";
            RefreshToken refreshToken = template.queryForObject(sql, new Object[]{token},new RefreshTokenRowMapper());
            return Optional.ofNullable(refreshToken);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByUsername(String username) {
        try {
            User user = template.queryForObject(
                "SELECT * FROM users WHERE user_id = ?",
                new Object[]{username},
                new BeanPropertyRowMapper<>(User.class)
            );
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public int delete(RefreshToken token) {
        String sql = "DELETE FROM refresh_tokens WHERE token = ?";
        return template.update(sql, token.getToken());
    }

    public int deleteByUserId(Long userId) {
        String sql = "DELETE FROM refresh_tokens WHERE user_id = ?";
        return template.update(sql, userId);
    }
}
