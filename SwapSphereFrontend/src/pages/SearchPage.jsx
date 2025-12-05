import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SearchPage.css";
import "../styles/ProfilePage.css";
import OfferedItemCard from "../components/OfferedItemCard";
import UserCard from "../components/UserCard";
import RequestCard from "../components/RequestCard";
import ItemTabs from "../components/ItemTabs";
import WantedItemCard from "../components/WantedItemCard";
import RatingCard from "../components/RatingCard";
import Modal from "../components/Modal";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Interactive Star Rating Component (Play Store style)
const InteractiveStarRating = ({ score, onScoreChange }) => {
  const [hoveredScore, setHoveredScore] = useState(0);

  const handleStarClick = (starValue) => {
    onScoreChange(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoveredScore(starValue);
  };

  const handleMouseLeave = () => {
    setHoveredScore(0);
  };

  const getStarColor = (starValue) => {
    const displayScore = hoveredScore || score;
    if (starValue <= displayScore) {
      return '#ffc107'; // Gold for filled stars
    }
    return '#666'; // Gray for empty stars
  };

  const handleChatWithUser = (username) => {
    console.log("handleChatWithUser called", { username, authUser });
    if (!username) {
      console.warn("No username provided to handleChatWithUser");
      return;
    }
    if (!authUser || !authUser.username) {
      alert("You must be logged in to start a chat");
      return;
    }
    // If clicking on your own profile, navigate to chat list instead of opening a conversation
    if (username === authUser.username) {
      navigate('/chat');
      return;
    }
    // ensure query param is encoded
    navigate(`/chat?user=${encodeURIComponent(username)}`);
  }

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '40px',
            color: getStarColor(starValue),
            transition: 'all 0.15s ease',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default function SearchPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("items"); // "users" or "items"
  const [userResults, setUserResults] = useState([]);
  const [itemResults, setItemResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);
  const [myOfferedItems, setMyOfferedItems] = useState([]);
  const [loadingMyItems, setLoadingMyItems] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  
  // Profile view state
  const [viewingUser, setViewingUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [profileOfferedItems, setProfileOfferedItems] = useState([]);
  const [profileWantedItems, setProfileWantedItems] = useState([]);
  const [profileRatings, setProfileRatings] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Report, Warn, and Rating modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "" });
  const [warnForm, setWarnForm] = useState({ reason: "" });
  const [ratingForm, setRatingForm] = useState({ score: 0, review: "" });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submittingWarn, setSubmittingWarn] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  
  const isAdmin = authUser?.role === "ADMIN";
  const isAdminViewingProfile = isAdmin && viewingUser && authUser?.username !== viewingUser?.username;

  // Fetch profile data when viewing a user
  useEffect(() => {
    if (!viewingUser) {
      setProfileUser(null);
      setProfileOfferedItems([]);
      setProfileWantedItems([]);
      setProfileRatings([]);
      return;
    }

    let isMounted = true;
    setLoadingProfile(true);

    const fetchProfileData = async () => {
      try {
        const [userRes, offeredRes, wantedRes, ratingsRes] = await Promise.all([
          axios.get(`/users/${viewingUser.username}`),
          axios.get(`/offer-items/user-item/${viewingUser.username}`),
          axios.get(`/wanted-items/user-item/${viewingUser.username}`),
          axios.get(`/ratings/user/${viewingUser.username}`),
        ]);

        if (!isMounted) return;

        const userData = userRes.data;
        setProfileUser({
          username: userData.username || "",
          fullName: userData.fullName || "",
          email: userData.email || "",
          contact: userData.contact || "",
          role: userData.role || "",
          rating: userData.rating || 0,
          createdAt: userData.createdAt || null,
          locLat: userData.locLat || null,
          locLong: userData.locLong || null,
          country: userData.country || "",
          city: userData.city || "",
          profilePicUrl: userData.profilePicUrl || null,
        });

        // Transform offered items
        const offeredItemsRaw = offeredRes.data || [];
        const transformedOfferedItems = offeredItemsRaw.map(item => {
          if (item.offeredItem) {
            return {
              ...item.offeredItem,
              images: item.images || []
            };
          }
          return item;
        });
        setProfileOfferedItems(transformedOfferedItems);

        setProfileWantedItems(wantedRes.data || []);
        setProfileRatings(ratingsRes.data || []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data");
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [viewingUser]);

  // Debounced search function
  const performSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setUserResults([]);
      setItemResults([]);
      return;
    }

    if (!authUser?.username) {
      setError("Please log in to search");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (searchType === "users") {
        const response = await axios.get("/users/search", {
          params: {
            self: authUser.username,
            query: searchTerm.trim()
          }
        });
        setUserResults(response.data || []);
        setItemResults([]);
      } else {
        const response = await axios.get("/search/items", {
          params: {
            keyword: searchTerm.trim(),
            username: authUser.username
          }
        });
        const items = response.data || [];
        // Fetch images for each item
        const itemsWithImages = await Promise.all(
          items.map(async (item) => {
            try {
              const itemRes = await axios.get(`/offer-items/get-item/${item.offeredItemId}`);
              const itemData = itemRes.data;
              // Handle nested structure
              if (itemData.offeredItem) {
                return {
                  ...itemData.offeredItem,
                  images: itemData.images || []
                };
              }
              return {
                ...itemData,
                images: itemData.images || []
              };
            } catch (err) {
              console.error(`Error fetching images for item ${item.offeredItemId}:`, err);
              return {
                ...item,
                images: []
              };
            }
          })
        );
        setItemResults(itemsWithImages);
        setUserResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data || err.message || "Failed to perform search");
      setUserResults([]);
      setItemResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchType, authUser]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [performSearch]);

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setUserResults([]);
    setItemResults([]);
    setError(null);
    setViewingUser(null); // Clear profile view when changing search type
  };

  const handleViewProfile = (user) => {
    setViewingUser(user);
  };

  const handleBackToSearch = () => {
    setViewingUser(null);
  };

  // Fetch user's own offered items and wallet when request modal opens
  useEffect(() => {
    if (requestTarget && authUser?.username) {
      setLoadingMyItems(true);
      Promise.all([
        axios.get(`/offer-items/user-item/${authUser.username}`),
        axios.get(`/wallet/${authUser.username}`)
      ])
        .then(([itemsRes, walletRes]) => {
          // Handle items
          const itemsRaw = itemsRes.data || [];
          // Transform nested structure to flat structure
          const transformedItems = itemsRaw.map(item => {
            if (item.offeredItem) {
              return {
                ...item.offeredItem,
                images: item.images || []
              };
            }
            return item;
          });
          // Filter only AVAILABLE items and transform to RequestCard format
          const formattedItems = transformedItems
            .filter(item => item.status === "AVAILABLE")
            .map(item => ({
              id: item.offeredItemId,
              name: item.title,
              image: item.images && item.images.length > 0 ? item.images[0] : null,
              category: item.category || "",
              condition: item.condition || ""
            }));
          setMyOfferedItems(formattedItems);
          
          // Handle wallet
          setUserWallet(walletRes.data);
        })
        .catch(err => {
          console.error("Error fetching user's data:", err);
          setMyOfferedItems([]);
          setUserWallet(null);
        })
        .finally(() => {
          setLoadingMyItems(false);
        });
    } else {
      setMyOfferedItems([]);
      setUserWallet(null);
    }
  }, [requestTarget, authUser?.username]);

  // Transform targetItem to RequestCard format
  const getFormattedTargetItem = (item) => {
    if (!item) return null;
    return {
      id: item.offeredItemId || item.id,
      name: item.title || item.name,
      ...item
    };
  };

  const handleChatWithUser = (username) => {
    if (!username || !authUser || username === authUser.username) return;
    navigate(`/chat?user=${username}`);
  };

  // Show profile view if viewing a user
  if (viewingUser) {
    return (
      <div className="search-wrapper">
        <div className="profile-view-header">
          <button className="back-to-search-btn" onClick={handleBackToSearch}>
            ← Back to Search
          </button>
        </div>

        {loadingProfile ? (
          <div className="profile-page-root">
            <div className="empty-note">Loading profile...</div>
          </div>
        ) : profileUser ? (
          <div className="profile-page-root">
            {/* Header */}
            <div className="profile-header-panel">
              <div className="profile-header-left">
                <div className="avatar-large">
                  {profileUser.profilePicUrl ? (
                    <img src={profileUser.profilePicUrl} alt="avatar" />
                  ) : (
                    <div className="avatar-fallback">{profileUser.username?.charAt(0).toUpperCase() || "U"}</div>
                  )}
                </div>
              </div>
              <div className="profile-header-right">
                <div className="profile-meta-vertical">
                  <div><strong>Username:</strong> {profileUser.username || "..."}</div>
                  <div><strong>Full Name:</strong> {profileUser.fullName || "..."}</div>
                  <div><strong>Contact:</strong> {profileUser.contact || "..."}</div>
                  <div><strong>Email:</strong> {profileUser.email || "..."}</div>
                  <div><strong>Country:</strong> {profileUser.country || "..."}</div>
                  <div><strong>City:</strong> {profileUser.city || "..."}</div>
                  <div><strong>Rating:</strong> {profileUser.rating || 0}</div>
                </div>
              </div>
              {authUser && authUser.username !== profileUser.username && (
                <div className="profile-action-col">
                  {isAdminViewingProfile ? (
                    <>
                      <button className="btn-warn-user" onClick={() => setWarnModalOpen(true)}>
                        Warn
                      </button>
                      <button className="btn-block-user" onClick={() => {
                        if (!window.confirm(`Are you sure you want to block user "${profileUser.username}"? This will restrict their access to the website.`)) {
                          return;
                        }
                        // TODO: Implement backend endpoint for blocking users
                        alert(`User ${profileUser.username} has been blocked. (Backend implementation pending)`);
                      }}>
                        Block
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-chat-user" onClick={() => handleChatWithUser(profileUser.username)}>
                        Chat
                      </button>
                      <button className="btn-report-user" onClick={() => setReportModalOpen(true)}>
                        Report User
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <ItemTabs
              offeredCount={profileOfferedItems.length}
              wantedCount={profileWantedItems.length}
              ratingsCount={profileRatings.length}
              renderAddButton={() => null} // No add buttons when viewing other users
              renderContent={(activeTab) => {
                if (activeTab === "offered") return (
                  <div className="items-list">
                    {profileOfferedItems.length === 0 ? (
                      <div className="empty-note">No offered items yet.</div>
                    ) : (
                      profileOfferedItems.map(it => (
                        <OfferedItemCard 
                          key={it.offeredItemId} 
                          item={it} 
                          isOwnProfile={false} 
                          source="search"
                          onRequest={isAdminViewingProfile ? undefined : setRequestTarget}
                          onDelete={isAdminViewingProfile ? async (itemToDelete) => {
                            if (!window.confirm(`Are you sure you want to delete "${itemToDelete.title || itemToDelete.name}"?`)) {
                              return;
                            }
                            try {
                              const itemId = itemToDelete.offeredItemId || itemToDelete.id;
                              await axios.delete(`/offer-items/${itemId}`);
                              alert("Item deleted successfully");
                              // Refresh profile data
                              const offeredRes = await axios.get(`/offer-items/user-item/${profileUser.username}`);
                              const offeredItemsRaw = offeredRes.data || [];
                              const transformedOfferedItems = offeredItemsRaw.map(item => {
                                if (item.offeredItem) {
                                  return {
                                    ...item.offeredItem,
                                    images: item.images || []
                                  };
                                }
                                return item;
                              });
                              setProfileOfferedItems(transformedOfferedItems);
                            } catch (err) {
                              console.error("Error deleting item:", err);
                              alert("Failed to delete item: " + (err.response?.data || err.message));
                            }
                          } : undefined}
                        />
                      ))
                    )}
                  </div>
                );
                if (activeTab === "wanted") return (
                  <div className="items-list">
                    {profileWantedItems.length === 0 ? (
                      <div className="empty-note">No wanted items yet.</div>
                    ) : (
                      profileWantedItems.map(it => (
                        <WantedItemCard 
                          key={it.wantedItemId} 
                          item={it} 
                          isOwn={false}
                          isAdmin={isAdminViewingProfile}
                          onDelete={isAdminViewingProfile ? async () => {
                            if (!window.confirm(`Are you sure you want to delete "${it.title || it.name}"?`)) {
                              return;
                            }
                            try {
                              await axios.delete(`/wanted-items/${it.wantedItemId}`);
                              alert("Item deleted successfully");
                              // Refresh profile data
                              const wantedRes = await axios.get(`/wanted-items/user-item/${profileUser.username}`);
                              setProfileWantedItems(wantedRes.data || []);
                            } catch (err) {
                              console.error("Error deleting item:", err);
                              alert("Failed to delete item: " + (err.response?.data || err.message));
                            }
                          } : undefined}
                        />
                      ))
                    )}
                  </div>
                );
                if (activeTab === "ratings") return (
                  <div className="items-list">
                    {authUser && authUser.username !== profileUser.username && !isAdminViewingProfile && (
                      <div style={{ marginBottom: '20px' }}>
                        <button className="btn-add-item" onClick={() => setRatingModalOpen(true)}>
                          + Give a Review
                        </button>
                      </div>
                    )}
                    {profileRatings.length === 0 ? (
                      <div className="empty-note">No ratings yet.</div>
                    ) : (
                      profileRatings.map(r => (
                        <RatingCard 
                          key={r.ratingId} 
                          rating={r} 
                          currentUsername={authUser?.username}
                          isAdmin={isAdminViewingProfile}
                          onDelete={async (ratingId) => {
                            if (!authUser?.username) {
                              alert("You must be logged in to delete reviews");
                              return;
                            }
                            try {
                              await axios.delete(`/ratings/${ratingId}`, {
                                params: { username: authUser.username }
                              });
                              
                              // Refresh profile data to show updated ratings and rating
                              const [userRes, ratingsRes] = await Promise.all([
                                axios.get(`/users/${profileUser.username}`),
                                axios.get(`/ratings/user/${profileUser.username}`)
                              ]);
                              
                              const userData = userRes.data;
                              setProfileUser({
                                ...profileUser,
                                rating: userData.rating || profileUser.rating
                              });
                              setProfileRatings(ratingsRes.data || []);
                              
                              alert("Review deleted successfully");
                            } catch (err) {
                              console.error("Error deleting rating:", err);
                              const errorMsg = err.response?.data || err.message || "Failed to delete review";
                              alert("Failed to delete review: " + errorMsg);
                            }
                          }}
                        />
                      ))
                    )}
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div className="profile-page-root">
            <div className="empty-note">Failed to load profile.</div>
          </div>
        )}

        {/* Request Card Modal */}
        <RequestCard
          open={Boolean(requestTarget)}
          onClose={() => setRequestTarget(null)}
          targetItem={getFormattedTargetItem(requestTarget)}
          myItems={myOfferedItems}
          myTokens={userWallet ? userWallet.tokensAvailable : (authUser?.tokens || 0)}
          loadingMyItems={loadingMyItems}
          onConfirm={async (payload) => {
            try {
              if (!authUser?.username || !requestTarget) {
                alert("Missing user or item information");
                return;
              }

              // Get the receiver username from the target item
              const receiverUsername = requestTarget.user?.username || requestTarget.username;
              if (!receiverUsername) {
                alert("Cannot determine item owner");
                return;
              }

              // Validate that an item is selected if method includes items
              if (payload.method !== "Tokens" && (!payload.selectedItemIds || payload.selectedItemIds.length === 0)) {
                alert("Please select an item to offer");
                return;
              }

              const tokensToOffer = Number(payload.tokensOffered || 0);
              // No token validation - users can offer any amount of tokens in swaps

              // Build the swap request payload using the new DTO format
              // Handle three cases: Item only, Tokens only, Item + Tokens
              const swapPayload = {
                senderUsername: authUser.username,
                receiverUsername: receiverUsername,
                offeredItemId: payload.method !== "Tokens" && payload.selectedItemIds && payload.selectedItemIds.length > 0 
                  ? payload.selectedItemIds[0] 
                  : null, // null for token-only swaps
                requestedItemId: requestTarget.offeredItemId || requestTarget.id,
                tokens: tokensToOffer
              };

              // Validate: Must offer either item or tokens (or both)
              if (!swapPayload.offeredItemId && tokensToOffer <= 0) {
                alert("Please select an item to offer or enter tokens to offer (or both).");
                return;
              }

              // Send the swap request
              const response = await axios.post("/swaps", swapPayload);
              
              alert("Swap request sent successfully!");
              setRequestTarget(null);
            } catch (err) {
              console.error("Error sending swap request:", err);
              const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to send swap request";
              alert("Error: " + errorMsg);
            }
          }}
        />

        {/* Report Modal (for non-admin users) */}
        {reportModalOpen && !isAdminViewingProfile && (
          <Modal onClose={() => {
            setReportModalOpen(false);
            setReportForm({ reason: "" });
          }} title="Report User">
            <div style={{ marginBottom: '16px' }}>
              <label>Reason for Reporting</label>
              <textarea
                name="reason"
                placeholder="Please provide a reason for reporting this user..."
                value={reportForm.reason}
                onChange={(e) => setReportForm({ reason: e.target.value })}
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={async () => {
                if (!reportForm.reason.trim()) {
                  alert("Please provide a reason for reporting");
                  return;
                }
                if (!authUser?.username || !profileUser?.username) {
                  alert("User information not available");
                  return;
                }

                setSubmittingReport(true);
                try {
                  await axios.post("/reports", {
                    reporter: { username: authUser.username },
                    reported: { username: profileUser.username },
                    reason: reportForm.reason.trim(),
                    status: "Pending"
                  });
                  alert("Report submitted successfully");
                  setReportModalOpen(false);
                  setReportForm({ reason: "" });
                } catch (err) {
                  console.error("Error submitting report:", err);
                  alert("Failed to submit report: " + (err.response?.data || err.message));
                } finally {
                  setSubmittingReport(false);
                }
              }}
              disabled={submittingReport}
            >
              {submittingReport ? "Submitting..." : "Submit Report"}
            </button>
          </Modal>
        )}

        {/* Warn Modal (for admin) */}
        {warnModalOpen && isAdminViewingProfile && (
          <Modal onClose={() => {
            setWarnModalOpen(false);
            setWarnForm({ reason: "" });
          }} title="Warn User">
            <div style={{ marginBottom: '16px' }}>
              <label>Warning Reason</label>
              <textarea
                name="reason"
                placeholder="Please provide a reason for warning this user..."
                value={warnForm.reason}
                onChange={(e) => setWarnForm({ reason: e.target.value })}
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setWarnModalOpen(false);
                  setWarnForm({ reason: "" });
                }}
                style={{
                  padding: '10px 20px',
                  background: '#777',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!warnForm.reason.trim()) {
                    alert("Please provide a warning reason");
                    return;
                  }
                  if (!authUser?.username || !profileUser?.username) {
                    alert("User information not available");
                    return;
                  }

                  setSubmittingWarn(true);
                  try {
                    // TODO: Implement backend endpoint for warning users
                    // await axios.post(`/admin/warn/${profileUser.username}`, { reason: warnForm.reason.trim() });
                    alert(`Warning sent to ${profileUser.username}: ${warnForm.reason.trim()}`);
                    setWarnModalOpen(false);
                    setWarnForm({ reason: "" });
                  } catch (err) {
                    console.error("Error sending warning:", err);
                    alert("Failed to send warning: " + (err.response?.data || err.message));
                  } finally {
                    setSubmittingWarn(false);
                  }
                }}
                disabled={submittingWarn}
                style={{
                  padding: '10px 20px',
                  background: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {submittingWarn ? "Sending..." : "Send Warning"}
              </button>
            </div>
          </Modal>
        )}

        {/* Rating Modal */}
        {ratingModalOpen && (
          <Modal onClose={() => {
            setRatingModalOpen(false);
            setRatingForm({ score: 0, review: "" });
          }} title="Give a Review">
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                Rate your experience
              </label>
              <InteractiveStarRating
                score={ratingForm.score}
                onScoreChange={(newScore) => setRatingForm({ ...ratingForm, score: newScore })}
              />
              <div style={{ 
                textAlign: 'center', 
                fontSize: '14px', 
                color: '#ffffff', 
                opacity: 0.8, 
                marginTop: '12px',
                fontWeight: '500'
              }}>
                {ratingForm.score === 0 ? 'Tap a star to rate' : 
                 ratingForm.score === 1 ? 'Poor' :
                 ratingForm.score === 2 ? 'Fair' :
                 ratingForm.score === 3 ? 'Good' :
                 ratingForm.score === 4 ? 'Very Good' :
                 'Excellent'}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>Review Message</label>
              <textarea
                name="review"
                placeholder="Write your review here..."
                value={ratingForm.review}
                onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={async () => {
                if (ratingForm.score === 0) {
                  alert("Please select a rating");
                  return;
                }
                if (!ratingForm.review.trim()) {
                  alert("Please write a review message");
                  return;
                }
                if (!authUser?.username || !profileUser?.username) {
                  alert("User information not available");
                  return;
                }

                setSubmittingRating(true);
                try {
                  await axios.post("/ratings", {
                    rater: { username: authUser.username },
                    ratedUser: { username: profileUser.username },
                    score: ratingForm.score,
                    review: ratingForm.review.trim()
                  });
                  
                  // Refresh profile data to show new rating
                  const [userRes, ratingsRes] = await Promise.all([
                    axios.get(`/users/${profileUser.username}`),
                    axios.get(`/ratings/user/${profileUser.username}`)
                  ]);
                  
                  const userData = userRes.data;
                  setProfileUser({
                    ...profileUser,
                    rating: userData.rating || profileUser.rating
                  });
                  setProfileRatings(ratingsRes.data || []);
                  
                  alert("Review submitted successfully");
                  setRatingModalOpen(false);
                  setRatingForm({ score: 0, review: "" });
                } catch (err) {
                  console.error("Error submitting rating:", err);
                  alert("Failed to submit review: " + (err.response?.data || err.message));
                } finally {
                  setSubmittingRating(false);
                }
              }}
              disabled={submittingRating}
            >
              {submittingRating ? "Submitting..." : "Submit Review"}
            </button>
          </Modal>
        )}
      </div>
    );
  }

  // Normal search view
  const currentResults = searchType === "users" ? userResults : itemResults;
  const hasResults = currentResults.length > 0;
  const showNoResults = !loading && searchTerm.trim() && !hasResults && !error;

  return (
    <div className="search-wrapper">
      <h2 className="search-title">Search</h2>

      {/* Search Type Toggle */}
      <div className="search-type-toggle">
        <button
          className={`search-type-btn ${searchType === "items" ? "active" : ""}`}
          onClick={() => handleSearchTypeChange("items")}
        >
          Items
        </button>
        <button
          className={`search-type-btn ${searchType === "users" ? "active" : ""}`}
          onClick={() => handleSearchTypeChange("users")}
        >
          Users
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          className="search-input"
          type="text"
          placeholder={searchType === "users" ? "Search by username or name..." : "Search by item name, description, or category..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              performSearch();
            }
          }}
        />
        <button className="search-btn" onClick={performSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="search-error">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="search-loading">
          Searching...
        </div>
      )}

      {/* Results */}
      <div className="results-container">
        {showNoResults && (
          <p className="no-results">
            No {searchType === "users" ? "users" : "items"} found matching "{searchTerm}"
          </p>
        )}

        {!loading && hasResults && searchType === "users" && (
          <div className="users-results-grid">
            {userResults.map((user) => (
              <UserCard key={user.username} user={user} onViewProfile={handleViewProfile} />
            ))}
              </div>
        )}

        {!loading && hasResults && searchType === "items" && (
          <div className="items-results-list">
            {itemResults.map((item) => (
              <div key={item.offeredItemId} className="search-result-card">
            <OfferedItemCard
              item={item}
                source="search"
              isOwnProfile={false}
                onRequest={authUser?.role === "ADMIN" ? undefined : setRequestTarget}
                onDelete={authUser?.role === "ADMIN" ? async (itemToDelete) => {
                  if (!window.confirm(`Are you sure you want to delete "${itemToDelete.title || itemToDelete.name}"?`)) {
                    return;
                  }
                  try {
                    const itemId = itemToDelete.offeredItemId || itemToDelete.id;
                    await axios.delete(`/offer-items/${itemId}`);
                    alert("Item deleted successfully");
                    // Refresh search results
                    performSearch();
                  } catch (err) {
                    console.error("Error deleting item:", err);
                    alert("Failed to delete item: " + (err.response?.data || err.message));
                  }
                } : undefined}
              />
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Card Modal */}
      <RequestCard
        open={Boolean(requestTarget)}
        onClose={() => setRequestTarget(null)}
        targetItem={getFormattedTargetItem(requestTarget)}
        myItems={myOfferedItems}
        myTokens={userWallet ? userWallet.tokensAvailable : (authUser?.tokens || 0)}
        loadingMyItems={loadingMyItems}
        onConfirm={async (payload) => {
          try {
            if (!authUser?.username || !requestTarget) {
              alert("Missing user or item information");
              return;
            }

            // Get the receiver username from the target item
            const receiverUsername = requestTarget.user?.username || requestTarget.username;
            if (!receiverUsername) {
              alert("Cannot determine item owner");
              return;
            }

            // Validate that an item is selected if method includes items
            if (payload.method !== "Tokens" && (!payload.selectedItemIds || payload.selectedItemIds.length === 0)) {
              alert("Please select an item to offer");
              return;
            }

            const tokensToOffer = Number(payload.tokensOffered || 0);

            // Validate token availability on frontend
            if (tokensToOffer > 0) {
              // Fetch latest wallet info to ensure we have current data
              const walletRes = await axios.get(`/wallet/${authUser.username}`);
              const wallet = walletRes.data;
              const availableTokens = wallet.tokensAvailable || 0;
              
              if (availableTokens < tokensToOffer) {
                alert(`Not enough tokens available. You have ${availableTokens} tokens available, but trying to offer ${tokensToOffer} tokens.`);
                return;
              }
            }

            // Build the swap request payload using the new DTO format
            // Handle three cases: Item only, Tokens only, Item + Tokens
            const swapPayload = {
              senderUsername: authUser.username,
              receiverUsername: receiverUsername,
              offeredItemId: payload.method !== "Tokens" && payload.selectedItemIds && payload.selectedItemIds.length > 0 
                ? payload.selectedItemIds[0] 
                : null, // null for token-only swaps
              requestedItemId: requestTarget.offeredItemId || requestTarget.id,
              tokens: tokensToOffer
            };

            // Validate: Must offer either item or tokens (or both)
            if (!swapPayload.offeredItemId && tokensToOffer <= 0) {
              alert("Please select an item to offer or enter tokens to offer (or both).");
              return;
            }

            // Send the swap request
            const response = await axios.post("/swaps", swapPayload);
            
            alert("Swap request sent successfully!");
            setRequestTarget(null);
          } catch (err) {
            console.error("Error sending swap request:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Failed to send swap request";
            alert("Error: " + errorMsg);
          }
        }}
      />
    </div>
  );
}
