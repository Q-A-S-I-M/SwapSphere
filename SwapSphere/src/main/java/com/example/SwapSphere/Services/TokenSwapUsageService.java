package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.TokenSwapUsage;

public interface TokenSwapUsageService {

    TokenSwapUsage addUsage(TokenSwapUsage usage);

    List<TokenSwapUsage> getBySwap(Long swapId);
    
}
