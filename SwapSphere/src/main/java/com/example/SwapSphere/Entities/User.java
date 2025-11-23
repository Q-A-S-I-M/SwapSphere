package com.example.SwapSphere.Entities;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "email", nullable = false)
    private String email;
    @Column(name = "password", nullable = false)
    private String password;
    @Column(name = "contact", nullable = false)
    private String contact;
    @Column(name = "role", nullable = false)
    private String role;
    @Column(name = "tokens", nullable = true)
    private int tokens;
    @Column(name = "rating", nullable = true)
    private int rating;
    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;
    @Column(name = "longitude", nullable = false)
    private Double locLat;
    @Column(name = "latitude", nullable = false)
    private Double locLong;
}
