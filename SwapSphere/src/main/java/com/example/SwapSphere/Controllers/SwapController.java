package com.example.SwapSphere.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.DTOs.CreateSwapRequest;
import com.example.SwapSphere.DTOs.SwapResponseDTO;
import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Services.SwapService;

@RestController
@RequestMapping("/swaps")
public class SwapController {

    @Autowired
    private SwapService swapService;

    @PostMapping
    public ResponseEntity<Swap> createSwap(@RequestBody CreateSwapRequest request) {
        return ResponseEntity.ok(swapService.createSwap(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Swap> getSwap(@PathVariable Long id) {
        return ResponseEntity.ok(swapService.getSwapById(id));
    }

    @GetMapping
    public ResponseEntity<List<Swap>> getAllSwaps() {
        return ResponseEntity.ok(swapService.getAllSwaps());
    }

    @GetMapping("/sender/{sender}")
    public ResponseEntity<List<SwapResponseDTO>> getAllSwapsForSender(@PathVariable String sender) {
        return ResponseEntity.ok(swapService.getAllSwapsForSenderWithImagesDTO(sender));
    }
    @GetMapping("/reciever/{reciever}")
    public ResponseEntity<List<SwapResponseDTO>> getAllSwapsForReciver(@PathVariable String reciever) {
        return ResponseEntity.ok(swapService.getAllSwapsForRecieverWithImagesDTO(reciever));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Swap> updateSwapStatus(@PathVariable Long id, @RequestParam String status) {
        // Get current user from SecurityContext
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return ResponseEntity.ok(swapService.updateStatus(id, status, currentUsername));
    }

    @GetMapping("/history/{username}")
    public ResponseEntity<List<SwapResponseDTO>> getSwapHistory(@PathVariable String username) {
        return ResponseEntity.ok(swapService.getSwapHistoryWithImages(username));
    }
}
