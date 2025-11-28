package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.WantedItem;

public interface WantedItemsService {

    WantedItem createWantedItem(WantedItem item);

    WantedItem getById(Long id);

    List<WantedItem> getAllByUser(String username);

    void delete(Long id);

    WantedItem update(Long id, WantedItem item);
    
}
