import React, { useState, useEffect } from "react";
import "../styles/AdminReportsPage.css";
import ReportCard from "../components/ReportCard";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/reports");
      // Filter only pending/untreated reports (backend uses 'UNTREATED' status)
      console.log("Fetched reports:", response.data);
      const pendingReports = (response.data || []).filter(
        r => r.status === "Pending" || !r.status || r.status === "PENDING" || r.status === "UNTREATED"
      );
      setReports(pendingReports);
      setError(null);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTreated = async (report) => {
    if (!window.confirm("Mark this report as treated? It will be removed from the list.")) {
      return;
    }

    try {
      // Update report status to treated
      // Assuming backend has an endpoint to update report status
      // For now, we'll just remove it from the list
      // In a real implementation, you'd call: await axios.put(`/reports/${report.reportId}`, { status: "Treated" });
      
      // Remove from list (simulate backend update)
      setReports(prev => prev.filter(r => {
        const rId = r.reportId || r.id;
        const reportId = report.reportId || report.id;
        return rId !== reportId;
      }));
      await axios.put("/reports", report);

      alert("Report marked as treated successfully.");
    } catch (err) {
      console.error("Error marking report as treated:", err);
      alert("Failed to mark report as treated. Please try again.");
    }
  };

  const handleViewProfile = (username) => {
    navigate(`/admin/profile/${username}`);
  };
  const handleViewChat = (report) => {
    // extract reporter and reported usernames safely
    const reporter = report.reporter?.username || report.reporterUsername;
    const reported = report.reported?.username || report.reportedUsername;
    if (!reporter || !reported) {
      alert("Cannot open chat: missing usernames");
      return;
    }

    navigate(
      `/admin/chat?user1=${encodeURIComponent(reporter)}&user2=${encodeURIComponent(reported)}&adminView=true`
    );
  };

  

  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <h1 className="reports-title">Reports Management</h1>
        <button className="btn-refresh" onClick={fetchReports}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>No pending reports to review.</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => {
            const reportId = report.reportId || report.id || Math.random();
            return (
              <ReportCard
                key={reportId}
                report={report}
                onMarkTreated={handleMarkTreated}
                onViewProfile={handleViewProfile}
                onViewChat={handleViewChat}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

