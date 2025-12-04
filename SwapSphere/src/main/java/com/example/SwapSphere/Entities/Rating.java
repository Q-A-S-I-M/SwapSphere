package com.example.SwapSphere.Entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ratings")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id", nullable = false)
    private Long ratingId;

    @ManyToOne
    @JoinColumn(name = "rater_id", nullable = false, referencedColumnName = "username")
    private User rater;

    @ManyToOne
    @JoinColumn(name = "rated_user_id", nullable = false, referencedColumnName = "username")
    private User ratedUser;

    private int score;
    private String review;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
