import React from "react";
import "../styles/DashboardPage.css";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="card white-card">
        <h2>Welcome to SwapSphere</h2>
        <p>Overview & quick stats will appear here.</p>
      </div>

      <div className="grid">
        <div className="card white-card">Portfolio (placeholder)</div>
        <div className="card white-card">Recent Activity (placeholder)</div>
      </div>
    </div>
  );
}
