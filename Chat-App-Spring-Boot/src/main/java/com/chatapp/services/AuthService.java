package com.chatapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.chatapp.models.User;
import com.chatapp.models.Account;
import com.chatapp.repositories.UserRepository;
import com.chatapp.repositories.AccountRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    public Account login(String username, String password) throws Exception {
        Account account = accountRepository.findByUsername(username);
        if (account == null) {
            throw new Exception("User not found");
        }
        if (!account.getPassword().equals(password)) {
            throw new Exception("Invalid password");
        }
        return account;
    }

    public Account signup(Account account) throws Exception {
        Account existingAccount = accountRepository.findByUsername(account.getUsername());
        if (existingAccount != null) {
            throw new Exception("Username already exists");
        }

        Account existingEmail = accountRepository.findByEmail(account.getEmail());
        if (existingEmail != null) {
            throw new Exception("Email already exists");
        }

        return accountRepository.save(account);
    }

    public Account getAccount(String username) {
        return accountRepository.findByUsername(username);
    }
}
