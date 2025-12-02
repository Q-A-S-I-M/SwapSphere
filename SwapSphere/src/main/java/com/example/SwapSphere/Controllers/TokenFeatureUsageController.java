package com.example.SwapSphere.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/{username}")
    public ResponseEntity<List<TokenFeatureUsage>> getByUser(@PathVariable String username) {
        return ResponseEntity.ok(featureUsageService.getByUser(username));
    }
}

