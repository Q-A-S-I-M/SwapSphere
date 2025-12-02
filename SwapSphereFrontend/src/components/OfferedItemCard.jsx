import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import "../styles/OfferedItemCard.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/400?text=Item";

const OfferedItemCard = ({
  item = {},
  isOwnProfile = true,
  source = "profile", // "search" or "profile"
  onRequest, // callback for request popup
  onDelete,  // callback for delete
}) => {
  const imagePool = useMemo(() => {
    if (Array.isArray(item.images) && item.images.length) return item.images;
    if (item.image) return [item.image];
    return [FALLBACK_IMAGE];
  }, [item]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(imagePool[0]);

  const showRequestButton = source === "search" || !isOwnProfile;

  return (
    <>
      <div className="offered-card">
        <img
          src={imagePool[0]}
          className="offered-card-thumb"
          alt={item?.name || "item thumbnail"}
        />
        <h3 className="offered-card-title">{item?.title || item?.name}</h3>

        <div className="offered-card-actions">
          <button className="btn-view" onClick={() => setModalOpen(true)}>
            View
          </button>
          {isOwnProfile && (
            <button className="btn-delete" onClick={() => onDelete?.(item)}>
              Delete
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal title="Offered Item Details" onClose={() => setModalOpen(false)}>
          <div className="offered-modal-content">
            <div className="main-image-wrapper">
              <img
                src={selectedImage}
                alt="item preview"
                className="offered-main-image"
              />
              <div className="offered-thumbnail-row">
                {imagePool.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="thumbnail"
                    className={`thumbnail-img ${
                      img === selectedImage ? "selected-thumb" : ""
                    }`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>

            <div className="offered-details">
              <div className="detail-row">
                <strong>Description:</strong>
                <span>{item.description || "—"}</span>
              </div>
              <div className="detail-row">
                <strong>Category:</strong>
                <span>{item.category || "—"}</span>
              </div>
              <div className="detail-row">
                <strong>Condition:</strong>
                <span>{item.condition || "—"}</span>
              </div>
              {isOwnProfile && (
                <div className="detail-row">
                  <strong>Priority:</strong>
                  <span>{item.priority}</span>
                </div>
              )}
              <div className="detail-row">
                <strong>Status:</strong>
                <span>{item.status || "—"}</span>
              </div>
              <div className="detail-row">
                <strong>Created At:</strong>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>

              {showRequestButton && (
                <button
                  className="request-btn"
                  onClick={() => onRequest?.(item)}
                >
                  Request
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default OfferedItemCard;
