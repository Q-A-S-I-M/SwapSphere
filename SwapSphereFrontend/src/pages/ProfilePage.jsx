import React, { useState, useEffect } from "react";
import "../styles/ProfilePage.css";
import ItemTabs from "../components/ItemTabs";
import OfferedItemCard from "../components/OfferedItemCard";
import WantedItemCard from "../components/WantedItemCard";
import RatingCard from "../components/RatingCard";
import Modal from "../components/Modal"; // simple reusable Modal
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [offeredItems, setOfferedItems] = useState([]);
  const [wantedItems, setWantedItems] = useState([]);
  const [ratings, setRatings] = useState([]);

  // Modals for adding items
  const [addOfferedModal, setAddOfferedModal] = useState(false);
  const [addWantedModal, setAddWantedModal] = useState(false);

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

  // Offered item form
  const [offeredForm, setOfferedForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    priority: 0,
    status: "Available",
    images: [],
    imagePreviews: [],
  });

  // Wanted item form
  const [wantedForm, setWantedForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: 0,
    status: "Available",
  });

  // Fetch user data + items + ratings
  useEffect(() => {
    if (!authUser?.username) return;

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`/users/${authUser.username}`);
        if (!isMounted) return;

        setUser(res.data);
        setProfileForm({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          contact: res.data.contact || "",
          country: res.data.country || "",
          city: res.data.city || "",
          profilePicFile: res.data.profilePicUrl || null,
          locLat: res.data.locLat || null,
          locLong: res.data.locLong || null,
        });
        setProfilePicPreview(res.data.profilePicUrl || null);
        console.log(res.data.profilePicUrl);

        const [offeredRes, wantedRes, ratingsRes] = await Promise.all([
          axios.get(`/offer-items/user-item/${authUser.username}`),
          axios.get(`/wanted-items/user-item/${authUser.username}`),
          axios.get(`/ratings/user/${authUser.username}`),
        ]);
        if (!isMounted) return;

        setOfferedItems(offeredRes.data);
        setWantedItems(wantedRes.data);
        setRatings(ratingsRes.data);
      } catch (err) {
        console.error("Error fetching profile data", err);
        alert("Failed to load profile data");
      }
    };

    fetchUserData();

    return () => { isMounted = false; };
  }, [authUser]);

  // Handlers for profile form
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileForm(prev => ({ ...prev, profilePicFile: file }));
    setProfilePicPreview(URL.createObjectURL(file));
  };

  // Save profile with automatic location
  const handleSaveProfile = async () => {
    try {
      if (!user?.username) return;

      let profilePicURL = user.profilePic;

      // Upload profile picture if selected
      if (profileForm.profilePicFile) {
        const formData = new FormData();
        formData.append("file", profileForm.profilePicFile);
        formData.append("username", user.username);
        const res = await axios.put("/api/images/upload-profile-pic", formData);
        profilePicURL = res.data;
        user.profilePic = profilePicURL;
      }

      // Get current location automatically
      let locLat = profileForm.locLat;
      let locLong = profileForm.locLong;
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        locLat = pos.coords.latitude;
        locLong = pos.coords.longitude;
      }

      const updatedUser = {
        ...user,
        fullName: profileForm.fullName,
        email: profileForm.email,
        contact: profileForm.contact,
        country: profileForm.country,
        city: profileForm.city,
        profilePic: profilePicURL,
        locLat,
        locLong,
      };

      const res = await axios.put(`/users/${user.username}`, updatedUser);

      setUser(updatedUser);
      updateUser(updatedUser);
      setProfileModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  // Add Offered Item
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
      const itemPayload = {
        username: user.username,
        title: offeredForm.title,
        description: offeredForm.description,
        category: offeredForm.category,
        condition: offeredForm.condition,
        priority: offeredForm.priority,
        status: offeredForm.status
      };
      const res = await axios.post("/offer-items", itemPayload);
      const newItem = res.data;

      for (let img of offeredForm.images) {
        const formData = new FormData();
        formData.append("file", img);
        formData.append("id", newItem.offeredItemId);
        await axios.post("/api/images/upload", formData);
      }

      setOfferedItems(prev => [...prev, newItem]);
      setAddOfferedModal(false);
      setOfferedForm({
        title: "",
        description: "",
        category: "",
        condition: "",
        priority: 0,
        status: "Available",
        images: [],
        imagePreviews: [],
      });
    } catch (err) {
      console.error(err);
      alert("Error adding offered item");
    }
  };

  // Add Wanted Item
  const handleAddWantedItem = async () => {
    try {
      const payload = { ...wantedForm, username: user.username };
      const res = await axios.post("/wanted-items", payload);
      setWantedItems(prev => [...prev, res.data]);
      setAddWantedModal(false);
      setWantedForm({ title: "", description: "", category: "", priority: 0, status: "Available" });
    } catch (err) {
      console.error(err);
      alert("Error adding wanted item");
    }
  };

  // Delete handlers
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

  return (
    <div className="profile-page-root">
      {/* Header */}
      <div className="profile-header-panel">
        <div className="profile-header-left">
          <div className="avatar-large">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="avatar" />
            ) : (
              <div className="avatar-fallback">{user?.username?.charAt(0).toUpperCase() || "U"}</div>
            )}
          </div>
        </div>

        <div className="profile-header-right">
          <div><strong>Username:</strong> {user?.username || "..."}</div>
          <div><strong>Full Name:</strong> {user?.fullName || "..."}</div>
          <div><strong>Contact:</strong> {user?.contact || "..."}</div>
          <div><strong>Email:</strong> {user?.email || "..."}</div>
          <div><strong>Country:</strong> {user?.country || "..."}</div>
          <div><strong>City:</strong> {user?.city || "..."}</div>
          <div><strong>Rating:</strong> {user?.rating || 0}</div>
          <button onClick={() => setProfileModalOpen(true)}>Edit Profile</button>
        </div>
      </div>

      {/* Tabs */}
      <ItemTabs
        offeredCount={offeredItems.length}
        wantedCount={wantedItems.length}
        ratingsCount={ratings.length}
        renderAddButton={(activeTab) => {
          if (activeTab === "offered") return <button onClick={() => setAddOfferedModal(true)}>+ Add Offered Item</button>;
          if (activeTab === "wanted") return <button onClick={() => setAddWantedModal(true)}>+ Add Wanted Item</button>;
          return null;
        }}
        renderContent={(activeTab) => {
          if (activeTab === "offered") return (
            <div className="items-list">
              {offeredItems.map(it => (
                <OfferedItemCard key={it.offeredItemId} item={it} isOwnProfile={true} onDelete={() => deleteOffered(it.offeredItemId)} />
              ))}
            </div>
          );
          if (activeTab === "wanted") return (
            <div className="items-list">
              {wantedItems.map(it => (
                <WantedItemCard key={it.wantedItemId} item={it} isOwn={true} onDelete={() => deleteWanted(it.wantedItemId)} />
              ))}
            </div>
          );
          if (activeTab === "ratings") return (
            <div className="items-list">
              {ratings.map(r => <RatingCard key={r.ratingId} rating={r} />)}
            </div>
          );
        }}
      />

      {/* Profile Modal */}
      {profileModalOpen && (
        <Modal onClose={() => setProfileModalOpen(false)} title="Edit Profile">
          <input type="text" name="fullName" placeholder="Full name" value={profileForm.fullName} onChange={handleProfileChange} />
          <input type="email" name="email" placeholder="Email" value={profileForm.email} onChange={handleProfileChange} />
          <input type="text" name="contact" placeholder="Contact" value={profileForm.contact} onChange={handleProfileChange} />
          <input type="text" name="country" placeholder="Country" value={profileForm.country} onChange={handleProfileChange} />
          <input type="text" name="city" placeholder="City" value={profileForm.city} onChange={handleProfileChange} />
          <input type="file" accept="image/*" onChange={handleProfilePicChange} />
          {profilePicPreview && <img src={profilePicPreview} alt="Preview" className="profile-pic-preview" />}
          <button onClick={handleSaveProfile}>Save Profile</button>
        </Modal>
      )}

      {/* Add Offered Item Modal */}
      {addOfferedModal && (
        <Modal onClose={() => setAddOfferedModal(false)} title="Add Offered Item">
          <input placeholder="Title" value={offeredForm.title} onChange={(e) => setOfferedForm({...offeredForm, title: e.target.value})} />
          <input placeholder="Description" value={offeredForm.description} onChange={(e) => setOfferedForm({...offeredForm, description: e.target.value})} />
          <input placeholder="Category" value={offeredForm.category} onChange={(e) => setOfferedForm({...offeredForm, category: e.target.value})} />
          <input placeholder="Condition" value={offeredForm.condition} onChange={(e) => setOfferedForm({...offeredForm, condition: e.target.value})} />
          <input type="number" placeholder="Priority" value={offeredForm.priority} onChange={(e) => setOfferedForm({...offeredForm, priority: Number(e.target.value)})} />
          <input type="file" multiple accept="image/*" onChange={handleOfferedImageChange} />
          <div className="offered-previews">
            {offeredForm.imagePreviews.map((src, idx) => <img key={idx} src={src} alt="preview" className="preview-thumb" />)}
          </div>
          <button onClick={handleAddOfferedItem}>Add Offered Item</button>
        </Modal>
      )}

      {/* Add Wanted Item Modal */}
      {addWantedModal && (
        <Modal onClose={() => setAddWantedModal(false)} title="Add Wanted Item">
          <input placeholder="Title" value={wantedForm.title} onChange={(e) => setWantedForm({...wantedForm, title: e.target.value})} />
          <input placeholder="Description" value={wantedForm.description} onChange={(e) => setWantedForm({...wantedForm, description: e.target.value})} />
          <input placeholder="Category" value={wantedForm.category} onChange={(e) => setWantedForm({...wantedForm, category: e.target.value})} />
          <input type="number" placeholder="Priority" value={wantedForm.priority} onChange={(e) => setWantedForm({...wantedForm, priority: Number(e.target.value)})} />
          <button onClick={handleAddWantedItem}>Add Wanted Item</button>
        </Modal>
      )}
    </div>
  );
}
