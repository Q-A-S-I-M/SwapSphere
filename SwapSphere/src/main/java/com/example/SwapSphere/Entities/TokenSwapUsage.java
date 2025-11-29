package com.example.SwapSphere.Entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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

    // @ManyToOne
    // @JoinColumn(name = "swap_id", nullable = false, referencedColumnName = "swap_id")
    // private Swap swap;

    @ManyToOne
    @JoinColumn(name = "username", nullable = false, referencedColumnName = "username")
    private User user;

    @ManyToOne
    @JoinColumn(name = "counterparty_user_id", nullable = false, referencedColumnName = "username")
    private User counterparty;

    // @OneToOne
    // @JoinColumn(name = "offered_item_id", nullable = false, referencedColumnName = "offered_item_id")
    // private OfferedItem offeredItem;
    @Column(name = "tokens_used", nullable = false)
    private int tokensUsed;
    // @Column(name = "tokens_received", nullable = false)
    // private int tokensReceived;

    // @Enumerated(EnumType.STRING)
    // @Column(name = "usage_type", nullable = false)
    // private UsageType usageType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // public enum UsageType {
    //     ESCROW_HOLD,
    //     ESCROW_RELEASE,
    //     ESCROW_SETTLEMENT,
    //     TOKEN_ADJUSTMENT_SWAP
    // }
}
