package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.TokenPayment;
import com.example.SwapSphere.Services.UserService;

@Component
public class TokenPaymentRowMapper implements RowMapper<TokenPayment> {
    @Autowired
    private UserService userService;

    @Override
    public TokenPayment mapRow(ResultSet rs, int rowNum) throws SQLException {
        TokenPayment p = new TokenPayment();

        p.setPaymentId(rs.getLong("payment_id"));
        p.setUser(userService.getUserById(rs.getString("username")));
        p.setAmountPaid(rs.getDouble("amount_paid"));
        p.setTokensPurchased(rs.getInt("token_purchased"));
        p.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return p;
    }
}

