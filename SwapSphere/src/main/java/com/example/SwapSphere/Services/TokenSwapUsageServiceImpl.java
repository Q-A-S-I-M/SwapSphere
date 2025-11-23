package com.example.SwapSphere.Services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.TokenSwapUsage;

@Service
public class TokenSwapUsageServiceImpl implements TokenSwapUsageService {

    @Autowired
    JdbcTemplate template;

    @Override
    public TokenSwapUsage addUsage(TokenSwapUsage usage) {

        String sql = """
            INSERT INTO token_swap_usage
            (swap_id, username, counterparty_user_id, offered_item_id,
             tokens_used, tokens_received, usage_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """;

        template.update(sql,
                usage.getSwap().getSwapId(),
                usage.getUser().getUsername(),
                usage.getCounterparty().getUsername(),
                usage.getOfferedItem().getOfferedItemId(),
                usage.getTokensUsed(),
                usage.getTokensReceived(),
                usage.getUsageType().name(),
                LocalDateTime.now()
        );

        String lastSql = "SELECT * FROM token_swap_usage ORDER BY swap_usage_id DESC LIMIT 1";

        return template.queryForObject(lastSql, new BeanPropertyRowMapper<>(TokenSwapUsage.class));
    }

    @Override
    public List<TokenSwapUsage> getBySwap(Long swapId) {

        String sql = "SELECT * FROM token_swap_usage WHERE swap_id = ? ORDER BY created_at ASC";

        return template.query(sql, new BeanPropertyRowMapper<>(TokenSwapUsage.class), swapId);
    }
}
