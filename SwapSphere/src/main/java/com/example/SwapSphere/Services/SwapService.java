package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Swap;

public interface SwapService {

    Swap createSwap(Swap swap);

    Swap getSwapById(Long id);

    List<Swap> getAllSwaps();
    List<Swap> getAllSwapsForReciever(String username);
    List<Swap> getAllSwapsForSender(String username);

    Swap updateStatus(Long id, String status);
    List<Swap> getSwapHistory(String username);
    
}
