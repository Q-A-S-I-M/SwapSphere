import React from "react";
import "../styles/UserCard.css";

const FALLBACK_PROFILE_PIC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23555555' width='100' height='100'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EUser%3C/text%3E%3C/svg%3E";

export default function UserCard({ user, onViewProfile }) {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(user);
    }
  };

  const profilePic = user.profilePicUrl || FALLBACK_PROFILE_PIC;
  const location = [user.country, user.city].filter(Boolean).join(", ") || "Location not set";
  const rating = user.rating || 0;

  return (
    <div className="user-card">
      <div className="user-card-header">
        <img
          src={profilePic}
          alt={user.username}
          className="user-card-avatar"
          onError={(e) => {
            if (e.target.src !== FALLBACK_PROFILE_PIC) {
              e.target.src = FALLBACK_PROFILE_PIC;
            }
          }}
        />
        <div className="user-card-info">
          <h3 className="user-card-username">{user.username}</h3>
          <p className="user-card-fullname">{user.fullName || "—"}</p>
          <div className="user-card-location">
            <span className="location-icon">📍</span>
            <span>{location}</span>
          </div>
          <div className="user-card-rating">
            <span className="rating-label">Rating:</span>
            <span className="rating-value">{rating.toFixed(1)} ⭐</span>
          </div>
        </div>
      </div>
      <button className="user-card-view-btn" onClick={handleViewProfile}>
        View Profile
      </button>
    </div>
  );
}

