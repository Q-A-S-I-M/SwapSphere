import React, { useState } from "react";
import "../styles/WantedItemCard.css";

/**
 * Wanted card (no images)
 */
export default function WantedItemCard({ item, isOwn=false, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleExpand = () => setExpanded((s) => !s);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) onDelete();
  };

  const cancelDelete = () => setConfirmDelete(false);

  return (
    <div className={`wanted-card ${expanded ? "expanded" : ""}`}>
      <div className="wanted-top">
        <div className="wanted-left">
          <div className="wanted-name">{item.name}</div>
        </div>

        <div className="wanted-right">
          <button className="toggle-btn" onClick={toggleExpand}>{expanded ? "^" : "v"}</button>
        </div>
      </div>

      <div className="wanted-expanded" style={{ maxHeight: expanded ? "400px" : "0px" }}>
        <div className="wanted-meta">
          <div className="meta-row"><strong>Description:</strong><div className="meta-val">{item.description}</div></div>
          <div className="meta-row"><strong>Category:</strong><div className="meta-val">{item.category}</div></div>
          <div className="meta-row"><strong>Condition:</strong><div className="meta-val">{item.condition}</div></div>
          {isOwn && <div className="meta-row"><strong>Priority:</strong><div className="meta-val">{item.priority}</div></div>}
          <div className="meta-row"><strong>Status:</strong><div className="meta-val">{item.status}</div></div>
          <div className="meta-row"><strong>Created:</strong><div className="meta-val">{new Date(item.createdAt).toLocaleString()}</div></div>
        </div>

        <div className="wanted-actions">
          {!confirmDelete ? (
            <button className="remove-btn" onClick={handleDelete}>✕</button>
          ) : (
            <div className="confirm-split">
              <button className="confirm-yes" onClick={handleDelete}>Confirm</button>
              <button className="confirm-no" onClick={cancelDelete}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
