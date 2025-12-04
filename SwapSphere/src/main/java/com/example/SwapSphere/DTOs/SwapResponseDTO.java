package com.example.SwapSphere.DTOs;

import java.time.LocalDateTime;

import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwapResponseDTO {
    private Long swapId;
    private User sender;
    private User receiver;
    private OfferedItem offeredItem; // Can be null if tokens only
    private String offeredItemImage; // First image URL, null if no item or no images
    private OfferedItem requestedItem;
    private String requestedItemImage; // First image URL, null if no images
    private int tokens; // Can be 0 if item only
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

