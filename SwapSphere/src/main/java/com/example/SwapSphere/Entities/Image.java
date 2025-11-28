package com.example.SwapSphere.Entities;

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
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "images")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY )
    @Column(name = "img_id")
    private int imgId;
    @Column(name = "img_url")
    private String imgURL;
    @ManyToOne
    @JoinColumn(name = "offered_item_id", nullable = false, referencedColumnName = "offered_item_id")
    private OfferedItem item;
}
