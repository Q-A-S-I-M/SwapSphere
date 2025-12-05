package com.chatapp.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.gson.JsonObject;
import com.chatapp.models.Account;
import com.chatapp.services.AuthService;
import com.chatapp.repositories.AccountRepository;
import com.chatapp.repositories.MessageRepository;

import java.util.ArrayList;
import java.util.List;
import com.google.gson.JsonArray;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private MessageRepository messageRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Account account = authService.login(request.username, request.password);
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("username", account.getUsername());
            response.addProperty("email", account.getEmail());
            response.addProperty("name", account.getName());
            response.addProperty("message", "Login successful");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(401).body(error.toString());
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            Account newAccount = new Account(
                request.name,
                request.password,
                request.username,
                request.dateOfBirth,
                request.email
            );
            Account savedAccount = authService.signup(newAccount);
            
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("username", savedAccount.getUsername());
            response.addProperty("message", "Account created successfully");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(400).body(error.toString());
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        try {
            Account account = authService.getAccount(username);
            if (account == null) {
                JsonObject error = new JsonObject();
                error.addProperty("success", false);
                error.addProperty("message", "User not found");
                return ResponseEntity.status(404).body(error.toString());
            }
            
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("username", account.getUsername());
            response.addProperty("email", account.getEmail());
            response.addProperty("name", account.getName());
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Account> accounts = accountRepository.findAll();
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            JsonArray usersArray = new JsonArray();
            for (Account acc : accounts) {
                JsonObject u = new JsonObject();
                u.addProperty("username", acc.getUsername());
                u.addProperty("name", acc.getName());
                u.addProperty("email", acc.getEmail());
                usersArray.add(u);
            }
            response.add("users", usersArray);
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }

    @GetMapping("/users/{currentUsersname}")
    public ResponseEntity<?> getUsers(@PathVariable String currentUsersname) {
        try {
            List<String> usernamesWithChatHistory = messageRepository.findDistinctUsersWithChatHistory(currentUsersname);
            System.out.println("usernamesWithChatHistory: " + usernamesWithChatHistory);
            if (usernamesWithChatHistory == null || usernamesWithChatHistory.isEmpty()) {
                JsonObject emptyResp = new JsonObject();
                emptyResp.addProperty("success", true);
                emptyResp.add("users", new JsonArray());
                return ResponseEntity.ok(emptyResp.toString());
            }
            List<Account> accounts  = getAccountsByUsernames(usernamesWithChatHistory);
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            JsonArray usersArray = new JsonArray();
            for (Account acc : accounts) {
                if (!acc.getUsername().equals(currentUsersname)) {
                    JsonObject u = new JsonObject();
                    u.addProperty("username", acc.getUsername());
                    u.addProperty("name", acc.getName());
                    u.addProperty("email", acc.getEmail());
                    usersArray.add(u);
                }
            }
            response.add("users", usersArray);
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }
    public List<Account> getAccountsByUsernames(List<String> usernames) {
        List<Account> accounts = new ArrayList<>();
        for (String username : usernames) {
            Account acc = accountRepository.findByUsername(username);
            if (acc != null) {
                accounts.add(acc);
            }
        }
        return accounts;
    }

    static class LoginRequest {
        public String username;
        public String password;
    }

    static class SignupRequest {
        public String name;
        public String username;
        public String email;
        public String password;
        public String dateOfBirth;
    }
}
