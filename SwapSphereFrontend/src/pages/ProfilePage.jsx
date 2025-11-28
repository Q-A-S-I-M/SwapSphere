import React, { useMemo, useState } from "react";
import "../styles/ProfilePage.css";
import ItemTabs from "../components/ItemTabs";
import OfferedItemCard from "../components/OfferedItemCard";
import WantedItemCard from "../components/WantedItemCard";
import RatingCard from "../components/RatingCard";
import RequestCard from "../components/RequestCard";
import { useAuth } from "../context/AuthContext";

/**
 * Profile page — Inline edit, Request modal, tabs, etc.
 *
 * Assumptions:
 * - isOwnProfile controls which actions show.
 * - For demo, isOwnProfile true = your profile, false = another user.
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  // Toggle this to false to test visiting someone else's profile
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // sample data for offered/wanted/ratings (kept simple)
  const initialOffered = useMemo(
    () => [
      {
        id: "o1",
        name: "Vintage Coin Set",
        image: "/assets/coin-main.jpg",
        images: [
          "/assets/coin-1.jpg",
          "/assets/coin-2.jpg",
          "/assets/coin-3.jpg",
          "/assets/coin-4.jpg",
          "/assets/coin-5.jpg",
          "/assets/coin-6.jpg",
          "/assets/coin-7.jpg",
          "/assets/coin-8.jpg",
          "/assets/coin-9.jpg",
          "/assets/coin-10.jpg"
        ],
        description: "A neat set of vintage coins from 1900s. Good condition.",
        category: "Collectibles",
        condition: "Good",
        priority: "High",
        status: "active",
        createdAt: "2025-11-01T10:15:00Z"
      }
    ],
    []
  );

  const initialWanted = useMemo(
    () => [
      {
        id: "w1",
        name: "Rare Board Game",
        description: "Looking for the limited edition version.",
        category: "Games",
        condition: "Any",
        priority: "Low",
        status: "open",
        createdAt: "2025-10-05T08:30:00Z"
      }
    ],
    []
  );

  const initialRatings = useMemo(
    () => [
      {
        id: "r1",
        rater: "alice",
        raterPic: "/assets/user1.jpg",
        score: 5,
        review: "Smooth trade, fast shipping!",
        createdAt: "2025-11-01T12:00:00Z"
      },
      {
        id: "r2",
        rater: "bob",
        raterPic: "/assets/user2.jpg",
        score: 4,
        review: "Item as described — would trade again.",
        createdAt: "2025-10-30T09:20:00Z"
      }
    ],
    []
  );

  const [offered, setOffered] = useState(initialOffered);
  const [wanted, setWanted] = useState(initialWanted);
  const [ratings] = useState(initialRatings);

  // Profile inline edit state (name/email)
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [emailValue, setEmailValue] = useState(user?.email || "");

  // Request modal state
  const [requestOpenFor, setRequestOpenFor] = useState(null); // item object when open
  const { user: authUser } = useAuth();

  // handlers
  const handleSaveProfile = () => {
    updateUser({ name: nameValue, email: emailValue });
    setEditing(false);
  };

  const handleDeleteOffered = (id) => setOffered((p) => p.filter((x) => x.id !== id));
  const handleDeleteWanted = (id) => setWanted((p) => p.filter((x) => x.id !== id));

  const openRequest = (item) => {
    // open request modal for item (when viewing other's profile)
    setRequestOpenFor(item);
  };
  const closeRequest = () => setRequestOpenFor(null);

  return (
    <div className="profile-page-root">
      {/* small dev toggle to preview other's profile quickly */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#666" }}>
          <input type="checkbox" checked={!isOwnProfile} onChange={(e) => setIsOwnProfile(!e.target.checked)} />
          &nbsp;Viewing other user's profile
        </label>
      </div>

      <div className="profile-header-panel">
        <div className="profile-header-left">
          <div className="avatar-large">
            {user?.profilePic ? <img src={user.profilePic} alt="avatar" /> : <div className="avatar-fallback">{(user?.name || "U").charAt(0).toUpperCase()}</div>}
          </div>
        </div>

        <div className="profile-header-right">
          <div className="profile-top-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className={editing ? "profile-name-editing" : "profile-name"}>{editing ? (
                <input className="profile-input-edit" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
              ) : (
                <span className="profile-name-text">{user?.name}</span>
              )}</div>

              <div className="profile-meta-vertical">
                <div><strong>Email:</strong>&nbsp;{editing ? <input className="profile-input-edit small" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} /> : <span className="muted">{user?.email}</span>}</div>
                <div><strong>Location:</strong>&nbsp;<span className="muted">{user?.location}</span></div>
                <div><strong>Rating:</strong>&nbsp;<span className="muted">{user?.rating}</span></div>
              </div>
            </div>

            <div className="profile-action-col">
              {!editing ? (
                <button className="btn-edit-profile" onClick={() => setEditing(true)}>Edit</button>
              ) : (
                <button className="btn-confirm-profile" onClick={handleSaveProfile}>Confirm</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs-area">
        <ItemTabs
          offeredCount={offered.length}
          wantedCount={wanted.length}
          ratingsCount={ratings.length}
          renderAddButton={(activeTab) => {
            if (activeTab === "ratings") return null;
            return (
              <div className="add-item-wrap">
                <button className="btn-add-item" onClick={() => alert("Add Item (placeholder)")}>+ Add Item</button>
              </div>
            );
          }}
          renderContent={(activeTab) => {
            if (activeTab === "offered") {
              return (
                <div className="items-list">
                  {offered.map((it) => (
                    <OfferedItemCard
                      key={it.id}
                      item={it}
                      isOwnProfile={isOwnProfile}
                      source="profile"
                      onRequest={openRequest}
                    />
                  ))}
                </div>
              );
            }
            if (activeTab === "wanted") {
              return (
                <div className="items-list">
                  {wanted.map((it) => (
                    <WantedItemCard key={it.id} item={it} isOwn={isOwnProfile} onDelete={() => handleDeleteWanted(it.id)} />
                  ))}
                </div>
              );
            }
            return (
              <div className="items-list">
                {ratings.map((r) => <RatingCard key={r.id} rating={r} />)}
              </div>
            );
          }}
        />
      </div>

      {requestOpenFor && (
        <RequestCard
          open={Boolean(requestOpenFor)}
          onClose={closeRequest}
          targetItem={requestOpenFor}
          myItems={authUser?.myItems || []}
          myTokens={authUser?.tokens || 0}
          onConfirm={(payload) => {
            // placeholder behavior on confirm: simply close and show alert
            console.log("Request payload:", payload);
            alert("Request sent (placeholder). See console for payload.");
            closeRequest();
          }}
        />
      )}
    </div>
  );
}
