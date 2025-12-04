import React, { useState } from "react";
import "../styles/ItemTabs.css";

/**
 * Props:
 * - offeredCount, wantedCount, ratingsCount
 * - offeredLabel, wantedLabel, ratingsLabel (optional custom labels)
 * - showRatings (optional, defaults to true)
 * - renderAddButton(activeTab) => jsx|null
 * - renderContent(activeTab) => jsx
 */
export default function ItemTabs({ 
  offeredCount=0, 
  wantedCount=0, 
  ratingsCount=0,
  offeredLabel="Offered",
  wantedLabel="Wanted",
  ratingsLabel="Ratings",
  showRatings=true,
  renderAddButton, 
  renderContent 
}) {
  const [active, setActive] = useState("offered"); // default

  return (
    <div className="itabs-root">
      <div className="itabs-row">
        <button className={`itab ${active === "offered" ? "active" : ""}`} onClick={() => setActive("offered")}>
          {offeredLabel} <span className="count">({offeredCount})</span>
        </button>

        <button className={`itab ${active === "wanted" ? "active" : ""}`} onClick={() => setActive("wanted")}>
          {wantedLabel} <span className="count">({wantedCount})</span>
        </button>

        {showRatings && (
          <button className={`itab ${active === "ratings" ? "active" : ""}`} onClick={() => setActive("ratings")}>
            {ratingsLabel} <span className="count">({ratingsCount})</span>
          </button>
        )}
      </div>

      <div className="itabs-add-area">
        {renderAddButton ? renderAddButton(active) : null}
      </div>

      <div className="itabs-content">
        {renderContent ? renderContent(active) : null}
      </div>
    </div>
  );
}
