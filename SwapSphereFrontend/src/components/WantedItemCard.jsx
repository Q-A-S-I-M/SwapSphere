import React, { useState } from "react";
import Modal from "./Modal"; // Reusable modal component
import "../styles/WantedItemCard.css";

export default function WantedItemCard({ item, isOwn=false, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="wanted-card">
        <div className="wanted-top">
          <div className="wanted-left">
            <div className="wanted-name">{item.title || item.name}</div>
          </div>
          <div className="wanted-right">
            <button className="btn-view" onClick={() => setModalOpen(true)}>View</button>
            {isOwn && <button className="btn-delete" onClick={onDelete}>Delete</button>}
          </div>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Wanted Item Details" onClose={() => setModalOpen(false)}>
          <div className="wanted-modal-content">
            <div><strong>Title:</strong> {item.title || item.name}</div>
            <div><strong>Description:</strong> {item.description}</div>
            <div><strong>Category:</strong> {item.category}</div>
            {isOwn && <div><strong>Priority:</strong> {item.priority}</div>}
            <div><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</div>
          </div>
        </Modal>
      )}
    </>
  );
}
