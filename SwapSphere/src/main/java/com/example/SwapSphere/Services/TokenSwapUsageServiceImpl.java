package com.example.SwapSphere.Services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.TokenSwapUsage;
import com.example.SwapSphere.RowMappers.TokenSwapUsageRowMapper;

@Service
public class TokenSwapUsageServiceImpl implements TokenSwapUsageService {

    @Autowired
    JdbcTemplate template;
    
    @Autowired
    TokenSwapUsageRowMapper tokenSwapUsageRowMapper;

    @Override
    public TokenSwapUsage addUsage(TokenSwapUsage usage) {

        String sql = """
            INSERT INTO token_swap_usage
            (username, counterparty_user_id,
             tokens_used, created_at)
            VALUES (?, ?, ?, ?)
        """;

        template.update(sql,
                usage.getUser().getUsername(),
                usage.getCounterparty().getUsername(),
                usage.getTokensUsed(),
                LocalDateTime.now()
        );

        String lastSql = "SELECT * FROM token_swap_usage ORDER BY swap_usage_id DESC LIMIT 1";

        return template.queryForObject(lastSql, tokenSwapUsageRowMapper);
    }

    @Override
    public List<TokenSwapUsage> getByUser(String username) {

        String sql = """
            SELECT * FROM token_swap_usage 
            WHERE username = ? OR counterparty_user_id = ? 
            ORDER BY created_at DESC
        """;

        return template.query(sql, tokenSwapUsageRowMapper, username, username);
    }
}
