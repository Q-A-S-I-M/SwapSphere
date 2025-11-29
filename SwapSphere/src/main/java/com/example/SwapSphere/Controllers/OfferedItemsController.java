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

import com.example.SwapSphere.DTOs.OfferedItemWithImages;
import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Services.OfferedItemsService;


@RestController
@RequestMapping("/offer-items")
public class OfferedItemsController {

    @Autowired
    private OfferedItemsService offeredItemsService;

    @PostMapping
    public ResponseEntity<OfferedItem> createItem(@RequestBody OfferedItem item) {
        return ResponseEntity.ok(offeredItemsService.createItem(item));
    }

    @GetMapping("/get-item/{id}")
    public ResponseEntity<OfferedItemWithImages> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(offeredItemsService.getItemByIdWithImages(id));
    }

    @GetMapping("/user-item/{username}")
    public ResponseEntity<List<OfferedItemWithImages>> getAllItemsByUser(@PathVariable String username) {
        return ResponseEntity.ok(offeredItemsService.getAllItemsByUser(username));
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<OfferedItem> updateItemStatus(@PathVariable Long id, @RequestBody String item) {
        return ResponseEntity.ok(offeredItemsService.updateItemStatus(id, item));
    }
    @PutMapping("/update-priority/{id}")
    public ResponseEntity<OfferedItem> updateItemPriority(@PathVariable Long id, @RequestBody int item) {
        return ResponseEntity.ok(offeredItemsService.updateItemPriority(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        offeredItemsService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}

