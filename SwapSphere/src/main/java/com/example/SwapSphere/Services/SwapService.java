package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Swap;

public interface SwapService {

    Swap createSwap(Swap swap);

    Swap getSwapById(Long id);

    List<Swap> getAllSwaps();

    Swap updateStatus(Long id, String status);
    
}
