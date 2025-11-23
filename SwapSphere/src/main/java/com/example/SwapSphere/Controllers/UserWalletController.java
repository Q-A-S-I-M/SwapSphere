package com.example.SwapSphere.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.Entities.UserWallet;
import com.example.SwapSphere.Services.UserWalletService;

@RestController
@RequestMapping("/wallet")
public class UserWalletController {

    @Autowired
    private UserWalletService walletService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserWallet> getWallet(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }
}

