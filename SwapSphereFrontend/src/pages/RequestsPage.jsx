import React, { useState, useEffect } from "react";
import "../styles/RequestsPage.css";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SwapRequestCard from "../components/SwapRequestCard";

export default function RequestsPage() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("received"); // "sent" or "received"
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSentRequests = async () => {
    if (!authUser?.username) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/swaps/sender/${authUser.username}`);
      setSentRequests(response.data || []);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
      setError("Failed to load sent requests");
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedRequests = async () => {
    if (!authUser?.username) return;
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/swaps/reciever/${authUser.username}`);
      setReceivedRequests(response.data || []);
    } catch (err) {
      console.error("Error fetching received requests:", err);
      setError("Failed to load received requests");
      setReceivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sent") {
      fetchSentRequests();
    } else {
      fetchReceivedRequests();
    }
  }, [activeTab, authUser?.username]);

  const handleStatusUpdate = async (swapId, newStatus) => {
    try {
      await axios.put(`/swaps/${swapId}/status?status=${newStatus}`);
      // Refresh the appropriate list
      if (activeTab === "sent") {
        await fetchSentRequests();
      } else {
        await fetchReceivedRequests();
      }
    } catch (err) {
      console.error("Error updating swap status:", err);
      alert("Failed to update request: " + (err.response?.data?.message || err.message));
    }
  };

  const currentRequests = activeTab === "sent" ? sentRequests : receivedRequests;

  return (
    <div className="requests-page">
      <h2 className="requests-page-title">Swap Requests</h2>

      {/* Tabs */}
      <div className="requests-tabs">
        <button
          className={`tab-button ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received Requests ({receivedRequests.length})
        </button>
        <button
          className={`tab-button ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="requests-error">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="requests-loading">Loading requests...</div>
      )}

      {/* Requests List */}
      {!loading && (
        <div className="requests-list">
          {currentRequests.length === 0 ? (
            <div className="no-requests">
              No {activeTab === "sent" ? "sent" : "received"} requests found.
            </div>
          ) : (
            currentRequests.map((swap) => (
              <SwapRequestCard
                key={swap.swapId}
                swap={swap}
                isReceived={activeTab === "received"}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

