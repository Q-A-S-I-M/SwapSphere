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
    @Column(name = "rating", nullable = true)
    private double rating;
    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;
    @Column(name = "latitude", nullable = false)
    private Double locLat;
    @Column(name = "longitude", nullable = false)
    private Double locLong;
    private String country;
    private String city;
    @Column(name = "profile_pic_url", nullable = true)
    private String profilePicUrl;
}
