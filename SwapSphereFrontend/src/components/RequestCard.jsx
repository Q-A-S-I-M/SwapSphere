import React, { useEffect, useState } from "react";
import "../styles/RequestCard.css";

/**
 * Props:
 * - open (bool)
 * - onClose()
 * - targetItem (the item being requested)
 * - myItems (array of user's own offered items to select from)
 * - myTokens (number)
 * - loadingMyItems (bool) - optional, shows loading state
 * - onConfirm(payload) -> called with { method, selectedItemIds, tokensOffered, note }
 */
export default function RequestCard({ open, onClose, targetItem, myItems = [], myTokens = 0, loadingMyItems = false, onConfirm }) {
  const [method, setMethod] = useState("Both"); // 'Items', 'Tokens', 'Both'
  const [selectedId, setSelectedId] = useState(null); // Single selection instead of array
  const [tokensOffer, setTokensOffer] = useState("");
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  // reset when opened (using prevOpen to detect change)
  useEffect(() => {
    if (open && !prevOpen) {
      // Reset form state when modal opens - valid use case for resetting form on open
      /* eslint-disable react-hooks/set-state-in-effect */
      setMethod("Both");
      setSelectedId(null);
      setTokensOffer("");
      setError("");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    setPrevOpen(open);
  }, [open, prevOpen]);

  const handleSelect = (id) => {
    setSelectedId(id === selectedId ? null : id); // Toggle: if same item clicked, deselect
  };

  const availableTokens = myTokens || 0;
  const shouldShowItems = method !== "Tokens";
  const shouldShowTokens = method !== "Items";

  const handleConfirm = () => {
    setError("");
    const tokensNum = Number(tokensOffer || 0);
    if (shouldShowTokens && tokensNum > availableTokens) {
      setError(`You can only offer up to ${availableTokens} tokens. You entered ${tokensNum} tokens.`);
      return;
    }
    if (shouldShowTokens && tokensNum < 0) {
      setError("Tokens cannot be negative.");
      return;
    }
    if (shouldShowItems && !selectedId) {
      setError("Please select an item to offer.");
      return;
    }

    const payload = {
      method,
      selectedItemIds: selectedId ? [selectedId] : [], // Wrap single ID in array for consistency
      tokensOffered: tokensNum,
      targetItemId: targetItem?.id ?? null,
      targetItemName: targetItem?.name ?? null
    };

    if (onConfirm) onConfirm(payload);
  };

  if (!open) return null;

  return (
    <div className="request-overlay">
      <div className="request-card" role="dialog" aria-modal="true">
        <div className="request-top">
          <h3>Request: <span className="target-name">{targetItem?.name}</span></h3>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>

        <div className="request-controls">
          <div className="control-left">
            <label>Swap method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Both</option>
              <option>Items</option>
              <option>Tokens</option>
            </select>
          </div>

          <div className="control-right">
            <label>Tokens to offer</label>
            <input
              className="tokens-input"
              type="number"
              min="0"
              value={tokensOffer}
              onChange={(e) => setTokensOffer(e.target.value)}
              placeholder="Enter tokens"
              disabled={!shouldShowTokens}
            />
          </div>
        </div>

        {shouldShowItems && (
          <div className="request-items-area">
            <label>Choose your items to offer</label>
            <div className="request-items-grid">
              {loadingMyItems && <div className="muted">Loading your items...</div>}
              {!loadingMyItems && myItems.length === 0 && <div className="muted">You have no offered items available.</div>}
              {!loadingMyItems && myItems.map((mi) => (
                <div key={mi.id} className="request-item-row">
                  <label className="request-item-checkbox">
                    <input
                      type="radio"
                      name="selectedItem"
                      checked={selectedId === mi.id}
                      onChange={() => handleSelect(mi.id)}
                    />
                  </label>

                  <div className="request-item-thumb">
                    {mi.image ? <img src={mi.image} alt={mi.name} /> : <div className="thumb-fallback">{mi.name.charAt(0).toUpperCase()}</div>}
                  </div>

                  <div className="request-item-meta">
                    <div className="ri-name">{mi.name}</div>
                    <div className="ri-cat">{mi.category} • {mi.condition}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="request-error">{error}</div>}

        <div className="request-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
