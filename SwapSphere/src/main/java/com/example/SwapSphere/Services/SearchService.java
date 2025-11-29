package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.OfferedItem;
import com.example.SwapSphere.Entities.User;

public interface SearchService {
    List<OfferedItem> searchItems(String keyword, String username);
    List<OfferedItem> searchItemsWithDistance(String keyword, User user, double maxDistanceKm);
    List<OfferedItem> searchItemsWithPotentialSwap(String keyword, User user, OfferedItem item);
    List<OfferedItem> searchItemWithPotentialSwapAndDistance(String keyword, User user, double maxDistanceKm, OfferedItem item);

}
