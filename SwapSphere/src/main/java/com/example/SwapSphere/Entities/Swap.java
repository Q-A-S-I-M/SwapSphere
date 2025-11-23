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
@Table(name = "swap_proposals")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Swap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "swap_id", nullable = false)
    private Long swapId;

    @ManyToOne
    @JoinColumn(name = "sender", nullable = false, referencedColumnName = "username")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver", nullable = false, referencedColumnName = "username")
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "offered_item", nullable = false, referencedColumnName = "offered_item_id")
    private OfferedItem offeredItem;

    @ManyToOne
    @JoinColumn(name = "requested_item", nullable = false, referencedColumnName = "wanted_item_id")
    private WantedItem requestedItem;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "completed_at", nullable = true)
    private LocalDateTime completedAt;
}

