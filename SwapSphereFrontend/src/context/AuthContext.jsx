import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * AuthContext now includes:
 * - user (basic info)
 * - tokens (number)
 * - myItems (array) -> the current logged-in user's offered items (used in Request modal)
 *
 * This is mock/local storage only for dev/testing.
 */

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // try restore full user object from localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("ss_user_full");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // sample default user if none
  useEffect(() => {
    if (!user) {
      const example = {
        username: "myuser",
        name: "My User",
        email: "myuser@example.com",
        location: "Karachi, PK",
        rating: "4.9",
        profilePic: null,
        // tokens available for trading
        tokens: 1200,
        // myItems are the logged-in user's offered items (minimal fields)
        myItems: [
          {
            id: "mi1",
            name: "Spare GPU",
            image: "/assets/gpu-main.jpg",
            description: "Old GTX 10xx spare",
            category: "Electronics",
            condition: "Used",
            priority: "Low",
            status: "available",
            createdAt: "2025-10-01T10:00:00Z"
          },
          {
            id: "mi2",
            name: "Rare Card",
            image: "/assets/card-main.jpg",
            description: "Limited edition tournament card",
            category: "Collectibles",
            condition: "Good",
            priority: "Medium",
            status: "available",
            createdAt: "2025-09-12T11:22:00Z"
          }
        ]
      };
      setUser(example);
    }
  }, []); // run once

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("ss_user_full", JSON.stringify(user));
      } catch {}
    }
  }, [user]);

  const login = ({ username, email }) => {
    const u = {
      username: username || "User",
      name: username || "User",
      email: email || `${username || "user"}@example.com`,
      location: "Toronto",
      rating: "4.8",
      profilePic: null,
      tokens: 500,
      myItems: []
    };
    setUser(u);
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ss_user_full");
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updateMyItems = (newItems) => {
    setUser((prev) => ({ ...prev, myItems: newItems }));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, updateMyItems }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
