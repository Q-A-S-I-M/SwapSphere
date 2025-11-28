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

import com.example.SwapSphere.Entities.Swap;
import com.example.SwapSphere.Services.SwapService;

@RestController
@RequestMapping("/swaps")
public class SwapController {

    @Autowired
    private SwapService swapService;

    @PostMapping
    public ResponseEntity<Swap> createSwap(@RequestBody Swap swap) {
        return ResponseEntity.ok(swapService.createSwap(swap));
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
    public ResponseEntity<List<Swap>> getAllSwapsForSender(@PathVariable String sender) {
        return ResponseEntity.ok(swapService.getAllSwapsForSender(sender));
    }
    @GetMapping("/reciever/{reciever}")
    public ResponseEntity<List<Swap>> getAllSwapsForReciver(@PathVariable String reciever) {
        return ResponseEntity.ok(swapService.getAllSwapsForReciever(reciever));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Swap> updateSwapStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(swapService.updateStatus(id, status));
    }
}
