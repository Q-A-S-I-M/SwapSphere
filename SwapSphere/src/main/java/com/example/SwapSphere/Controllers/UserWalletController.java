package com.example.SwapSphere.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.DTOs.TokensTransfer;
import com.example.SwapSphere.Entities.UserWallet;
import com.example.SwapSphere.Entities.TokenPayment;
import com.example.SwapSphere.Services.UserWalletService;

@RestController
@RequestMapping("/wallet")
public class UserWalletController {

    @Autowired
    private UserWalletService walletService;

    @GetMapping("/{username}")
    public ResponseEntity<UserWallet> getWallet(@PathVariable String username) {
        return ResponseEntity.ok(walletService.getWalletByUserId(username));
    }

    @PutMapping("/buy")
    public ResponseEntity<UserWallet> buyTokens(@RequestBody TokenPayment payment) {
        return ResponseEntity.ok(walletService.buyTokens(payment));
    }

    @PutMapping("/spend/{username}")
    public ResponseEntity<UserWallet> spendTokens(@PathVariable String username,@RequestBody int tokens) {
        return ResponseEntity.ok(walletService.spendTokens(username, tokens));
    }

    @PutMapping("/transfer/{username}")
    public ResponseEntity<?> tokensTransfer(@PathVariable String username,@RequestBody TokensTransfer transfer){
        try {
            return ResponseEntity.ok(walletService.transferTokens(username, transfer));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An unexpected error occurred during token transfer.");
        }
    }
}

