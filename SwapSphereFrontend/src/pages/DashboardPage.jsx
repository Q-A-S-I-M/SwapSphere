import React, { useState, useEffect } from "react";
import "../styles/DashboardPage.css";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SwapHistoryCard from "../components/SwapHistoryCard";

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSwapHistory = async () => {
    if (!authUser?.username) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/swaps/history/${authUser.username}`);
      setSwapHistory(response.data || []);
    } catch (err) {
      console.error("Error fetching swap history:", err);
      setError("Failed to load swap history");
      setSwapHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapHistory();
  }, [authUser?.username]);

  const handleStatusUpdate = async (swapId, newStatus) => {
    try {
      await axios.put(`/swaps/${swapId}/status?status=${newStatus}`);
      // Refresh the swap history
      await fetchSwapHistory();
    } catch (err) {
      console.error("Error updating swap status:", err);
      alert("Failed to update swap status: " + (err.response?.data?.message || err.message));
      throw err; // Re-throw to let the component handle it
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">Your swap history and activity</p>
      </div>

      {/* Error Message */}
      {error && <div className="dashboard-error">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="dashboard-loading">Loading swap history...</div>
      )}

      {/* Swap History List */}
      {!loading && !error && (
        <div className="dashboard-swaps-section">
          {swapHistory.length === 0 ? (
            <div className="dashboard-empty">
              <p>No swap history found.</p>
              <p className="dashboard-empty-subtitle">Your completed, accepted, rejected, and cancelled swaps will appear here.</p>
            </div>
          ) : (
            <>
              <h3 className="dashboard-section-title">Swap History ({swapHistory.length})</h3>
              <div className="dashboard-swaps-list">
                {swapHistory.map((swap) => (
                  <SwapHistoryCard
                    key={swap.swapId}
                    swap={swap}
                    currentUsername={authUser?.username}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
