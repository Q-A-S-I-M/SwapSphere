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

import com.example.SwapSphere.Entities.TokenPayment;
import com.example.SwapSphere.Services.TokensPaymentService;

@RestController
@RequestMapping("/tokens/payments")
public class TokensPaymentController {

    @Autowired
    private TokensPaymentService tokensPaymentService;

    @PostMapping
    public ResponseEntity<TokenPayment> addPayment(@RequestBody TokenPayment payment) {
        return ResponseEntity.ok(tokensPaymentService.addPayment(payment));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<TokenPayment>> getUserPayments(@PathVariable Long userId) {
        return ResponseEntity.ok(tokensPaymentService.getByUser(userId));
    }
}

