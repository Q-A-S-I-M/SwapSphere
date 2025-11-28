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
@Table(name = "token_feature_usage")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TokenFeatureUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Long usageId;

    @ManyToOne
    @JoinColumn(name = "username", nullable = false, referencedColumnName = "username")
    private User user;

    @ManyToOne
    @JoinColumn(name = "offered_item_id", nullable = true, referencedColumnName = "offered_item_id")
    private OfferedItem offeredItem;

    @ManyToOne
    @JoinColumn(name = "wanted_item_id", nullable = true, referencedColumnName = "wanted_item_id")
    private WantedItem wantedItem;
    @Column(name = "feature_type")
    private String featureType;
    @Column(name = "token_used")
    private int tokensUsed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
