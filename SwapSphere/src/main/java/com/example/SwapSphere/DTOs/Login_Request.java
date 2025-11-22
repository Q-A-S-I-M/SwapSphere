package com.example.SwapSphere.DTOs;

public class Login_Request {
    public String username;
    public String password;
    public String role;
    public Login_Request(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}
