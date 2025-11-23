package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Report;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    JdbcTemplate template;

    @Override
    public Report createReport(Report report) {

        String sql = """
                INSERT INTO Reports (reporter_id, reported_id, swap_id, reason, status)
                VALUES (?, ?, ?, ?, ?)
                """;

        template.update(sql,
                report.getReporter().getUsername(),
                report.getReported().getUsername(),
                report.getSwap().getSwapId(),
                report.getReason(),
                report.getStatus()
        );

        String fetchSql = "SELECT * FROM Reports ORDER BY report_id DESC LIMIT 1";

        return template.queryForObject(fetchSql, new BeanPropertyRowMapper<>(Report.class));
    }

    @Override
    public List<Report> getAllReports() {
        String sql = "SELECT * FROM Reports";
        return template.query(sql, new BeanPropertyRowMapper<>(Report.class));
    }
}
