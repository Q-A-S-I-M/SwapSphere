import React, { useState, useEffect } from "react";
import "../styles/AdminDashboardPage.css";
import axios from "../api/axios";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSwaps: 0,
    tokensInCirculation: 0,
    pendingReports: 0,
    activeItems: 0,
    completedSwaps: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [usersRes, swapsRes, reportsRes, itemsRes] = await Promise.all([
        axios.get("/users").catch(() => ({ data: [] })),
        axios.get("/swaps").catch(() => ({ data: [] })),
        axios.get("/reports").catch(() => ({ data: [] })),
        axios.get("/offer-items").catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const swaps = swapsRes.data || [];
      const reports = reportsRes.data || [];
      const items = itemsRes.data || [];

      // Calculate stats
      const totalUsers = users.length;
      const totalSwaps = swaps.length;
      const completedSwaps = swaps.filter(s => s.status === "COMPLETED" || s.status === "Accepted").length;
      const pendingReports = reports.filter(r => r.status === "Pending" || !r.status || r.status === "PENDING" || r.status === "UNTREATED").length;
      const activeItems = items.filter(i => {
        const item = i.offeredItem || i;
        return item.status === "Available" || item.status === "ACTIVE";
      }).length;

      // Calculate tokens in circulation (sum of all user wallets)
      let tokensInCirculation = 0;
      try {
        const walletPromises = users.map(u => 
          axios.get(`/wallet/${u.username}`).catch(() => ({ data: { tokensAvailable: 0 } }))
        );
        const wallets = await Promise.all(walletPromises);
        tokensInCirculation = wallets.reduce((sum, w) => sum + (w.data?.tokensAvailable || 0), 0);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
      }

      setStats({
        totalUsers,
        totalSwaps,
        tokensInCirculation,
        pendingReports,
        activeItems,
        completedSwaps,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSwaps}</div>
            <div className="stat-label">Total Swaps</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedSwaps}</div>
            <div className="stat-label">Completed Swaps</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🪙</div>
          <div className="stat-content">
            <div className="stat-value">{stats.tokensInCirculation.toLocaleString()}</div>
            <div className="stat-label">Tokens in Circulation</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingReports}</div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeItems}</div>
            <div className="stat-label">Active Items</div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Swap Status Distribution</h3>
          <div className="chart-placeholder">
            <div className="chart-bar" style={{ width: `${(stats.completedSwaps / Math.max(stats.totalSwaps, 1)) * 100}%` }}>
              Completed: {stats.completedSwaps}
            </div>
            <div className="chart-bar" style={{ width: `${((stats.totalSwaps - stats.completedSwaps) / Math.max(stats.totalSwaps, 1)) * 100}%` }}>
              In Progress: {stats.totalSwaps - stats.completedSwaps}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Platform Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span>Active Users</span>
              <span className="activity-value">{stats.totalUsers}</span>
            </div>
            <div className="activity-item">
              <span>Items Listed</span>
              <span className="activity-value">{stats.activeItems}</span>
            </div>
            <div className="activity-item">
              <span>Reports to Review</span>
              <span className="activity-value">{stats.pendingReports}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

