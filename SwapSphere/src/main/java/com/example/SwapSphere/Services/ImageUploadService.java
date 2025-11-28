package com.example.SwapSphere.Services;

import org.springframework.web.multipart.MultipartFile;

public interface ImageUploadService {
    public String uploadImage(MultipartFile file, int id);
    public String uploadProfilePic(MultipartFile file, String username);
}
