package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.User;

public interface UserService{
    public void register(User user);

    public User getUserById(Long id);

    public List<User> getAllUsers();

    public User updateUser(Long id, User user);

    public void deleteUser(Long id);
}