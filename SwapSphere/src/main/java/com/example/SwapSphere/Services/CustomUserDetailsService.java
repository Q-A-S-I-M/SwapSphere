package com.example.SwapSphere.Services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.User;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private JdbcTemplate template;
    @Autowired
    private PasswordEncoder passwordEncoder;
    // private String getAdminPass(){
    //     return passwordEncoder.encode("kmc31y8");
    // }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // // Hardcoded admin
        // if (username.equals("batman")) {
        //     return org.springframework.security.core.userdetails.User.builder()
        //             .username("batman")
        //             .password(getAdminPass())
        //             .roles("ADMIN")
        //             .build();
        // }

        // Normal user from database
        String sql = "SELECT user_id, password, role FROM users WHERE user_id = ?";
        return template.queryForObject(sql, new Object[]{username}, (rs, rowNum) -> {
            String dbUsername = rs.getString("username");
            String dbPassword = rs.getString("password");
            String dbRole = rs.getString("role");

            return org.springframework.security.core.userdetails.User.builder()
                    .username(dbUsername)
                    .password(dbPassword)
                    .roles(dbRole)
                    .build();
        });
    }

    public Optional<User> findByUsername(String username) {
        try {
            String sql = "SELECT * FROM users WHERE user_id = ?";
            User user = template.queryForObject(
                sql,
                new Object[]{username},
                new BeanPropertyRowMapper<>(User.class)
            );
            return Optional.of(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

}

