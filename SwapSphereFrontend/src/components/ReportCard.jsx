import React from "react";
import "../styles/ReportCard.css";

export default function ReportCard({ report, onMarkTreated, onViewProfile }) {
  const reporter = report.reporter?.username || report.reporterUsername || "Unknown";
  const reported = report.reported?.username || report.reportedUsername || "Unknown";
  const reason = report.reason || "No reason provided";
  const createdAt = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown date";

  return (
    <div className="report-card">
      <div className="report-header">
        <div className="report-users">
          <div className="report-user-item">
            <span className="report-label">Reported by:</span>
            <span className="report-username">{reporter}</span>
          </div>
          <div className="report-arrow">→</div>
          <div className="report-user-item">
            <span className="report-label">Reported user:</span>
            <span className="report-username">{reported}</span>
          </div>
        </div>
      </div>

      <div className="report-body">
        <div className="report-reason">
          <strong>Reason:</strong>
          <p>{reason}</p>
        </div>
        {/*<div className="report-date">
          <strong>Reported on:</strong> {createdAt}
        </div>*/}
      </div>

      <div className="report-actions">
        <button className="btn-view-profile" onClick={() => onViewProfile(reported)}>
          View Profile
        </button>
        <button className="btn-mark-treated" onClick={() => onMarkTreated(report)}>
          Mark as Treated
        </button>
      </div>
    </div>
  );
}

