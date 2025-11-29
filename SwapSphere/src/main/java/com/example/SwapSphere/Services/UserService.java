package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.DTOs.Login_Request;
import com.example.SwapSphere.Entities.User;

public interface UserService{
    public void register(User user);

    public User getUserById(String username);

    public List<User> getAllUsers();

    public User updateUser(String username, User user);

    public void deleteUser(String username);

    public User login(Login_Request login_Request);
}