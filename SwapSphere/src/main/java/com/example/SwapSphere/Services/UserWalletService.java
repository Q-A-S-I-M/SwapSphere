package com.example.SwapSphere.Services;

import com.example.SwapSphere.Entities.UserWallet;

public interface UserWalletService {

    UserWallet getWalletByUserId(Long userId);
    
}
