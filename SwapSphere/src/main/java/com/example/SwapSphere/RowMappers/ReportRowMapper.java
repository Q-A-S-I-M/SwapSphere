package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.Report;
import com.example.SwapSphere.Services.UserService;

@Component
public class ReportRowMapper implements RowMapper<Report> {
    @Autowired
    private UserService userService;

    @Override
    public Report mapRow(ResultSet rs, int rowNum) throws SQLException {

        Report rpt = new Report();
        rpt.setReportId(rs.getLong("report_id"));

        rpt.setReporter(userService.getUserById(rs.getString("reporter_id")));
        rpt.setReported(userService.getUserById(rs.getString("reported_id")));

        rpt.setReason(rs.getString("reason"));
        rpt.setStatus(rs.getString("status"));

        return rpt;
    }
}

