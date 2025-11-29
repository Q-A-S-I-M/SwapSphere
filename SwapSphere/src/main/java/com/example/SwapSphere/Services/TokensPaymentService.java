package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.TokenPayment;

public interface TokensPaymentService {

    TokenPayment addPayment(TokenPayment payment);

    List<TokenPayment> getByUser(String userId);
    
}
