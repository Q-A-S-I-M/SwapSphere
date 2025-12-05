import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import ItemTabs from "../components/ItemTabs";
import OfferedItemCard from "../components/OfferedItemCard";
import WantedItemCard from "../components/WantedItemCard";
import RatingCard from "../components/RatingCard";
import Modal from "../components/Modal"; // simple reusable Modal
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  validateEmail,
  validateContact,
  validateFullName,
  validateCountry,
  validateCity,
  filterContact,
  filterFullName,
  filterCountry,
  filterCity
} from "../utils/validation";

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

export default function ProfilePage() {
  const { username: urlUsername } = useParams();
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Determine which username to display: URL param (viewing other user) or logged-in user (own profile)
  const targetUsername = urlUsername || authUser?.username;
  const isOwnProfile = !urlUsername || urlUsername === authUser?.username;
  const isAdmin = authUser?.role === "ADMIN";
  const isAdminViewingOther = isAdmin && !isOwnProfile;
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [offeredItems, setOfferedItems] = useState([]);
  const [wantedItems, setWantedItems] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [addOfferedModal, setAddOfferedModal] = useState(false);
  const [addWantedModal, setAddWantedModal] = useState(false);
  
  // Admin controls
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [warnReason, setWarnReason] = useState("");
  
  // Rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingForm, setRatingForm] = useState({ score: 0, review: "" });
  const [submittingRating, setSubmittingRating] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    contact: "",
    country: "",
    city: "",
    profilePicFile: null,
    locLat: null,
    locLong: null,
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  
  // Profile form validation errors
  const [profileFieldErrors, setProfileFieldErrors] = useState({
    fullName: "",
    email: "",
    contact: "",
    country: "",
    city: ""
  });

  // Offered Item form
  const [offeredForm, setOfferedForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    priority: 0,
    status: "AVAILABLE",
    images: [],
    imagePreviews: [],
  });

  // Wanted Item form
  const [wantedForm, setWantedForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  // Fetch user, items, ratings
  useEffect(() => {
    if (!targetUsername) return;

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`/users/${targetUsername}`);
        if (!isMounted) return;

        const userData = res.data;
        console.log("Backend User Data:", userData); // Debug: see what backend sends
        
        // Backend returns: username, fullName, email, contact, role, rating, createdAt, locLat, locLong, country, city, profilePicUrl
        // Properly unpack all fields from backend response
        const profilePicUrl = userData.profilePicUrl || null;

        // Store user data exactly as backend sends it
        setUser({
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
          profilePicUrl: profilePicUrl,
        });
        
        // Initialize form with backend data
        setProfileForm({
          fullName: userData.fullName || "",
          email: userData.email || "",
          contact: userData.contact || "",
          country: userData.country || "",
          city: userData.city || "",
          profilePicFile: null,
          locLat: userData.locLat || null,
          locLong: userData.locLong || null,
        });
        setProfilePicPreview(profilePicUrl);

        const [offeredRes, wantedRes, ratingsRes] = await Promise.all([
          axios.get(`/offer-items/user-item/${targetUsername}`),
          axios.get(`/wanted-items/user-item/${targetUsername}`),
          axios.get(`/ratings/user/${targetUsername}`),
        ]);
        if (!isMounted) return;

        // Transform OfferedItemWithImages from backend: { offeredItem: {...}, images: [...] }
        // to flat structure expected by frontend: { ...offeredItem, images: [...] }
        const offeredItemsRaw = offeredRes.data || [];
        console.log("Backend Offered Items (raw):", offeredItemsRaw); // Debug
        
        const transformedOfferedItems = offeredItemsRaw.map(item => {
          if (item.offeredItem) {
            // Backend returns nested structure
            return {
              ...item.offeredItem,
              images: item.images || []
            };
          }
          // Already flat or different structure
          return item;
        });
        console.log("Transformed Offered Items:", transformedOfferedItems); // Debug
        
        setOfferedItems(transformedOfferedItems);
        
        const wantedItemsRaw = wantedRes.data || [];
        console.log("Backend Wanted Items:", wantedItemsRaw); // Debug
        setWantedItems(wantedItemsRaw);
        
        const ratingsRaw = ratingsRes.data || [];
        console.log("Backend Ratings:", ratingsRaw); // Debug
        setRatings(ratingsRaw);
      } catch (err) {
        console.error("Error fetching profile data", err);
        alert("Failed to load profile data");
      }
    };

    fetchUserData();

    return () => { 
      isMounted = false; 
    };
  }, [authUser]);

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    let validation = { isValid: true, error: "" };
    
    // Apply filtering and validation based on field type
    switch (name) {
      case "fullName":
        filteredValue = filterFullName(value);
        validation = validateFullName(filteredValue);
        break;
      case "email":
        validation = validateEmail(value);
        break;
      case "contact":
        filteredValue = filterContact(value);
        validation = validateContact(filteredValue);
        break;
      case "country":
        filteredValue = filterCountry(value);
        validation = validateCountry(filteredValue);
        break;
      case "city":
        filteredValue = filterCity(value);
        validation = validateCity(filteredValue);
        break;
      default:
        filteredValue = value;
    }
    
    setProfileForm(prev => ({ ...prev, [name]: filteredValue }));
    setProfileFieldErrors(prev => ({ ...prev, [name]: validation.error }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
    
    setProfileForm(prev => ({ ...prev, profilePicFile: file }));
    const previewURL = URL.createObjectURL(file);
    setProfilePicPreview(previewURL);
  };
  
  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    // Reset form to original user data from backend
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        contact: user.contact || "",
        country: user.country || "",
        city: user.city || "",
        profilePicFile: null,
        locLat: user.locLat !== undefined ? user.locLat : null,
        locLong: user.locLong !== undefined ? user.locLong : null,
      });
      setProfilePicPreview(user.profilePicUrl || null);
      setProfileFieldErrors({
        fullName: "",
        email: "",
        contact: "",
        country: "",
        city: ""
      });
    }
  };
  
  // Initialize profile form when opening modal
  const handleOpenProfileModal = () => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        contact: user.contact || "",
        country: user.country || "",
        city: user.city || "",
        profilePicFile: null,
        locLat: user.locLat !== undefined ? user.locLat : null,
        locLong: user.locLong !== undefined ? user.locLong : null,
      });
      setProfilePicPreview(user.profilePicUrl || null);
    }
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.username) {
        alert("User not found");
        return;
      }

      // Validate all fields
      const fullNameValidation = validateFullName(profileForm.fullName);
      const emailValidation = validateEmail(profileForm.email);
      const contactValidation = validateContact(profileForm.contact);
      const countryValidation = validateCountry(profileForm.country);
      const cityValidation = validateCity(profileForm.city);
      
      const newFieldErrors = {
        fullName: fullNameValidation.error,
        email: emailValidation.error,
        contact: contactValidation.error,
        country: countryValidation.error,
        city: cityValidation.error
      };
      
      setProfileFieldErrors(newFieldErrors);
      
      if (!fullNameValidation.isValid || !emailValidation.isValid || 
          !contactValidation.isValid || !countryValidation.isValid || 
          !cityValidation.isValid) {
        alert("Please fix the errors in the form.");
        return;
      }

      // Handle profile picture upload first (separate from user update)
      let newProfilePicUrl = user.profilePicUrl || null;
      
      if (profileForm.profilePicFile) {
        try {
          const formData = new FormData();
          formData.append("file", profileForm.profilePicFile);
          formData.append("username", user.username);
          const res = await axios.put("/api/images/upload-profile-pic", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          newProfilePicUrl = res.data; // Backend returns the URL string directly
        } catch (uploadErr) {
          console.error("Error uploading profile picture:", uploadErr);
          alert("Failed to upload profile picture. Profile will be updated without picture change.");
        }
      }

      // Keep existing location values if form doesn't have them
      let locLat = profileForm.locLat !== null && profileForm.locLat !== undefined ? profileForm.locLat : user.locLat;
      let locLong = profileForm.locLong !== null && profileForm.locLong !== undefined ? profileForm.locLong : user.locLong;

      // Fetch current user data from backend to get all required fields (including password)
      // This ensures we have all required fields for the update
      const currentUserRes = await axios.get(`/users/${user.username}`);
      const currentUserData = currentUserRes.data;

      // Backend updateUser requires all User entity fields (even if not updating them)
      // Include existing user data for fields that aren't being updated
      const updatedUserPayload = {
        username: user.username, // Required field
        fullName: profileForm.fullName || currentUserData.fullName,
        email: profileForm.email || currentUserData.email,
        password: currentUserData.password || "", // Required field - use existing password from backend
        contact: profileForm.contact || currentUserData.contact,
        role: currentUserData.role || "USER", // Required field
        rating: currentUserData.rating || 0, // Required field
        createdAt: currentUserData.createdAt || null, // Required field
        country: profileForm.country !== undefined ? (profileForm.country || null) : (currentUserData.country || null),
        city: profileForm.city !== undefined ? (profileForm.city || null) : (currentUserData.city || null),
        locLat: locLat !== null && locLat !== undefined ? locLat : (currentUserData.locLat || null),
        locLong: locLong !== null && locLong !== undefined ? locLong : (currentUserData.locLong || null),
        profilePicUrl: newProfilePicUrl || currentUserData.profilePicUrl || null,
      };
      console.log("Updated User Payload:", updatedUserPayload);
      await axios.put(`/users/${user.username}`, updatedUserPayload);
      
      // Refresh user data from backend to get all fields including potentially updated profilePicUrl
      const userRes = await axios.get(`/users/${user.username}`);
      const refreshedUserData = userRes.data;
      
      // Store user data exactly as backend sends it
      const refreshedUser = {
        username: refreshedUserData.username || "",
        fullName: refreshedUserData.fullName || "",
        email: refreshedUserData.email || "",
        contact: refreshedUserData.contact || "",
        role: refreshedUserData.role || "",
        rating: refreshedUserData.rating || 0,
        createdAt: refreshedUserData.createdAt || null,
        locLat: refreshedUserData.locLat || null,
        locLong: refreshedUserData.locLong || null,
        country: refreshedUserData.country || "",
        city: refreshedUserData.city || "",
        profilePicUrl: newProfilePicUrl || refreshedUserData.profilePicUrl || null,
      };
      
      setUser(refreshedUser);
      updateUser(refreshedUser);
      setProfileModalOpen(false);
      setProfilePicPreview(refreshedUser.profilePicUrl);
      
      // Reset form with refreshed data
      setProfileForm({
        fullName: refreshedUser.fullName || "",
        email: refreshedUser.email || "",
        contact: refreshedUser.contact || "",
        country: refreshedUser.country || "",
        city: refreshedUser.city || "",
        profilePicFile: null,
        locLat: refreshedUser.locLat || null,
        locLong: refreshedUser.locLong || null,
      });
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile: " + (err.response?.data?.message || err.message));
    }
  };

  // Offered item handlers
  const handleOfferedImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setOfferedForm(prev => ({
      ...prev,
      images: files,
      imagePreviews: files.map(f => URL.createObjectURL(f))
    }));
  };

  const handleAddOfferedItem = async () => {
    try {
      if (!offeredForm.title || !offeredForm.category) {
        alert("Please fill in required fields (Title, Category)");
        return;
      }

      const itemPayload = {
        user: {
          username: user.username,
        },
        title: offeredForm.title,
        description: offeredForm.description || "",
        category: offeredForm.category,
        condition: offeredForm.condition || "Good",
        priority: 0,
        status: "AVAILABLE"
      };
      const res = await axios.post("/offer-items", itemPayload);
      const newItem = res.data;

      // Upload images if any
      if (offeredForm.images && offeredForm.images.length > 0) {
        for (let img of offeredForm.images) {
          try {
            const formData = new FormData();
            formData.append("file", img);
            formData.append("id", newItem.offeredItemId);
            await axios.post("/api/images/upload", formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (uploadErr) {
            console.error("Error uploading image:", uploadErr);
          }
        }
      }

      // Refresh items to get the new item with images
      const refreshedRes = await axios.get(`/offer-items/user-item/${targetUsername}`);
      const refreshedOfferedItemsRaw = refreshedRes.data || [];
      // Transform nested structure to flat structure
      const refreshedOfferedItems = refreshedOfferedItemsRaw.map(item => {
        if (item.offeredItem) {
          return {
            ...item.offeredItem,
            images: item.images || []
          };
        }
        return item;
      });
      setOfferedItems(refreshedOfferedItems);
      
      setAddOfferedModal(false);
      setOfferedForm({
        title: "",
        description: "",
        category: "",
        condition: "",
        priority: 0,
        status: "AVAILABLE",
        images: [],
        imagePreviews: [],
      });
      
      alert("Offered item added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding offered item: " + (err.response?.data?.message || err.message));
    }
  };

  // Wanted item handlers
  const handleAddWantedItem = async () => {
    try {
      if (!wantedForm.title || !wantedForm.category) {
        alert("Please fill in required fields (Title, Category)");
        return;
      }

      const payload = { 
        ...wantedForm, 
        user: { username: user.username }
      };
      await axios.post("/wanted-items", payload);
      
      // Refresh items
      const refreshedRes = await axios.get(`/wanted-items/user-item/${targetUsername}`);
      setWantedItems(refreshedRes.data || []);
      
      setAddWantedModal(false);
      setWantedForm({ title: "", description: "", category: ""});
      
      alert("Wanted item added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding wanted item: " + (err.response?.data?.message || err.message));
    }
  };
  
  const handleCloseOfferedModal = () => {
    setAddOfferedModal(false);
    setOfferedForm({
      title: "",
      description: "",
      category: "",
      condition: "",
      priority: 0,
      status: "AVAILABLE",
      images: [],
      imagePreviews: [],
    });
  };
  
  const handleCloseWantedModal = () => {
    setAddWantedModal(false);
    setWantedForm({ title: "", description: "", category: ""});
  };

  const deleteOffered = async (id) => {
    if (!window.confirm("Delete this offered item?")) return;
    await axios.delete(`/offer-items/${id}`);
    setOfferedItems(prev => prev.filter(it => it.offeredItemId !== id));
  };

  const deleteWanted = async (id) => {
    if (!window.confirm("Delete this wanted item?")) return;
    await axios.delete(`/wanted-items/${id}`);
    setWantedItems(prev => prev.filter(it => it.wantedItemId !== id));
  };

  const handleChatWithUser = (username) => {
    if (!username || !authUser || username === authUser.username) return;
    navigate(`/chat?user=${username}`);
  };
  /*const handleChatWithUser = (username) => {
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
  }*/

  if (!user) {
    return (
      <div className="profile-page-root">
        <div className="empty-note">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page-root">
      {/* Header */}
      <div className="profile-header-panel">
        <div className="profile-header-left">
          <div className="avatar-large">
            {user?.profilePicUrl ? (
              <img src={user.profilePicUrl} alt="avatar" />
            ) : (
              <div className="avatar-fallback">{user?.username?.charAt(0).toUpperCase() || "U"}</div>
            )}
          </div>
        </div>
        <div className="profile-header-right">
          <div className="profile-meta-vertical">
            <div><strong>Username:</strong> {user?.username || "..."}</div>
            <div><strong>Full Name:</strong> {user?.fullName || "..."}</div>
            <div><strong>Contact:</strong> {user?.contact || "..."}</div>
            <div><strong>Email:</strong> {user?.email || "..."}</div>
            <div><strong>Country:</strong> {user?.country || "..."}</div>
            <div><strong>City:</strong> {user?.city || "..."}</div>
            <div><strong>Rating:</strong> {user?.rating || 0}</div>
          </div>
        </div>
        {isOwnProfile && (
          <div className="profile-action-col">
            <button className="btn-edit-profile" onClick={handleOpenProfileModal}>Edit Profile</button>
          </div>
        )}
        {isAdminViewingOther && (
          <div className="profile-action-col">
            <button className="btn-warn-user" onClick={() => setWarnModalOpen(true)}>Warn</button>
            <button className="btn-block-user" onClick={async () => {
              if (!window.confirm(`Are you sure you want to block user "${targetUsername}"? This will restrict their access to the website.`)) {
                return;
              }
              try {
                // TODO: Implement backend endpoint for blocking users
                // await axios.post(`/admin/block/${targetUsername}`);
                alert(`User ${targetUsername} has been blocked. (Backend implementation pending)`);
              } catch (err) {
                console.error("Error blocking user:", err);
                alert("Failed to block user: " + (err.response?.data || err.message));
              }
            }}>Block</button>
          </div>
        )}
        {!isOwnProfile && !isAdminViewingOther && authUser && (
  <div className="profile-action-col">
    <button className="btn-chat-user" onClick={() => handleChatWithUser(user.username)}>
      Chat
    </button>
    <button className="btn-report-user" onClick={() => {alert("Report functionality to be implemented");}}>
      Report User
    </button>
  </div>
)}
      </div>

      {/* Tabs */}
      <ItemTabs
        offeredCount={offeredItems.length}
        wantedCount={wantedItems.length}
        ratingsCount={ratings.length}
        renderAddButton={(activeTab) => {
          if (!isOwnProfile) return null;
          if (activeTab === "offered") return <button className="btn-add-item" onClick={() => setAddOfferedModal(true)}>+ Add Offered Item</button>;
          if (activeTab === "wanted") return <button className="btn-add-item" onClick={() => setAddWantedModal(true)}>+ Add Wanted Item</button>;
          return null;
        }}
        renderContent={(activeTab) => {
          if (activeTab === "offered") return (
            <div className="items-list">
              {offeredItems.length === 0 ? (
                <div className="empty-note">No offered items yet. Click "+ Add Offered Item" to add one.</div>
              ) : (
                offeredItems.map(it => (
                  <OfferedItemCard 
                    key={it.offeredItemId} 
                    item={it} 
                    isOwnProfile={isOwnProfile} 
                    onRequest={isAdminViewingOther ? undefined : undefined}
                    onDelete={(isOwnProfile || isAdminViewingOther) ? async () => {
                      if (!window.confirm(`Are you sure you want to delete "${it.title || it.name}"?`)) {
                        return;
                      }
                      await deleteOffered(it.offeredItemId);
                    } : undefined} 
                  />
                ))
              )}
            </div>
          );
          if (activeTab === "wanted") return (
            <div className="items-list">
              {wantedItems.length === 0 ? (
                <div className="empty-note">No wanted items yet. Click "+ Add Wanted Item" to add one.</div>
              ) : (
                wantedItems.map(it => (
                  <WantedItemCard 
                    key={it.wantedItemId} 
                    item={it} 
                    isOwn={isOwnProfile} 
                    isAdmin={isAdminViewingOther}
                    onDelete={(isOwnProfile || isAdminViewingOther) ? async () => {
                      if (!window.confirm(`Are you sure you want to delete "${it.title || it.name}"?`)) {
                        return;
                      }
                      await deleteWanted(it.wantedItemId);
                    } : undefined} 
                  />
                ))
              )}
            </div>
          );
          if (activeTab === "ratings") return (
            <div className="items-list">
              {!isOwnProfile && authUser && authUser.username !== targetUsername && (
                <div style={{ marginBottom: '20px' }}>
                  <button className="btn-add-item" onClick={() => setRatingModalOpen(true)}>
                    + Give a Review
                  </button>
                </div>
              )}
              {ratings.length === 0 ? (
                <div className="empty-note">No ratings yet.</div>
              ) : (
                ratings.map(r => (
                  <RatingCard 
                    key={r.ratingId} 
                    rating={r} 
                    currentUsername={authUser?.username}
                    isAdmin={isAdminViewingOther}
                    onDelete={(isOwnProfile || isAdminViewingOther) ? async (ratingId) => {
                      if (!authUser?.username) {
                        alert("You must be logged in to delete reviews");
                        return;
                      }
                      try {
                        await axios.delete(`/ratings/${ratingId}`, {
                          params: { username: authUser.username }
                        });
                        
                        // Refresh ratings and user data to show updated rating
                        const [ratingsRes, userRes] = await Promise.all([
                          axios.get(`/ratings/user/${targetUsername}`),
                          axios.get(`/users/${targetUsername}`)
                        ]);
                        
                        setRatings(ratingsRes.data || []);
                        
                        const userData = userRes.data;
                        setUser({
                          ...user,
                          rating: userData.rating || user.rating
                        });
                        
                        if (isOwnProfile) {
                          updateUser({
                            ...authUser,
                            rating: userData.rating || authUser.rating
                          });
                        }
                        
                        alert("Review deleted successfully");
                      } catch (err) {
                        console.error("Error deleting rating:", err);
                        const errorMsg = err.response?.data || err.message || "Failed to delete review";
                        alert("Failed to delete review: " + errorMsg);
                      }
                    } : undefined}
                  />
                ))
              )}
            </div>
          );
        }}
      />

      {/* Warn Modal */}
      {warnModalOpen && (
        <Modal onClose={() => {
          setWarnModalOpen(false);
          setWarnReason("");
        }} title="Warn User">
          <div>
            <label>Warning Reason *</label>
            <textarea
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              placeholder="Enter the reason for warning this user..."
              rows={5}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '8px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setWarnModalOpen(false);
                  setWarnReason("");
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
                  if (!warnReason.trim()) {
                    alert("Please enter a warning reason");
                    return;
                  }
                  try {
                    // TODO: Implement backend endpoint for warning users
                    // await axios.post(`/admin/warn/${targetUsername}`, { reason: warnReason });
                    await axios.post(`/notifications/warn/${targetUsername}`, { reason: warnReason });
                    alert(`Warning sent to ${targetUsername}: ${warnReason}`);
                    setWarnModalOpen(false);
                    setWarnReason("");
                  } catch (err) {
                    console.error("Error sending warning:", err);
                    alert("Failed to send warning: " + (err.response?.data || err.message));
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#b8860b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Send Warning
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <Modal onClose={handleCloseProfileModal} title="Edit Profile">
          <div>
            <label>Full Name *</label>
            <input 
              className={`profile-input-edit ${profileFieldErrors.fullName ? 'input-error' : ''}`}
              type="text" 
              name="fullName" 
              placeholder="Enter full name" 
              value={profileForm.fullName} 
              onChange={handleProfileChange}
              onBlur={(e) => {
                const validation = validateFullName(e.target.value);
                setProfileFieldErrors(prev => ({ ...prev, fullName: validation.error }));
              }}
            />
            {profileFieldErrors.fullName && <div className="field-error">{profileFieldErrors.fullName}</div>}
          </div>
          <div>
            <label>Email *</label>
            <input 
              className={`profile-input-edit ${profileFieldErrors.email ? 'input-error' : ''}`}
              type="text" 
              name="email" 
              placeholder="Enter email" 
              value={profileForm.email} 
              onChange={handleProfileChange}
              onBlur={(e) => {
                const validation = validateEmail(e.target.value);
                setProfileFieldErrors(prev => ({ ...prev, email: validation.error }));
              }}
            />
            {profileFieldErrors.email && <div className="field-error">{profileFieldErrors.email}</div>}
          </div>
          <div>
            <label>Contact *</label>
            <input 
              className={`profile-input-edit ${profileFieldErrors.contact ? 'input-error' : ''}`}
              type="text" 
              name="contact" 
              placeholder="Enter contact number" 
              value={profileForm.contact} 
              onChange={handleProfileChange}
              onBlur={(e) => {
                const validation = validateContact(e.target.value);
                setProfileFieldErrors(prev => ({ ...prev, contact: validation.error }));
              }}
            />
            {profileFieldErrors.contact && <div className="field-error">{profileFieldErrors.contact}</div>}
          </div>
          <div>
            <label>Country</label>
            <input 
              className={`profile-input-edit ${profileFieldErrors.country ? 'input-error' : ''}`}
              type="text" 
              name="country" 
              placeholder="Enter country" 
              value={profileForm.country} 
              onChange={handleProfileChange}
              onBlur={(e) => {
                const validation = validateCountry(e.target.value);
                setProfileFieldErrors(prev => ({ ...prev, country: validation.error }));
              }}
            />
            {profileFieldErrors.country && <div className="field-error">{profileFieldErrors.country}</div>}
          </div>
          <div>
            <label>City</label>
            <input 
              className={`profile-input-edit ${profileFieldErrors.city ? 'input-error' : ''}`}
              type="text" 
              name="city" 
              placeholder="Enter city" 
              value={profileForm.city} 
              onChange={handleProfileChange}
              onBlur={(e) => {
                const validation = validateCity(e.target.value);
                setProfileFieldErrors(prev => ({ ...prev, city: validation.error }));
              }}
            />
            {profileFieldErrors.city && <div className="field-error">{profileFieldErrors.city}</div>}
          </div>
          <div>
            <label>Profile Picture</label>
            <input className="profile-input-edit" type="file" accept="image/*" onChange={handleProfilePicChange} />
            {profilePicPreview && (
              <div style={{ marginTop: '12px' }}>
                <img src={profilePicPreview} alt="Preview" className="profile-pic-preview" />
              </div>
            )}
          </div>
          <button className="btn-confirm-profile" onClick={handleSaveProfile}>Save Profile</button>
        </Modal>
      )}

      {/* Add Offered Item Modal */}
      {addOfferedModal && (
        <Modal onClose={handleCloseOfferedModal} title="Add Offered Item">
          <div>
            <label>Title *</label>
            <input className="profile-input-edit" placeholder="Enter item title" value={offeredForm.title} onChange={(e) => setOfferedForm({...offeredForm, title: e.target.value})} />
          </div>
          <div>
            <label>Description</label>
            <textarea className="profile-input-edit" placeholder="Enter item description" value={offeredForm.description} onChange={(e) => setOfferedForm({...offeredForm, description: e.target.value})} rows="3" style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label>Category *</label>
            <input className="profile-input-edit" placeholder="Enter category" value={offeredForm.category} onChange={(e) => setOfferedForm({...offeredForm, category: e.target.value})} />
          </div>
          <div>
            <label>Condition</label>
            <input className="profile-input-edit" placeholder="e.g., New, Good, Fair" value={offeredForm.condition} onChange={(e) => setOfferedForm({...offeredForm, condition: e.target.value})} />
          </div>
          {/* <div>
            <label>Priority</label>
            <input className="profile-input-edit" type="number" placeholder="Enter priority (0-10)" value={offeredForm.priority} min="0" max="10" onChange={(e) => setOfferedForm({...offeredForm, priority: Number(e.target.value)})} />
          </div> */}
          <div>
            <label>Images (up to 10)</label>
            <input className="profile-input-edit" type="file" multiple accept="image/*" onChange={handleOfferedImageChange} />
            {offeredForm.imagePreviews.length > 0 && (
              <div className="offered-images-thumbnails" style={{ marginTop: '12px' }}>
                {offeredForm.imagePreviews.map((src, idx) => <img key={idx} src={src} alt="preview" />)}
              </div>
            )}
          </div>
          <button className="btn-confirm-profile" onClick={handleAddOfferedItem}>Add Offered Item</button>
        </Modal>
      )}

      {/* Add Wanted Item Modal */}
      {addWantedModal && (
        <Modal onClose={handleCloseWantedModal} title="Add Wanted Item">
          <div>
            <label>Title *</label>
            <input className="profile-input-edit" placeholder="Enter item title" value={wantedForm.title} onChange={(e) => setWantedForm({...wantedForm, title: e.target.value})} />
          </div>
          <div>
            <label>Description</label>
            <textarea className="profile-input-edit" placeholder="Enter item description" value={wantedForm.description} onChange={(e) => setWantedForm({...wantedForm, description: e.target.value})} rows="3" style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label>Category *</label>
            <input className="profile-input-edit" placeholder="Enter category" value={wantedForm.category} onChange={(e) => setWantedForm({...wantedForm, category: e.target.value})} />
          </div>
          <button className="btn-confirm-profile" onClick={handleAddWantedItem}>Add Wanted Item</button>
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>Review Message</label>
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
            className="btn-confirm-profile"
            onClick={async () => {
              if (ratingForm.score === 0) {
                alert("Please select a rating");
                return;
              }
              if (!ratingForm.review.trim()) {
                alert("Please write a review message");
                return;
              }
              if (!authUser?.username || !targetUsername) {
                alert("User information not available");
                return;
              }

              setSubmittingRating(true);
              try {
                await axios.post("/ratings", {
                  rater: { username: authUser.username },
                  ratedUser: { username: targetUsername },
                  score: ratingForm.score,
                  review: ratingForm.review.trim()
                });
                
                // Refresh ratings and user data to show new rating
                const [ratingsRes, userRes] = await Promise.all([
                  axios.get(`/ratings/user/${targetUsername}`),
                  axios.get(`/users/${targetUsername}`)
                ]);
                
                setRatings(ratingsRes.data || []);
                
                const userData = userRes.data;
                setUser({
                  ...user,
                  rating: userData.rating || user.rating
                });
                
                if (isOwnProfile) {
                  updateUser({
                    ...authUser,
                    rating: userData.rating || authUser.rating
                  });
                }
                
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
