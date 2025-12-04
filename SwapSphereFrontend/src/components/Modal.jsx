import React from "react";
import "../styles/Modal.css"; // optional, for styling

export default function Modal({ title, children, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
