package com.example.SwapSphere.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.Entities.WantedItem;
import com.example.SwapSphere.Services.WantedItemsService;

@RestController
@RequestMapping("/wanted-items")
public class WantedItemsController {

    @Autowired
    private WantedItemsService wantedItemsService;

    @PostMapping
    public ResponseEntity<WantedItem> createWantedItem(@RequestBody WantedItem item) {
        return ResponseEntity.ok(wantedItemsService.createWantedItem(item));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WantedItem> getWantedItem(@PathVariable Long id) {
        return ResponseEntity.ok(wantedItemsService.getById(id));
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<WantedItem>> getAllWantedItemsByUser(@PathVariable String username) {
        return ResponseEntity.ok(wantedItemsService.getAllByUser(username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WantedItem> updateWantedItem(@PathVariable Long id, @RequestBody WantedItem item) {
        return ResponseEntity.ok(wantedItemsService.update(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWantedItem(@PathVariable Long id) {
        wantedItemsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

