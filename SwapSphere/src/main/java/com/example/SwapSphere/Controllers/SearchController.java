package com.example.SwapSphere.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Services.SearchService;

@RestController
@RequestMapping("/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/items")
    public ResponseEntity<List<OfferedItem>> searchItems(
            @RequestParam String keyword,
            @RequestParam String username) {
        return ResponseEntity.ok(searchService.searchItems(keyword, username));
    }
}

