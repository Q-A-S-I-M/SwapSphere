// src/components/OfferedItemCard.jsx
import React, { useMemo, useState } from "react";
import "../styles/OfferedItemCard.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/400?text=Item";

const OfferedItemCard = ({
  item = {},
  isOwnProfile = true,
  source = "profile", // "search" or "profile"
  onRequest, // callback for request popup
}) => {
  const imagePool = useMemo(() => {
    if (Array.isArray(item.images) && item.images.length) return item.images;
    if (item.image) return [item.image];
    return [FALLBACK_IMAGE];
  }, [item]);

  const [expanded, setExpanded] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(imagePool[0]);

  const showRequestButton = source === "search" || !isOwnProfile;
  const showSearchUsername = source === "search" && item?.username;

  const detailRows = [
    { label: "Description", value: item?.description },
    { label: "Category", value: item?.category },
    { label: "Condition", value: item?.condition },
    !isOwnProfile && { label: "Priority", value: item?.priority },
    { label: "Status", value: item?.status },
    { label: "Created", value: item?.createdAt },
  ].filter(Boolean);

  return (
    <div className={`offered-card ${expanded ? "expanded" : ""}`}>
      <div className="offered-card-header">
        <img
          src={imagePool[0]}
          className="offered-card-thumb"
          alt={item?.name || "item thumbnail"}
        />

        <h3 className="offered-card-title">{item?.name}</h3>

        <button
          className="expand-btn"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label="Toggle details"
        >
          {expanded ? "˄" : "˅"}
        </button>
      </div>

      {expanded && (
        <div className="offered-expanded">
          {showSearchUsername && (
            <p className="search-username">
              Offered by{" "}
              <a
                href="#"
                className="search-username-link"
                onClick={(e) => e.preventDefault()}
              >
                {item.username}
              </a>
            </p>
          )}

          <div className="expanded-content-row">
            <div className="main-image-wrapper">
              <img
                src={selectedImage}
                className="offered-main-image"
                alt={`${item?.name || "item"} preview`}
              />

              <div className="offered-thumbnail-row">
                {imagePool.map((img, idx) => (
                  <img
                    key={`${img}-${idx}`}
                    src={img}
                    className={`thumbnail-img ${
                      img === selectedImage ? "selected-thumb" : ""
                    }`}
                    onClick={() => setSelectedImage(img)}
                    alt="thumbnail"
                  />
                ))}
              </div>
            </div>

            <div className="details-right">
              <div className="offered-details">
                {detailRows.map(({ label, value }) => (
                  <div className="detail-row" key={label}>
                    <strong>{label}:</strong>
                    <span className="meta-val">{value || "—"}</span>
                  </div>
                ))}
              </div>

              {showRequestButton && (
                <button
                  className="request-btn"
                  onClick={() => onRequest?.(item)}
                >
                  Request
                </button>
              )}

              {!deleteMode ? (
                isOwnProfile && (
                  <button
                    className="delete-btn"
                    onClick={() => setDeleteMode(true)}
                  >
                    ✕
                  </button>
                )
              ) : (
                <div className="delete-confirm-row">
                  <button
                    className="delete-cancel"
                    onClick={() => setDeleteMode(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="delete-confirm"
                    onClick={() => alert("Item deleted (backend later)")}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferedItemCard;
