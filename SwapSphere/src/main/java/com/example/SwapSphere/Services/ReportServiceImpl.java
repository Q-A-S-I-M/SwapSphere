package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Report;
import com.example.SwapSphere.RowMappers.ReportRowMapper;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    JdbcTemplate template;

    @Autowired
    ReportRowMapper reportRowMapper;

    @Override
    public Report createReport(Report report) {

        String sql = """
                INSERT INTO Reports (reporter_id, reported_id, reason, status)
                VALUES (?, ?, ?, 'UNTREATED')
                """;

        template.update(sql,
                report.getReporter().getUsername(),
                report.getReported().getUsername(),
                report.getReason()
        );

        String fetchSql = "SELECT * FROM Reports ORDER BY report_id DESC LIMIT 1";

        return template.queryForObject(fetchSql, reportRowMapper);
    }

    @Override
    public List<Report> getAllReports() {
        String sql = "SELECT * FROM Reports";
        System.out.println("works till her \n");
        List<Report> result = template.query(sql, reportRowMapper);
        System.out.println("Retrieved reports: " + result);
        return result;
    }
}
