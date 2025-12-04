package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.DTOs.CreateSwapRequest;
import com.example.SwapSphere.DTOs.SwapResponseDTO;
import com.example.SwapSphere.DTOs.SwapWithImages;
import com.example.SwapSphere.Entities.Swap;

public interface SwapService {

    Swap createSwap(CreateSwapRequest request);

    Swap getSwapById(Long id);

    List<Swap> getAllSwaps();
    List<Swap> getAllSwapsForReciever(String username);
    List<Swap> getAllSwapsForSender(String username);
    List<SwapWithImages> getAllSwapsForRecieverWithImages(String username);
    List<SwapWithImages> getAllSwapsForSenderWithImages(String username);
    List<SwapResponseDTO> getAllSwapsForRecieverWithImagesDTO(String username);
    List<SwapResponseDTO> getAllSwapsForSenderWithImagesDTO(String username);

    Swap updateStatus(Long id, String status);
    List<Swap> getSwapHistory(String username);
    List<SwapResponseDTO> getSwapHistoryWithImages(String username);
    
}
