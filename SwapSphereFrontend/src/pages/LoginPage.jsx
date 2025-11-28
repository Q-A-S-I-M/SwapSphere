import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [transitioning, setTransitioning] = useState(false);

  // FORM FIELDS
  const [logUser, setLogUser] = useState("");
  const [logPass, setLogPass] = useState("");

  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  // MESSAGES
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ROLE TOGGLE
  const [role, setRole] = useState("user");

  // LOCATION
  const [locationAllowed, setLocationAllowed] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationAllowed(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setLocationAllowed(true),
      () => setLocationAllowed(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const resetAllFields = () => {
    setLogUser("");
    setLogPass("");
    setRegUser("");
    setRegPass("");
    setEmail("");
    setCountry("");
    setCity("");
  };

  const switchTo = (target) => {
    if (transitioning || target === mode) return;
    setErrorMessage("");
    setSuccessMessage("");
    resetAllFields();

    setTransitioning(true);
    setTimeout(() => {
      setMode(target);
      setTransitioning(false);
    }, 250);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!logUser || !logPass) {
      setErrorMessage("Please fill in all login fields.");
      return;
    }

    // perform very simple mock login
    login({ username: logUser, email: `${logUser}@example.com` },);
    navigate("/dashboard");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (locationAllowed === false) {
      setErrorMessage("Location access is required to register.");
      return;
    }

    if (!regUser || !regPass || !email || !country || !city) {
      setErrorMessage("Please fill in all registration fields.");
      return;
    }

    setSuccessMessage("Registration successful! Please log in.");

    setTransitioning(true);
    setTimeout(() => {
      setMode("login");
      setTransitioning(false);
      setSuccessMessage("Registration successful! Please log in.");
      setRegUser("");
      setRegPass("");
      setEmail("");
      setCountry("");
      setCity("");
    }, 300);
  };

  const changeRole = (selected) => {
    setRole(selected);
    resetAllFields();
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="center-page">
      <div className="split">
        <div className="left">
          <h1 className="brand">SwapSphere</h1>
          <p className="brand-sub">Trade crypto securely with decentralized swaps and intelligent portfolio management.</p>
        </div>

        <div className="right">
          <div className={`card fade-wrapper ${transitioning ? "fade-out" : "fade-in"}`}>

            {mode === "login" && (
              <form onSubmit={handleLogin} className="login-form">
                <div className="role-toggle">
                  <button type="button" className={role === "user" ? "active" : ""} onClick={() => changeRole("user")}>User</button>
                  <button type="button" className={role === "admin" ? "active" : ""} onClick={() => changeRole("admin")}>Admin</button>
                </div>

                <input type="text" placeholder="Username" className="input-field" value={logUser} onChange={(e) => setLogUser(e.target.value)} />
                <input type="password" placeholder="Password" className="input-field" value={logPass} onChange={(e) => setLogPass(e.target.value)} />

                <button type="submit" className="btn-primary">Login</button>

                {errorMessage && <div className="form-error">{errorMessage}</div>}
                {successMessage && <div className="form-success">{successMessage}</div>}

                <p className="switch-hint">
                  No account?{" "}
                  <button type="button" className="link-btn" onClick={() => switchTo("register")}>Register</button>
                </p>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={handleRegister} className="register-form">
                <input type="text" placeholder="Username" className="input-field" value={regUser} onChange={(e) => setRegUser(e.target.value)} />
                <input type="password" placeholder="Password" className="input-field" value={regPass} onChange={(e) => setRegPass(e.target.value)} />
                <input type="text" placeholder="Email Address" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" placeholder="Country" className="input-field" value={country} onChange={(e) => setCountry(e.target.value)} />
                <input type="text" placeholder="City" className="input-field" value={city} onChange={(e) => setCity(e.target.value)} />

                <button type="submit" className="btn-primary">Register</button>

                {errorMessage && <div className="form-error">{errorMessage}</div>}
                {successMessage && <div className="form-success">{successMessage}</div>}

                <p className="switch-hint">
                  Already have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => switchTo("login")}>Login</button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
