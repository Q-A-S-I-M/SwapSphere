package com.example.SwapSphere.Services;

import com.example.SwapSphere.DTOs.TokensTransfer;
import com.example.SwapSphere.Entities.TokenPayment;
import com.example.SwapSphere.Entities.UserWallet;

public interface UserWalletService {

    UserWallet getWalletByUserId(String userId);
    UserWallet addTokens(String username, int tokens);
    UserWallet spendTokens(String username, int tokens);
    UserWallet transferTokens(String username, TokensTransfer transfer);
    UserWallet buyTokens(TokenPayment payment);
    
}
