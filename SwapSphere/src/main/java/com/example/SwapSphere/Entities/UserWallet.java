package com.example.SwapSphere.Entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_wallet")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @OneToOne
    @JoinColumn(name = "username", nullable = false, referencedColumnName = "username")
    private User user;
    @Column(name = "tokens_available", nullable = false)
    private int tokensAvailable;
    @Column(name = "tokens_spent", nullable = false)
    private int tokensSpent;
    @Column(name = "tokens_locked", nullable = false)
    private int tokensLocked;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

