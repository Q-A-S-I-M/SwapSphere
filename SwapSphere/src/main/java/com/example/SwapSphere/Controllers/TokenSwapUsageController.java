package com.example.SwapSphere.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.Entities.TokenSwapUsage;
import com.example.SwapSphere.Services.TokenSwapUsageService;

@RestController
@RequestMapping("/tokens/swaps")
public class TokenSwapUsageController {

    @Autowired
    private TokenSwapUsageService tokenSwapUsageService;

    @PostMapping
    public ResponseEntity<TokenSwapUsage> addSwapUsage(@RequestBody TokenSwapUsage usage) {
        return ResponseEntity.ok(tokenSwapUsageService.addUsage(usage));
    }

    @GetMapping("/swap/{swapId}")
    public ResponseEntity<List<TokenSwapUsage>> getBySwap(@PathVariable Long swapId) {
        return ResponseEntity.ok(tokenSwapUsageService.getBySwap(swapId));
    }
}

