package com.example.SwapSphere.Services;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ImageUploadServiceImpl implements ImageUploadService{

    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private JdbcTemplate template;

    @Override
    public String uploadImage(MultipartFile file, int id) {
        try{
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", "swapsphere")
            );
            String url = uploadResult.get("secure_url").toString();
            String sql = "INSERT INTO images (image_url, offered_item_id) VALUES (?, ?)";
            template.update(sql, url, id);
            return url;
        }catch(IOException e){
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public String uploadProfilePic(MultipartFile file, String username) {
        try{
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "swapsphere"));
            String url = uploadResult.get("secure_url").toString();
            String sql = "UPDATE users SET profile_pic_url = ? WHERE username = ?";
            template.update(sql, url, username);
            return url;
        }catch(IOException e){
            e.printStackTrace();
        }
        return null;
    }
}
