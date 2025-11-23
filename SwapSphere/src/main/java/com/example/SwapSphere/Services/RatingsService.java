package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Rating;

public interface RatingsService {

    Rating addRating(Rating rating);

    List<Rating> getRatingsByUserId(Long userId);
    
}
