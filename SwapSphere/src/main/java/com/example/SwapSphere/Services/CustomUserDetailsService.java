package com.example.SwapSphere.Services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.User;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private JdbcTemplate template;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Normal user from database
        String sql = "SELECT username, password, role FROM users WHERE username = ?";
        return template.query(sql, rs -> {
            if(rs.next()){
                String dbUsername = rs.getString("username");
                String dbPassword = rs.getString("password");
                String dbRole = rs.getString("role");

                return org.springframework.security.core.userdetails.User.builder()
                    .username(dbUsername)
                    .password(dbPassword)
                    .roles(dbRole)
                    .build();
            }
            return null;
        }, username);
    }

    public Optional<User> findByUsername(String username) {
        try {
            String sql = "SELECT * FROM users WHERE username = ?";
            User user = template.query(
                sql, rs -> {
                    if (rs.next()) {
                        return new BeanPropertyRowMapper<>(User.class).mapRow(rs, 1);
                    }
                    return null;
                }, username);
            return Optional.of(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

}

