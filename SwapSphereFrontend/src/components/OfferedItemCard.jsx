import React, { useMemo, useState, useEffect, useCallback } from "react";
import Modal from "./Modal";
import SuccessModal from "./SuccessModal";
import "../styles/OfferedItemCard.css";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23555555' width='400' height='400'/%3E%3Ctext fill='%23ffffff' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const OfferedItemCard = ({
  item = {},
  isOwnProfile = true,
  source = "profile", // "search" or "profile"
  onRequest, // callback for request popup
  onDelete,  // callback for delete
}) => {
  // Initial image pool from props
  const initialImagePool = useMemo(() => {
    if (Array.isArray(item.images) && item.images.length) return item.images;
    if (item.image) return [item.image];
    return [FALLBACK_IMAGE];
  }, [item]);

  const [modalOpen, setModalOpen] = useState(false);
  const [fullItem, setFullItem] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(initialImagePool[0]);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [increasingPriority, setIncreasingPriority] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPriorityUpdate, setPendingPriorityUpdate] = useState(null);

  const { user } = useAuth();
  const showRequestButton = source === "search" || !isOwnProfile;

  // Get item ID - handle both flat and nested structures
  const getItemId = () => {
    return item.offeredItemId || item.offeredItem?.offeredItemId || null;
  };

  // Fetch full item details with all images when modal opens
  const fetchFullItemDetails = useCallback(async (itemId) => {
    if (!itemId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/offer-items/get-item/${itemId}`);
      const data = response.data;
      
      // Handle nested structure: { offeredItem: {...}, images: [...] }
      let itemData = data;
      let images = [];
      
      if (data.offeredItem) {
        // Backend returns nested structure from OfferedItemWithImages DTO
        itemData = data.offeredItem;
        images = data.images || []; // getImages() returns 'images' in JSON
      } else {
        // Already flat structure or direct item
        itemData = data;
        images = data.images || [];
      }
      
      setFullItem(itemData);
      const finalImages = images.length > 0 ? images : initialImagePool;
      setAllImages(finalImages);
      if (finalImages.length > 0) {
        setSelectedImage(finalImages[0]);
      }
    } catch (error) {
      console.error("Error fetching full item details:", error);
      
      // If it's a 403, the axios interceptor should handle token refresh
      // But if it still fails, show a user-friendly message
      if (error.response?.status === 403) {
        console.warn("Access denied. Token refresh should be attempted by interceptor.");
        // The interceptor will handle refresh, but if it fails, we'll fallback
      }
      
      // Fallback to original item data (use what we already have)
      setFullItem(item);
      setAllImages(initialImagePool);
    } finally {
      setLoading(false);
    }
  }, [item, initialImagePool]);

  useEffect(() => {
    const itemId = getItemId();
    if (modalOpen && itemId) {
      fetchFullItemDetails(itemId);
    }
  }, [modalOpen, fetchFullItemDetails]);

  // Use full item data if available, otherwise use prop item
  const displayItem = fullItem || item;
  
  // Use all images if fetched, otherwise use initial pool
  const imagePool = allImages.length > 0 ? allImages : initialImagePool;

  // Check if the item actually belongs to the current user
  const itemOwnerUsername = displayItem.user?.username || displayItem.username;
  const isItemOwner = user && itemOwnerUsername && itemOwnerUsername === user.username;
  const canIncreasePriority = isOwnProfile && isItemOwner;

  const handleViewClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Reset when modal closes
    setFullItem(null);
    setAllImages([]);
    setSelectedImage(initialImagePool[0]);
    setImageErrors(new Set());
    setErrorMessage(null);
  };

  const handleIncreasePriorityClick = () => {
    const itemId = getItemId();
    if (!itemId) {
      setErrorMessage("Item ID not found");
      return;
    }

    const currentPriority = displayItem.priority || 0;
    const newPriority = currentPriority + 5;

    // Store the update info and show confirmation modal
    setPendingPriorityUpdate({ itemId, currentPriority, newPriority });
    setShowConfirmModal(true);
  };

  const handleConfirmPriorityIncrease = async () => {
    if (!pendingPriorityUpdate) return;

    // Validate user exists
    if (!user || !user.username) {
      setErrorMessage("User information not available. Please log in again.");
      setShowConfirmModal(false);
      return;
    }

    const { itemId } = pendingPriorityUpdate;
    setShowConfirmModal(false);
    setIncreasingPriority(true);
    setErrorMessage(null);

    try {
      // Send username as JSON string (backend expects @RequestBody String username)
      const response = await axios.put(
        `/offer-items/update-priority/${itemId}`,
        user.username,
        { headers: { "Content-Type": "text/plain" } }
      );
      const updatedItem = response.data;

      // Update the priority smoothly in state without reloading
      if (fullItem) {
        // Update fullItem with new priority, preserving all other data
        setFullItem(prev => ({
          ...prev,
          priority: updatedItem.priority
        }));
      }

      // Show success message
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error increasing priority:", error);
      console.error("Error response:", error.response);
      
      let errorMsg = "Failed to increase priority. Please try again.";
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        // Handle specific error messages from backend
        // GlobalExceptionHandler now returns RuntimeException as 400 with plain string message
        if (status === 400) {
          // Backend GlobalExceptionHandler returns RuntimeException message as plain string
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (data?.message) {
            errorMsg = data.message;
          } else if (data?.error) {
            errorMsg = data.error;
          } else {
            errorMsg = "Invalid request. Please check your input.";
          }
        } else if (status === 500) {
          // Fallback for any unexpected 500 errors
          if (typeof data === 'string') {
            errorMsg = data;
          } else if (data?.message) {
            errorMsg = data.message;
          } else if (data?.error) {
            errorMsg = data.error;
          } else {
            errorMsg = "Server error occurred. Please try again later.";
          }
        } else if (status === 403) {
          errorMsg = "Access denied. Your session may have expired. Please refresh the page and try again.";
        } else if (status === 401) {
          errorMsg = "Authentication failed. Please log in again.";
        } else if (status === 404) {
          errorMsg = "Item not found. It may have been deleted.";
        } else {
          // Generic error message
          errorMsg = typeof data === 'string' ? data : (data?.message || `Server error (${status}). Please try again.`);
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = "No response from server. Please check your connection and try again.";
      } else {
        // Error setting up the request
        errorMsg = error.message || "An unexpected error occurred. Please try again.";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIncreasingPriority(false);
      setPendingPriorityUpdate(null);
    }
  };

  const handleImageError = (imageUrl) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  // Filter out broken images
  const validImagePool = useMemo(() => {
    return imagePool.filter(img => !imageErrors.has(img));
  }, [imagePool, imageErrors]);

  return (
    <>
      <div className="offered-card">
        <img
          src={initialImagePool[0] || FALLBACK_IMAGE}
          className="offered-card-thumb"
          alt={item?.name || "item thumbnail"}
          onError={(e) => {
            if (e.target.src !== FALLBACK_IMAGE) {
              e.target.src = FALLBACK_IMAGE;
            }
          }}
        />
        <h3 className="offered-card-title">{item?.title || item?.name}</h3>

        <div className="offered-card-actions">
          <button className="btn-view" onClick={handleViewClick}>
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
        <Modal title="Offered Item Details" onClose={handleCloseModal}>
          <div className="offered-modal-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#ffffff' }}>
                Loading item details...
              </div>
            ) : (
              <>
                <div className="main-image-wrapper">
                  {validImagePool.length > 0 ? (
                    <>
                      <img
                        src={selectedImage && !imageErrors.has(selectedImage) ? selectedImage : validImagePool[0]}
                        alt="item preview"
                        className="offered-main-image"
                        onError={() => handleImageError(selectedImage)}
                      />
                      {validImagePool.length > 1 && (
                        <div className="offered-thumbnail-row">
                          {validImagePool.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="thumbnail"
                              className={`thumbnail-img ${
                                img === selectedImage ? "selected-thumb" : ""
                              }`}
                              onClick={() => setSelectedImage(img)}
                              onError={() => handleImageError(img)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="offered-main-image" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#555555',
                      color: '#ffffff',
                      minHeight: '300px'
                    }}>
                      No images available
                    </div>
                  )}
                </div>

                <div className="offered-details">
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <span>{displayItem.description || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Category:</strong>
                    <span>{displayItem.category || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Condition:</strong>
                    <span>{displayItem.condition || displayItem.itemCondition || "—"}</span>
                  </div>
                  {isOwnProfile && (
                    <div className="detail-row">
                      <strong>Priority:</strong>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {displayItem.priority || 0}
                        {canIncreasePriority && (
                          <button
                            className="priority-increase-btn"
                            onClick={handleIncreasePriorityClick}
                            disabled={increasingPriority}
                          >
                            {increasingPriority ? 'Processing...' : '+5'}
                          </button>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span>{displayItem.status || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Created At:</strong>
                    <span>{new Date(displayItem.createdAt).toLocaleString()}</span>
                  </div>

                  {errorMessage && (
                    <div style={{
                      padding: '10px',
                      marginTop: '10px',
                      backgroundColor: '#ff4444',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {errorMessage}
                    </div>
                  )}

                  {showRequestButton && (
                    <button
                      className="request-btn"
                      onClick={() => onRequest?.(displayItem)}
                    >
                      Request
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {showSuccessModal && (
        <SuccessModal
          message="Priority increased successfully!"
          onClose={() => setShowSuccessModal(false)}
          autoCloseDelay={2000}
        />
      )}

      {showConfirmModal && pendingPriorityUpdate && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Confirm Priority Increase</h2>
              <button className="modal-close-btn" onClick={() => setShowConfirmModal(false)} aria-label="Close modal">×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#ffffff' }}>
                Are you sure you want to increase the priority from <strong>{pendingPriorityUpdate.currentPriority}</strong> to <strong>{pendingPriorityUpdate.newPriority}</strong>?
              </p>
              <p style={{ marginBottom: '20px', color: '#cccccc', fontSize: '14px' }}>
                This action will cost <strong style={{ color: '#ffd700' }}>5 tokens</strong> and update the item's priority.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingPriorityUpdate(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#555',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPriorityIncrease}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfferedItemCard;
