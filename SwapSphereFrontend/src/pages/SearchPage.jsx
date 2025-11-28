import React, { useEffect, useMemo, useState } from "react";
import "../styles/SearchPage.css";
import OfferedItemCard from "../components/OfferedItemCard";
import RequestCard from "../components/RequestCard";

import coin1 from "../assets/coin-1.jpg";
import coin2 from "../assets/coin-2.jpg";
import coin3 from "../assets/coin-3.jpg";
import coin4 from "../assets/coin-4.jpg";
import coin5 from "../assets/coin-5.jpg";
import coin6 from "../assets/coin-6.jpg";
import coin7 from "../assets/coin-7.jpg";
import coin8 from "../assets/coin-8.jpg";
import coin9 from "../assets/coin-9.jpg";
import coin10 from "../assets/coin-10.jpg";

const catalog = [
  {
    id: "o1",
    username: "John Doe",
    userId: "u1",
    location: "Toronto",
    name: "Vintage Coin Set",
    image: coin1,
    images: [coin1, coin2, coin3, coin4, coin5, coin6, coin7, coin8, coin9, coin10],
    description: "A neat set of vintage coins from the early 1900s.",
    category: "Collectibles",
    condition: "Good",
    priority: "Medium",
    status: "Active",
    createdAt: "2024-01-10",
  },
  {
    id: "o2",
    username: "Maya Patel",
    userId: "u2",
    location: "Ottawa",
    name: "Silver Dollar Duo",
    image: coin3,
    images: [coin3, coin4, coin5],
    description: "Brilliant uncirculated silver dollar pair.",
    category: "Collectibles",
    condition: "Excellent",
    priority: "High",
    status: "Active",
    createdAt: "2024-01-14",
  },
  {
    id: "o3",
    username: "Lucas Chen",
    userId: "u3",
    location: "Montreal",
    name: "Heritage Coin Mix",
    image: coin6,
    images: [coin6, coin7, coin8],
    description: "Mixed-era coins perfect for starter collectors.",
    category: "Collectibles",
    condition: "Fair",
    priority: "Low",
    status: "Active",
    createdAt: "2024-02-02",
  },
];

const myOfferables = [
  { id: "m1", name: "Gold Token", category: "Tokens", condition: "Mint", image: coin9 },
  { id: "m2", name: "Collector Stamp", category: "Philately", condition: "Excellent", image: coin2 },
];

const locationIndex = {
  Toronto: 0,
  Ottawa: 1,
  Montreal: 2,
  Vancouver: 3,
  Calgary: 4,
};

const fakeDistanceKm = (userLoc, itemLoc) => {
  const a = locationIndex[userLoc] ?? 0;
  const b = locationIndex[itemLoc] ?? 5;
  return Math.abs(a - b) * 120 + 10;
};

export default function SearchPage() {
  useEffect(() => {
    if (!localStorage.getItem("swapSphereLocation")) {
      localStorage.setItem("swapSphereLocation", "Toronto");
    }
  }, []);

  const userLocation = localStorage.getItem("swapSphereLocation") || "Toronto";
  const [searchTerm, setSearchTerm] = useState("");
  const [requestTarget, setRequestTarget] = useState(null);

  const filteredResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return catalog
      .map((item) => ({
        ...item,
        distanceKm: fakeDistanceKm(userLocation, item.location),
      }))
      .filter((item) => item.name.toLowerCase().includes(query))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [searchTerm, userLocation]);

  return (
    <div className="search-wrapper">
      <h2 className="search-title">Search Items</h2>

      <div className="search-bar-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-btn" onClick={() => setSearchTerm((prev) => prev.trim())}>
          Search
        </button>
      </div>

      <div className="results-container">
        {filteredResults.length === 0 ? (
          <p className="no-results">No items found</p>
        ) : (
          filteredResults.map((item) => (
            <div key={item.id} className="search-result-card">
              <div className="result-meta">
                <span className="result-distance">{item.distanceKm} km away</span>
                <span className="result-location">{item.location}</span>
              </div>
              <OfferedItemCard
                item={item}
                source="search"
                isOwnProfile={false}
                onRequest={setRequestTarget}
              />
            </div>
          ))
        )}
      </div>

      <RequestCard
        open={Boolean(requestTarget)}
        onClose={() => setRequestTarget(null)}
        targetItem={requestTarget}
        myItems={myOfferables}
        myTokens={275}
        onConfirm={(payload) => {
          console.log("Search request payload:", payload);
          alert("Request submitted (demo)");
          setRequestTarget(null);
        }}
      />
    </div>
  );
}
