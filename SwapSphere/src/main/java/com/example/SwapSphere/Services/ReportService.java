package com.example.SwapSphere.Services;

import java.util.List;

import com.example.SwapSphere.Entities.Report;

public interface ReportService {

    Report createReport(Report report);

    List<Report> getAllReports();

    void markAsTreated(Long reportId);
    
}
