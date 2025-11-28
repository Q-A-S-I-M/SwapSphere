import React from "react";
import "../styles/RatingCard.css";

export default function RatingCard({ rating }) {
  return (
    <div className="rating-card">
      <div className="rating-left">
        {rating.raterPic ? (
          <img src={rating.raterPic} alt={rating.rater} className="rating-avatar"/>
        ) : (
          <div className="rating-avatar-fallback">{rating.rater.charAt(0).toUpperCase()}</div>
        )}
        <div className="rater">{rating.rater}</div>
        <div className="score">{rating.score} / 5</div>
      </div>
      <div className="rating-right">
        <div className="review">{rating.review}</div>
      </div>
      <div className="rating-date">{new Date(rating.createdAt).toLocaleDateString()}</div>
    </div>
  );
}
