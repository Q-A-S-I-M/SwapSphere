package com.example.SwapSphere.DTOs;

import java.util.List;
import com.example.SwapSphere.Entities.OfferedItem;

public class OfferedItemWithImages {
    private OfferedItem offeredItem;
    private List<String> urls;

    public OfferedItemWithImages(){}
    public OfferedItemWithImages(OfferedItem item, List<String> images){
        this.offeredItem = item;
        this.urls = images;
    }

    public void setOfferedItem(OfferedItem item){
        this.offeredItem = item;
    }

    public void setImages(List<String> images){
        this.urls = images;
    }

    public OfferedItem getOfferedItem(){
        return this.offeredItem;
    }

    public List<String> getImages(){
        return this.urls;
    }
}
