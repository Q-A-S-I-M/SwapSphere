package com.example.SwapSphere.Services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.TokenFeatureUsage;

@Service
public class TokenFeatureUsageServiceImpl implements TokenFeatureUsageService {

    @Autowired
    JdbcTemplate template;

    @Override
    public TokenFeatureUsage addUsage(TokenFeatureUsage usage) {

        String sql = """
            INSERT INTO token_feature_usage
            (username, offered_item_id, wanted_item_id, feature_type, tokens_used, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

        template.update(sql,
                usage.getUser().getUsername(),
                usage.getOfferedItem().getOfferedItemId(),
                usage.getWantedItem().getWantedItemId(),
                usage.getFeatureType(),
                usage.getTokensUsed(),
                usage.getDescription(),
                LocalDateTime.now()
        );

        // Fetch last inserted row
        String lastSql = "SELECT * FROM token_feature_usage ORDER BY usage_id DESC LIMIT 1";

        return template.queryForObject(lastSql, new BeanPropertyRowMapper<>(TokenFeatureUsage.class));
    }
}
