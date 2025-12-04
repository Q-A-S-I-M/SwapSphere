import React, { useEffect } from "react";
import "../styles/SuccessModal.css";

export default function SuccessModal({ open, message, onClose, autoCloseDelay = 3000 }) {
  useEffect(() => {
    if (open && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [open, autoCloseDelay, onClose]);

  if (!open) return null;

  return (
    <div className="success-modal-backdrop" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-container">
          <svg className="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="success-circle" cx="12" cy="12" r="10" />
            <path className="success-check" d="M8 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="success-message">{message}</div>
        <button className="success-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

