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
public class SwapWithImages {
    private Long swapId;
    private User sender;
    private User receiver;
    private OfferedItem offeredItem;
    private String offeredItemImage; // Single image URL
    private OfferedItem requestedItem;
    private String requestedItemImage; // Single image URL
    private int tokens;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

