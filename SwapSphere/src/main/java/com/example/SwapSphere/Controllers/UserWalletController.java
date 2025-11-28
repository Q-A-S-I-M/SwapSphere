package com.example.SwapSphere.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    public ResponseEntity<UserWallet> getWallet(@PathVariable String username) {
        return ResponseEntity.ok(walletService.getWalletByUserId(username));
    }

    @PutMapping("/lock/{userId}")
    public ResponseEntity<UserWallet> lockTokens(@PathVariable String username,@RequestBody int tokens) {
        return ResponseEntity.ok(walletService.lockTokens(username, tokens));
    }

    @PutMapping("/buy/{userId}")
    public ResponseEntity<UserWallet> buyTokens(@PathVariable String username,@RequestBody int tokens) {
        return ResponseEntity.ok(walletService.buyTokens(username, tokens));
    }

    @PutMapping("/spend/{userId}")
    public ResponseEntity<UserWallet> spendTokens(@PathVariable String username,@RequestBody int tokens) {
        return ResponseEntity.ok(walletService.spendTokens(username, tokens));
    }

    @PutMapping("/unlock/{userId}")
    public ResponseEntity<UserWallet> tokensUnlock(@PathVariable String username,@RequestBody int tokens){
        return ResponseEntity.ok(walletService.tokensUnlock(username, tokens));
    }
    
}

