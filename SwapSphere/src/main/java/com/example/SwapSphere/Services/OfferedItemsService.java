package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.DTOs.OfferedItemWithImages;
import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.User;

public interface OfferedItemsService {

    OfferedItem createItem(OfferedItem item);

    OfferedItemWithImages getItemByIdWithImages(Long id);
    OfferedItem getItemById(Long id);

    List<OfferedItemWithImages> getAllItemsByUser(String username);

    OfferedItem updateItemStatus(Long id, String status);
    OfferedItem updateItemPriority(Long id, String username);

    void deleteItem(Long id);
    
}
