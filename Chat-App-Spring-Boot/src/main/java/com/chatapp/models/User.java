package com.chatapp.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    public User(String name, String password, String username, String dateOfBirth, String email) {
        this.name = name;
        this.password = password;
        this.username = username;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
    }
}
