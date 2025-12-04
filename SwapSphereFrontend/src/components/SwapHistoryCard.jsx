import React, { useState, useEffect } from "react";
import "../styles/SwapHistoryCard.css";
import Modal from "./Modal";
import SuccessModal from "./SuccessModal";
import axios from "../api/axios";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23555555' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function SwapHistoryCard({ swap, currentUsername, onStatusUpdate }) {
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingItemDetails, setViewingItemDetails] = useState(null);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [selectedItemImage, setSelectedItemImage] = useState(null);
  const [itemImageErrors, setItemImageErrors] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getItemImage = (item, imageUrl) => {
    if (imageUrl) return imageUrl;
    if (item?.images && item.images.length > 0) return item.images[0];
    if (item?.image) return item.image;
    return FALLBACK_IMAGE;
  };

  const handleViewItem = async (item, itemId) => {
    setViewingItem(item);
    setLoadingItemDetails(true);
    setSelectedItemImage(null);
    setItemImageErrors(new Set());
    
    try {
      const response = await axios.get(`/offer-items/get-item/${itemId}`);
      setViewingItemDetails(response.data);
      if (response.data?.images && response.data.images.length > 0) {
        setSelectedItemImage(response.data.images[0]);
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
      setViewingItemDetails(null);
    } finally {
      setLoadingItemDetails(false);
    }
  };

  const handleImageError = (imgUrl) => {
    setItemImageErrors(prev => new Set([...prev, imgUrl]));
  };

  const handleCloseItemModal = () => {
    setViewingItem(null);
    setViewingItemDetails(null);
    setSelectedItemImage(null);
    setItemImageErrors(new Set());
  };

  const handleMarkComplete = () => {
    setShowConfirmModal(true);
  };

  const confirmMarkComplete = async () => {
    setShowConfirmModal(false);
    setProcessing(true);
    try {
      await onStatusUpdate(swap.swapId, "COMPLETED");
      setSuccessMessage("Swap marked as complete!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error marking swap as complete:", err);
      alert("Failed to mark swap as complete: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED": return "#4caf50";
      case "REJECTED": return "#f44336";
      case "CANCELLED": return "#ff9800";
      case "COMPLETED": return "#2196f3";
      default: return "#999";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED": return "Accepted";
      case "REJECTED": return "Rejected";
      case "CANCELLED": return "Cancelled";
      case "COMPLETED": return "Completed";
      default: return status || "Unknown";
    }
  };

  const offeredItem = swap.offeredItem || null;
  const requestedItem = swap.requestedItem || {};
  const sender = swap.sender || {};
  const receiver = swap.receiver || {};
  const tokens = Number(swap.tokens) || 0;
  
  const hasOfferedItem = offeredItem && offeredItem.offeredItemId;
  const hasTokens = tokens > 0;
  const isAccepted = swap.status?.toUpperCase() === "ACCEPTED";
  const isSender = sender.username === currentUsername;

  return (
    <>
      <div className="swap-history-card">
        <div className="swap-history-header">
          <div className="swap-history-user-info">
            {isSender ? (
              <>
                <span className="swap-history-label">To:</span>
                <span className="swap-history-username">{receiver.username || "Unknown"}</span>
                {receiver.fullName && (
                  <span className="swap-history-fullname">({receiver.fullName})</span>
                )}
              </>
            ) : (
              <>
                <span className="swap-history-label">From:</span>
                <span className="swap-history-username">{sender.username || "Unknown"}</span>
                {sender.fullName && (
                  <span className="swap-history-fullname">({sender.fullName})</span>
                )}
              </>
            )}
          </div>
          <div className="swap-history-status-badge" style={{ backgroundColor: getStatusColor(swap.status) }}>
            {getStatusLabel(swap.status)}
          </div>
        </div>

        <div className="swap-history-content">
          {/* Offered Section */}
          <div className="swap-history-item-section">
            <h4 className="swap-history-item-label">
              {isSender ? "You offered:" : "They offered:"}
            </h4>
            
            {hasOfferedItem ? (
              <div className="swap-history-item-card">
                <img
                  src={getItemImage(offeredItem, swap.offeredItemImage)}
                  alt={offeredItem.title || "Offered item"}
                  className="swap-history-item-image"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="swap-history-item-details">
                  <div className="swap-history-item-title">{offeredItem.title || "Unknown Item"}</div>
                  {offeredItem.category && (
                    <div className="swap-history-item-category">{offeredItem.category}</div>
                  )}
                  {!isSender && (
                    <button
                      className="swap-history-view-item-btn"
                      onClick={() => handleViewItem(offeredItem, offeredItem.offeredItemId)}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="swap-history-tokens-only-card">
                <div className="swap-history-tokens-only-icon">🪙</div>
                <div className="swap-history-tokens-only-text">Tokens Only</div>
                {hasTokens && (
                  <div className="swap-history-tokens-only-amount">{tokens} tokens</div>
                )}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="swap-history-arrow">→</div>

          {/* Requested Item */}
          <div className="swap-history-item-section">
            <h4 className="swap-history-item-label">
              {isSender ? "You wanted:" : "They wanted:"}
            </h4>
            <div className="swap-history-item-card">
              <img
                src={getItemImage(requestedItem, swap.requestedItemImage)}
                alt={requestedItem.title || "Requested item"}
                className="swap-history-item-image"
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <div className="swap-history-item-details">
                <div className="swap-history-item-title">{requestedItem.title || "Unknown Item"}</div>
                {requestedItem.category && (
                  <div className="swap-history-item-category">{requestedItem.category}</div>
                )}
                {isSender && (
                  <button
                    className="swap-history-view-item-btn"
                    onClick={() => handleViewItem(requestedItem, requestedItem.offeredItemId)}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Display */}
        {hasOfferedItem && hasTokens && (
          <div className="swap-history-tokens">
            <div className="swap-history-tokens-icon">🪙</div>
            <div className="swap-history-tokens-info">
              <span className="swap-history-tokens-label">Additional Tokens:</span>
              <span className="swap-history-tokens-value">{tokens} tokens</span>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="swap-history-dates">
          <div className="swap-history-date-item">
            <span className="swap-history-date-label">Created:</span>
            <span className="swap-history-date-value">{formatDate(swap.createdAt)}</span>
          </div>
          {swap.completedAt && (
            <div className="swap-history-date-item">
              <span className="swap-history-date-label">Completed:</span>
              <span className="swap-history-date-value">{formatDate(swap.completedAt)}</span>
            </div>
          )}
        </div>

        {/* Mark as Complete Button - Only for Accepted swaps */}
        {isAccepted && (
          <div className="swap-history-actions">
            <button
              className="swap-history-complete-btn"
              onClick={handleMarkComplete}
              disabled={processing}
            >
              {processing ? "Processing..." : "Mark as Complete"}
            </button>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {viewingItem && (
        <Modal title="Item Details" onClose={handleCloseItemModal}>
          <div className="swap-history-item-details-modal">
            {loadingItemDetails ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#ffffff' }}>
                Loading item details...
              </div>
            ) : viewingItemDetails ? (
              <>
                <div className="swap-history-modal-image-wrapper">
                  {viewingItemDetails.images && viewingItemDetails.images.length > 0 ? (
                    <>
                      <img
                        src={selectedItemImage && !itemImageErrors.has(selectedItemImage) 
                          ? selectedItemImage 
                          : viewingItemDetails.images[0]}
                        alt="item preview"
                        className="swap-history-modal-main-image"
                        onError={() => handleImageError(selectedItemImage || viewingItemDetails.images[0])}
                      />
                      {viewingItemDetails.images.length > 1 && (
                        <div className="swap-history-modal-thumbnails">
                          {viewingItemDetails.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="thumbnail"
                              className={`swap-history-modal-thumbnail ${
                                img === selectedItemImage ? "selected" : ""
                              }`}
                              onClick={() => setSelectedItemImage(img)}
                              onError={() => handleImageError(img)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="swap-history-modal-no-image">No images available</div>
                  )}
                </div>
                <div className="swap-history-modal-info">
                  <div className="swap-history-modal-field">
                    <strong>Title:</strong> {viewingItemDetails.offeredItem?.title || viewingItemDetails.title || "N/A"}
                  </div>
                  <div className="swap-history-modal-field">
                    <strong>Description:</strong> {viewingItemDetails.offeredItem?.description || viewingItemDetails.description || "N/A"}
                  </div>
                  <div className="swap-history-modal-field">
                    <strong>Category:</strong> {viewingItemDetails.offeredItem?.category || viewingItemDetails.category || "N/A"}
                  </div>
                  <div className="swap-history-modal-field">
                    <strong>Condition:</strong> {viewingItemDetails.offeredItem?.condition || viewingItemDetails.condition || "N/A"}
                  </div>
                  <div className="swap-history-modal-field">
                    <strong>Status:</strong> {viewingItemDetails.offeredItem?.status || viewingItemDetails.status || "N/A"}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#ffffff' }}>
                Failed to load item details.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          onClose={() => {
            if (!processing) {
              setShowConfirmModal(false);
            }
          }}
          title="Mark Swap as Complete"
        >
          <div className="swap-history-confirm-modal-content">
            <p>Are you sure you want to mark this swap as complete?</p>
            <div className="swap-history-confirm-modal-actions">
              <button
                className="swap-history-confirm-btn confirm-yes"
                onClick={confirmMarkComplete}
                disabled={processing}
              >
                {processing ? "Processing..." : "Yes"}
              </button>
              <button
                className="swap-history-confirm-btn confirm-no"
                onClick={() => {
                  if (!processing) {
                    setShowConfirmModal(false);
                  }
                }}
                disabled={processing}
              >
                No
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </>
  );
}

