import React, { useEffect, useState } from "react";
import "../styles/NotificationPage.css";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const NotificationPage = ({ username }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const targetUsername = username || user?.username;
      if (!targetUsername) return;

      const response = await axios.get(`/notifications/${targetUsername}`);
      setNotifications(response.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [username, user?.username]);

  const getNotificationTypeClass = (type) => {
    if (!type) return "blue";
    const upperType = type.toUpperCase();
    if (upperType === "RED") return "red";
    if (upperType === "GREEN") return "green";
    if (upperType === "BLUE") return "blue";
    return "blue"; // default
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="notif-container">
      <h2 className="notif-title">Notifications</h2>

      {loading ? (
        <p className="no-notifs">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="no-notifs">No notifications found.</p>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => {
            const notificationId = n.notificationId || n.id;
            const isRead = n.isRead !== undefined ? n.isRead : n.read;
            const type = n.type || "BLUE";
            
            return (
              <div
                key={notificationId}
                className={`notif-item ${getNotificationTypeClass(type)}`}
              >
                <div className="notif-message">{n.message || "No message"}</div>

                <div className="notif-meta">
                  <span>{formatDate(n.createdAt)}</span>
                  {isRead ? (
                    <span className="read-badge">Read</span>
                  ) : (
                    <span className="unread-badge">Unread</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
