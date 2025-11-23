package com.example.SwapSphere.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.Entities.TokenFeatureUsage;
import com.example.SwapSphere.Services.TokenFeatureUsageService;

@RestController
@RequestMapping("/tokens/features")
public class TokenFeatureUsageController {

    @Autowired
    private TokenFeatureUsageService featureUsageService;

    @PostMapping
    public ResponseEntity<TokenFeatureUsage> addUsage(@RequestBody TokenFeatureUsage usage) {
        return ResponseEntity.ok(featureUsageService.addUsage(usage));
    }
}

