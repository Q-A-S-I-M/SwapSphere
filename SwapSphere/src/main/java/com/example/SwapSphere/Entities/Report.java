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
@Table(name = "reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false, referencedColumnName = "username")
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "reported_id", nullable = false, referencedColumnName = "username")
    private User reported;
    private String reason;
    private String status;
}

