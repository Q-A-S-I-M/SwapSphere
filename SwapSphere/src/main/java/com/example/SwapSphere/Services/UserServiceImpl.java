package com.example.SwapSphere.Services;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
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
        String query = "SELECT COUNT(*) FROM Users WHERE username = ?";
        int count = template.queryForObject(query, Integer.class, user.getUsername());
        if(count ==0 ){
            query = "INSERT INTO Users (username, full_name, email, password, contact, role, tokens, rating, created_at, longitude, latitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            user.setTokens(0);
            user.setRating(0);
            user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            template.update(query, user.getUsername(), user.getFullName(), user.getEmail(), hashPassword, user.getContact(), user.getRole(), user.getTokens(), user.getRating(), user.getCreatedAt(), user.getLocLong(), user.getLocLat());
        }else{
            throw new RuntimeException("Username already exists!");
        }

    }
    @Override
    public User getUserById(Long id) {
        String sql = "SELECT * FROM Users WHERE username = ?";
        return template.queryForObject(sql, new BeanPropertyRowMapper<>(User.class), id);
    }

    @Override
    public List<User> getAllUsers() {
        String sql = "SELECT * FROM Users";
        return template.query(sql, new BeanPropertyRowMapper<>(User.class));
    }

    @Override
    public User updateUser(Long id, User user) {
        String sql = """
            UPDATE users SET 
                full_name = ?, 
                email = ?, 
                contact = ?, 
                role = ?, 
                tokens = ?, 
                rating = ?, 
                longitude = ?, 
                latitude = ? 
            WHERE username = ?
        """;

        template.update(sql,
                user.getFullName(),
                user.getEmail(),
                user.getContact(),
                user.getRole(),
                user.getTokens(),
                user.getRating(),
                user.getLocLong(),
                user.getLocLat(),
                id
        );

        return getUserById(id);
    }

    @Override
    public void deleteUser(Long id) {
        String sql = "DELETE FROM Users WHERE username = ?";
        template.update(sql, id);
    }

}