package com.example.SwapSphere.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSwapRequest {
    private String senderUsername;
    private String receiverUsername;
    private Long offeredItemId; // Can be null for token-only swaps
    private Long requestedItemId;
    private int tokens; // Must be > 0 if offeredItemId is null
}

