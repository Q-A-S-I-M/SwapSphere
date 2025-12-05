import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
  const [pieChartData, setPieChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
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
      const inProgressSwaps = swaps.filter(s => s.status === "PENDING" || s.status === "In Progress" || (s.status !== "COMPLETED" && s.status !== "Accepted")).length;
      const pendingReports = reports.filter(r => r.status === "Pending" || !r.status || r.status === "PENDING" || r.status === "UNTREATED").length;
      const activeItems = items.filter(i => {
        const item = i.offeredItem || i;
        return item.status === "Available" || item.status === "ACTIVE" || item.status === "AVAILABLE";
      }).length;

      // Prepare pie chart data (Swap Status Distribution)
      const pieData = [
        { name: "Completed", value: completedSwaps, color: "#4caf50" },
        { name: "In Progress", value: inProgressSwaps, color: "#b8860b" },
      ].filter(item => item.value > 0);

      // Prepare line chart data (User Registration Over Time)
      const userRegistrationData = {};
      users.forEach(user => {
        if (user.createdAt) {
          const date = new Date(user.createdAt);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          userRegistrationData[monthYear] = (userRegistrationData[monthYear] || 0) + 1;
        }
      });

      // Convert to array and sort by date
      const lineData = Object.entries(userRegistrationData)
        .map(([name, users]) => ({ name, users }))
        .sort((a, b) => {
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA - dateB;
        })
        .slice(-7); // Show last 7 months

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
      setPieChartData(pieData);
      setLineChartData(lineData);
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
          <div className="chart-container">
            <div className="chart-bar-wrapper">
              <div className="chart-bar-label">Completed</div>
              <div className="chart-bar-track">
                <div 
                  className="chart-bar chart-bar-completed" 
                  style={{ width: `${(stats.completedSwaps / Math.max(stats.totalSwaps, 1)) * 100}%` }}
                >
                  {stats.completedSwaps}
                </div>
              </div>
            </div>
            <div className="chart-bar-wrapper">
              <div className="chart-bar-label">In Progress</div>
              <div className="chart-bar-track">
                <div 
                  className="chart-bar chart-bar-progress" 
                  style={{ width: `${((stats.totalSwaps - stats.completedSwaps) / Math.max(stats.totalSwaps, 1)) * 100}%` }}
                >
                  {stats.totalSwaps - stats.completedSwaps}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Swap Status Distribution (Pie Chart)</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No swap data available</div>
          )}
        </div>

        <div className="chart-card">
          <h3>User Registration Over Time (Line Chart)</h3>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2a2a2a', 
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#b8860b" 
                  strokeWidth={3}
                  dot={{ fill: '#b8860b', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No registration data available</div>
          )}
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

