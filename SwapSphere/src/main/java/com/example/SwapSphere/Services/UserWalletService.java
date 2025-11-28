package com.example.SwapSphere.Services;

import com.example.SwapSphere.Entities.UserWallet;

public interface UserWalletService {

    UserWallet getWalletByUserId(String userId);
    UserWallet lockTokens(String username, int tokens);
    UserWallet buyTokens(String username, int tokens);
    UserWallet spendTokens(String username, int tokens);
    UserWallet tokensUnlock(String username, int tokens);
    void transferTokens(String username, String username2, int tokens);
    
}
