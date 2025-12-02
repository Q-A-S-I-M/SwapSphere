import React, { useEffect, useState } from "react";
import "../styles/NotificationPage.css";

const NotificationPage = ({ username }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/notifications/${username}`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Error fetching notifications:", err));
  }, [username]);

  return (
    <div className="notif-container">
      <h2 className="notif-title">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="no-notifs">No notifications found.</p>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.type === "RED" ? "red" : "green"}`}
            >
              <div className="notif-message">{n.message}</div>

              <div className="notif-meta">
                <span>{n.createdAt?.replace("T", " ").slice(0, 16)}</span>
                {n.isRead ? (
                  <span className="read-badge">Read</span>
                ) : (
                  <span className="unread-badge">Unread</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
