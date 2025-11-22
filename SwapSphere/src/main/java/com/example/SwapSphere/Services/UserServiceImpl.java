package com.example.SwapSphere.Services;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.User;


@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private JdbcTemplate template;
    @Autowired
    private PasswordEncoder passwordEncoder;
    public void register(User user){
        String hashPassword = passwordEncoder.encode(user.getPassword());
        String query = "SELECT COUNT(*) FROM Users WHERE user_id = ?";
        int count = template.queryForObject(query, Integer.class, user.getUser_id());
        if(count ==0 ){
            query = "INSERT INTO Users (user_id, user_name, email, password, role, max_slots, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
            user.setMax_slots(5);
            user.setTimestamp(new Timestamp(System.currentTimeMillis()));
            template.update(query, user.getUser_id(), user.getName(), user.getEmail(), hashPassword, user.getRole(), user.getMax_slots(), user.getTimestamp());
        }else{
            throw new RuntimeException("Username already exists!");
        }

    }
}