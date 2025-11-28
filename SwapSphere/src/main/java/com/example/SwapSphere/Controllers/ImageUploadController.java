package com.example.SwapSphere.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.SwapSphere.Services.ImageUploadService;

@RestController
@RequestMapping("/api/images")
public class ImageUploadController {

    @Autowired
    private ImageUploadService imageUploadService;

    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file, int id) throws Exception {
        return imageUploadService.uploadImage(file, id);
    }
    @PutMapping("/upload-profile-pic")
    public String uploadProfilePic(@RequestParam("file") MultipartFile file, String username) throws Exception {
        return imageUploadService.uploadProfilePic(file, username);
    }
}

