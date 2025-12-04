import React, { useState, useEffect } from "react";
import "../styles/SwapRequestCard.css";
import Modal from "./Modal";
import SuccessModal from "./SuccessModal";
import axios from "../api/axios";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23555555' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function SwapRequestCard({ swap, isReceived, onStatusUpdate }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingItemDetails, setViewingItemDetails] = useState(null);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [selectedItemImage, setSelectedItemImage] = useState(null);
  const [itemImageErrors, setItemImageErrors] = useState(new Set());

  const getItemImage = (item, imageUrl) => {
    // Use the single image from API response if available
    if (imageUrl) {
      return imageUrl;
    }
    if (item?.images && item.images.length > 0) {
      return item.images[0];
    }
    if (item?.image) {
      return item.image;
    }
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

  const handleAction = (action) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setProcessing(true);
    try {
      let status;
      let message;

      if (pendingAction === "accept") {
        status = "ACCEPTED";
        message = "Request accepted successfully!";
      } else if (pendingAction === "reject") {
        status = "REJECTED";
        message = "Request rejected.";
      } else if (pendingAction === "cancel") {
        status = "CANCELLED";
        message = "Request cancelled.";
      }

      await onStatusUpdate(swap.swapId, status);
      setShowConfirmModal(false);
      setPendingAction(null);
      setSuccessMessage(message);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error processing action:", err);
      alert("Failed to process request: " + (err.response?.data?.message || err.message));
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

  // Unpack the DTO - SwapResponseDTO contains swap data and image URLs
  const offeredItem = swap.offeredItem || null; // Can be null for token-only swaps
  const requestedItem = swap.requestedItem || {};
  const sender = swap.sender || {};
  const receiver = swap.receiver || {};
  const tokens = Number(swap.tokens) || 0;
  
  // Get image URLs from DTO
  const offeredItemImage = swap.offeredItemImage || null;
  const requestedItemImage = swap.requestedItemImage || null;
  
  // Determine swap type
  const hasOfferedItem = offeredItem && offeredItem.offeredItemId;
  const hasTokens = tokens > 0;
  const swapType = !hasOfferedItem && hasTokens ? 'tokens-only' 
                   : hasOfferedItem && !hasTokens ? 'item-only' 
                   : 'item-and-tokens';

  return (
    <>
      <div className="swap-request-card">
        <div className="swap-request-header">
          <div className="swap-request-user-info">
            {isReceived ? (
              <>
                <span className="swap-request-label">From:</span>
                <span className="swap-request-username">{sender.username || "Unknown"}</span>
                {sender.fullName && (
                  <span className="swap-request-fullname">({sender.fullName})</span>
                )}
              </>
            ) : (
              <>
                <span className="swap-request-label">To:</span>
                <span className="swap-request-username">{receiver.username || "Unknown"}</span>
                {receiver.fullName && (
                  <span className="swap-request-fullname">({receiver.fullName})</span>
                )}
              </>
            )}
          </div>
          <div className="swap-request-date">
            {formatDate(swap.createdAt)}
          </div>
        </div>

        <div className="swap-request-content">
          {/* Offered Section - Can be Item, Tokens, or Item + Tokens */}
          <div className="swap-item-section">
            <h4 className="swap-item-label">
              {isReceived ? "They are offering:" : "You are offering:"}
            </h4>
            
            {/* Case 1: Item Only or Item + Tokens */}
            {hasOfferedItem ? (
              <div className="swap-item-card">
                <img
                  src={getItemImage(offeredItem, offeredItemImage)}
                  alt={offeredItem.title || "Offered item"}
                  className="swap-item-image"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="swap-item-details">
                  <div className="swap-item-title">{offeredItem.title || "Unknown Item"}</div>
                  {offeredItem.category && (
                    <div className="swap-item-category">{offeredItem.category}</div>
                  )}
                  {offeredItem.condition && (
                    <div className="swap-item-condition">Condition: {offeredItem.condition}</div>
                  )}
                  {isReceived && (
                    <button
                      className="swap-view-item-btn"
                      onClick={() => handleViewItem(offeredItem, offeredItem.offeredItemId)}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Case 2: Tokens Only */
              <div className="swap-tokens-only-card">
                <div className="swap-tokens-only-icon">🪙</div>
                <div className="swap-tokens-only-text">Tokens Only</div>
                {hasTokens && (
                  <div className="swap-tokens-only-amount">{tokens} tokens</div>
                )}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="swap-arrow">→</div>

          {/* Requested Item (What sender wants) - Always an item */}
          <div className="swap-item-section">
            <h4 className="swap-item-label">
              {isReceived ? "They want:" : "You want:"}
            </h4>
            <div className="swap-item-card">
              <img
                src={getItemImage(requestedItem, requestedItemImage)}
                alt={requestedItem.title || "Requested item"}
                className="swap-item-image"
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <div className="swap-item-details">
                <div className="swap-item-title">{requestedItem.title || "Unknown Item"}</div>
                {requestedItem.category && (
                  <div className="swap-item-category">{requestedItem.category}</div>
                )}
                {requestedItem.condition && (
                  <div className="swap-item-condition">Condition: {requestedItem.condition}</div>
                )}
                {!isReceived && (
                  <button
                    className="swap-view-item-btn"
                    onClick={() => handleViewItem(requestedItem, requestedItem.offeredItemId)}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Display - Show only when tokens are offered WITH an item (Case 3: Item + Tokens) */}
        {hasOfferedItem && hasTokens && (
          <div className="swap-tokens swap-tokens-additional">
            <div className="swap-tokens-icon">🪙</div>
            <div className="swap-tokens-info">
              <span className="swap-tokens-label">Additional Tokens:</span>
              <span className="swap-tokens-value">{tokens} tokens</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="swap-request-actions">
          {isReceived ? (
            <>
              <button
                className="swap-action-btn accept-btn"
                onClick={() => handleAction("accept")}
                disabled={processing}
              >
                Accept
              </button>
              <button
                className="swap-action-btn reject-btn"
                onClick={() => handleAction("reject")}
                disabled={processing}
              >
                Reject
              </button>
            </>
          ) : (
            <button
              className="swap-action-btn cancel-btn"
              onClick={() => handleAction("cancel")}
              disabled={processing}
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          onClose={() => {
            if (!processing) {
              setShowConfirmModal(false);
              setPendingAction(null);
            }
          }}
          title={
            pendingAction === "accept"
              ? "Accept Request"
              : pendingAction === "reject"
              ? "Reject Request"
              : "Cancel Request"
          }
        >
          <div className="swap-confirm-modal-content">
            <p>
              {pendingAction === "accept"
                ? "Are you sure you want to accept this swap request?"
                : pendingAction === "reject"
                ? "Are you sure you want to reject this swap request?"
                : "Are you sure you want to cancel this swap request?"}
            </p>
            <div className="swap-confirm-modal-actions">
              <button
                className="swap-confirm-btn confirm-yes"
                onClick={confirmAction}
                disabled={processing}
              >
                {processing ? "Processing..." : "Yes"}
              </button>
              <button
                className="swap-confirm-btn confirm-no"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
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

      {/* Item Details Modal */}
      {viewingItem && (
        <Modal title="Item Details" onClose={handleCloseItemModal}>
          <div className="swap-item-details-modal">
            {loadingItemDetails ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#ffffff' }}>
                Loading item details...
              </div>
            ) : viewingItemDetails ? (
              <>
                <div className="swap-item-modal-image-wrapper">
                  {viewingItemDetails.images && viewingItemDetails.images.length > 0 ? (
                    <>
                      <img
                        src={selectedItemImage && !itemImageErrors.has(selectedItemImage) 
                          ? selectedItemImage 
                          : viewingItemDetails.images[0]}
                        alt="item preview"
                        className="swap-item-modal-main-image"
                        onError={() => handleImageError(selectedItemImage || viewingItemDetails.images[0])}
                      />
                      {viewingItemDetails.images.length > 1 && (
                        <div className="swap-item-modal-thumbnails">
                          {viewingItemDetails.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="thumbnail"
                              className={`swap-item-modal-thumbnail ${
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
                    <div className="swap-item-modal-no-image">No images available</div>
                  )}
                </div>
                <div className="swap-item-modal-info">
                  <div className="swap-item-modal-field">
                    <strong>Title:</strong> {viewingItemDetails.offeredItem?.title || viewingItemDetails.title || "N/A"}
                  </div>
                  <div className="swap-item-modal-field">
                    <strong>Description:</strong> {viewingItemDetails.offeredItem?.description || viewingItemDetails.description || "N/A"}
                  </div>
                  <div className="swap-item-modal-field">
                    <strong>Category:</strong> {viewingItemDetails.offeredItem?.category || viewingItemDetails.category || "N/A"}
                  </div>
                  <div className="swap-item-modal-field">
                    <strong>Condition:</strong> {viewingItemDetails.offeredItem?.condition || viewingItemDetails.condition || "N/A"}
                  </div>
                  <div className="swap-item-modal-field">
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
    </>
  );
}

