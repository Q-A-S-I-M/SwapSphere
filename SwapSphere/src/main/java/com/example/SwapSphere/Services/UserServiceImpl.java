package com.example.SwapSphere.Services;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.DTOs.Login_Request;
import com.example.SwapSphere.Entities.User;
import com.example.SwapSphere.RowMappers.UserRowMapper;


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
            query = "INSERT INTO Users (username, full_name, email, password, contact, role, rating, created_at, longitude, latitude, profile_pic_url, country, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            user.setRating(0);
            user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            template.update(query, user.getUsername(), user.getFullName(), user.getEmail(), hashPassword, user.getContact(), user.getRole(), user.getRating(), user.getCreatedAt(), user.getLocLong(), user.getLocLat(), user.getProfilePicUrl(), user.getCountry(), user.getCity());
        }else{
            throw new RuntimeException("Username already exists!");
        }

    }
    @Override
    public User getUserById(String username) {
        String sql = "SELECT * FROM Users WHERE username = ?";
        return template.queryForObject(sql, new UserRowMapper(), username);
    }

    @Override
    public List<User> getAllUsers() {
        String sql = "SELECT * FROM Users";
        return template.query(sql, new UserRowMapper());
    }

    @Override
    public User updateUser(String username, User user) {
        String sql = """
            UPDATE users SET 
                full_name = ?, 
                email = ?, 
                contact = ?, 
                longitude = ?, 
                latitude = ?,
                rating = ?,
                country = ?,
                city = ?
            WHERE username = ?
        """;

        template.update(sql,
                user.getFullName(),
                user.getEmail(),
                user.getContact(),
                user.getLocLong(),
                user.getLocLat(),
                user.getRating(),
                user.getCountry(),
                user.getCity(),
                username
        );
        return getUserById(username);
    }

    @Override
    public void deleteUser(String username) {
        String sql = "DELETE FROM Users WHERE username = ?";
        template.update(sql, username);
    }
    @Override
    public User login(Login_Request login_Request) {
        String hashPassword = passwordEncoder.encode(login_Request.password);
        String query = "SELECT COUNT(*) FROM users WHERE username = ?";
        int count = template.queryForObject(query, Integer.class, login_Request.username);
        if(count == 0 ){
            throw new RuntimeException("User doesnt exists!");
        }else{
            query = "SELECT * FROM users WHERE username = ?";
            User user = template.queryForObject(query, new UserRowMapper(), login_Request.username);
            if(user.getPassword().equals(hashPassword)){
                return user;
            }else{
                throw new RuntimeException("Wrong Password!");
            }
        }
    }
    @Override
    public List<User> searchUsers(String self, String query) {
        String sql = "SELECT * FROM Users WHERE (username LIKE ? OR full_name LIKE ?) AND username != ?";
        return template.query(sql, new UserRowMapper(), "%" + query + "%", "%" + query + "%", self);
    }

}