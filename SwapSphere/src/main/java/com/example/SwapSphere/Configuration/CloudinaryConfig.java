package com.example.SwapSphere.Configuration;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dyilrnvaj");
        config.put("api_key", "526789766551448");
        config.put("api_secret", "bWgd0UH-Qn6_-f22CRQBDKIwLDk");
        return new Cloudinary(config);
    }
}
