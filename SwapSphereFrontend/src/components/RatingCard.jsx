import React from "react";
import "../styles/RatingCard.css";

export default function RatingCard({ rating, currentUsername, onDelete, isAdmin = false }) {
  // Handle both string (legacy) and User object (from backend) formats
  const raterUsername = rating.rater?.username || rating.rater || "Unknown";
  const raterPic = rating.rater?.profilePicUrl || rating.raterPic || null;
  const isOwnReview = currentUsername && raterUsername === currentUsername;
  const canDelete = isOwnReview || isAdmin;
  
  return (
    <div className="rating-card">
      <div className="rating-left">
        {raterPic ? (
          <img src={raterPic} alt={raterUsername} className="rating-avatar"/>
        ) : (
          <div className="rating-avatar-fallback">{raterUsername.charAt(0).toUpperCase()}</div>
        )}
        <div className="rater">{raterUsername}</div>
        <div className="score">{rating.score} / 5</div>
      </div>
      <div className="rating-right">
        <div className="review">{rating.review || "—"}</div>
      </div>
      <div className="rating-date">{rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : ""}</div>
      {canDelete && onDelete && (
        <button 
          className="rating-delete-btn" 
          onClick={() => {
            if (window.confirm(isAdmin ? "Are you sure you want to delete this review? (Admin action)" : "Are you sure you want to delete this review?")) {
              onDelete(rating.ratingId);
            }
          }}
          title={isAdmin ? "Delete review (Admin)" : "Delete your review"}
        >
          Delete
        </button>
      )}
    </div>
  );
}
