package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.OfferedItem;

public interface OfferedItemsService {

    OfferedItem createItem(OfferedItem item);

    OfferedItem getItemById(Long id);

    List<OfferedItem> getAllItems();

    OfferedItem updateItem(Long id, OfferedItem item);

    void deleteItem(Long id);
    
}
