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

    @GetMapping("/{id}")
    public ResponseEntity<OfferedItem> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(offeredItemsService.getItemById(id));
    }

    @GetMapping
    public ResponseEntity<List<OfferedItem>> getAllItems() {
        return ResponseEntity.ok(offeredItemsService.getAllItems());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfferedItem> updateItem(@PathVariable Long id, @RequestBody OfferedItem item) {
        return ResponseEntity.ok(offeredItemsService.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        offeredItemsService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}

