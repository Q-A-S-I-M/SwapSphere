package com.example.SwapSphere.DTOs;

public class TokensTransfer {
    private String username;
    private int tokens;
    public String getUsername() {
        return username;
    }
    public TokensTransfer(String username, int tokens) {
        this.username = username;
        this.tokens = tokens;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public int getTokens() {
        return tokens;
    }
    public void setTokens(int tokens) {
        this.tokens = tokens;
    }
    
}
