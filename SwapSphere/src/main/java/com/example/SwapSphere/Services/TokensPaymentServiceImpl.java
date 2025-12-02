package com.example.SwapSphere.Services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.TokenPayment;

@Service
public class TokensPaymentServiceImpl implements TokensPaymentService {

    @Autowired
    JdbcTemplate template;

    @Override
    public TokenPayment addPayment(TokenPayment payment) {

        String sql = """
            INSERT INTO tokens_payment
            (username, amount_paid, tokens_purchased, created_at)
            VALUES (?, ?, ?, ?)
        """;

        template.update(sql,
                payment.getUser().getUsername(),
                payment.getAmountPaid(),
                payment.getTokensPurchased(),
                LocalDateTime.now()
        );

        // Fetch last inserted record
        String lastSql = "SELECT * FROM tokens_payment ORDER BY payment_id DESC LIMIT 1";
        return template.queryForObject(lastSql, new BeanPropertyRowMapper<>(TokenPayment.class));
    }

    @Override
    public List<TokenPayment> getByUser(String userId) {

        String sql = "SELECT * FROM tokens_payment WHERE username = ? ORDER BY created_at DESC";

        return template.query(sql, new BeanPropertyRowMapper<>(TokenPayment.class), userId);
    }
}
