package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.TokenFeatureUsage;

public interface TokenFeatureUsageService {

    TokenFeatureUsage addUsage(TokenFeatureUsage usage);

    List<TokenFeatureUsage> getByUser(String username);
    
}
