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
@Table(name = "token_swap_usage")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TokenSwapUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "swap_usage_id", nullable = false)
    private Long swapUsageId;

    @ManyToOne
    @JoinColumn(name = "username", nullable = false, referencedColumnName = "username")
    private User user;

    @ManyToOne
    @JoinColumn(name = "counterparty_user_id", nullable = false, referencedColumnName = "username")
    private User counterparty;
    @Column(name = "tokens_used", nullable = false)
    private int tokensUsed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
