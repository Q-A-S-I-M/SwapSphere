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
@Table(name = "offered_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offered_item_id", nullable = false)
    private Long offeredItemId;

    @ManyToOne
    @JoinColumn(name = "username", nullable = false, referencedColumnName = "username")
    private User user;

    private String title;
    private String description;
    private String category;
    @Column(name = "item_condition", nullable = false)
    private String condition;
    private int priority;
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

