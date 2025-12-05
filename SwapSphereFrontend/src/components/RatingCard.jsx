import React from "react";
import "../styles/RatingCard.css";

// Star Rating Component
const StarRating = ({ score, maxScore = 5, size = "medium" }) => {
  const starSize = size === "small" ? "14px" : size === "large" ? "24px" : "18px";
  
  return (
    <div className="star-rating" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[...Array(maxScore)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= score;
        return (
          <span
            key={index}
            className={isFilled ? "star-filled" : "star-empty"}
            style={{
              fontSize: starSize,
              color: isFilled ? '#ffc107' : '#666',
              transition: 'color 0.2s ease'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

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
        <div className="rating-user-info">
          <div className="rater">{raterUsername}</div>
          <div className="score">
            <StarRating score={rating.score || 0} />
          </div>
        </div>
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
