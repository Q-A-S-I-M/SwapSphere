// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // your axios instance
import "../styles/LoginPage.css";
import { useAuth } from "../context/AuthContext";
import chatApi from "../api/chatApi";
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validateContact,
  validateFullName,
  validateCountry,
  validateCity,
  filterUsername,
  filterContact,
  filterFullName,
  filterCountry,
  filterCity
} from "../utils/validation";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [transitioning, setTransitioning] = useState(false);

  // FORM FIELDS
  const [logUser, setLogUser] = useState("");
  const [logPass, setLogPass] = useState("");

  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  // MESSAGES
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // FIELD VALIDATION ERRORS
  const [fieldErrors, setFieldErrors] = useState({
    logUser: "",
    logPass: "",
    regUser: "",
    regPass: "",
    fullName: "",
    email: "",
    contact: "",
    country: "",
    city: ""
  });

  // ROLE TOGGLE
  const [role, setRole] = useState("user");

  // LOCATION
  const [locationAllowed, setLocationAllowed] = useState(null);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  // --- GET GEOLOCATION ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationAllowed(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAllowed(true);
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
      },
      () => setLocationAllowed(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // --- RESET FIELDS ---
  const resetAllFields = () => {
    setLogUser("");
    setLogPass("");
    setRegUser("");
    setRegPass("");
    setEmail("");
    setCountry("");
    setCity("");
    setFullName("");
    setContact("");
    setFieldErrors({
      logUser: "",
      logPass: "",
      regUser: "",
      regPass: "",
      fullName: "",
      email: "",
      contact: "",
      country: "",
      city: ""
    });
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

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    // Validate login fields
    const usernameValidation = validateUsername(logUser);
    const passwordValidation = validatePassword(logPass);
    
    setFieldErrors({
      ...fieldErrors,
      logUser: usernameValidation.error,
      logPass: passwordValidation.error
    });
    
    if (!usernameValidation.isValid || !passwordValidation.isValid) {
      setErrorMessage("Please fix the errors in the form.");
      return;
    }

    try {
      const roleValue = role === "admin" ? "ADMIN" : "USER";

      const response = await api.post("/auth/login", {
        username: logUser,
        password: logPass,
        role: roleValue, // send role explicitly
      });

      login({ username: logUser, role: response.data.role });
      try{
        const { default: chatApi } = await import("../api/chatApi");
        await chatApi.post("/api/auth/login", { username: logUser, password: logPass });
      } catch (chatErr) {
        console.error("Chat server login failed:", chatErr);
      }
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      // Check for banned account (403 status or ACCOUNT_SEIZED message)
      if (err.response && err.response.status === 403) {
        setErrorMessage("Your account has been seized. Please contact support for more information.");
        return;
      }
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          // Check for account seized message
          if (err.response.data === "ACCOUNT_SEIZED") {
            setErrorMessage("Your account has been seized. Please contact support for more information.");
          } else {
            setErrorMessage(err.response.data);
          }
        } else if (err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  // --- REGISTER HANDLER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (locationAllowed === false) {
      setErrorMessage("Location access is required to register.");
      return;
    }

    // Validate all registration fields
    const usernameValidation = validateUsername(regUser);
    const passwordValidation = validatePassword(regPass);
    const emailValidation = validateEmail(email);
    const contactValidation = validateContact(contact);
    const fullNameValidation = validateFullName(fullName);
    const countryValidation = validateCountry(country);
    const cityValidation = validateCity(city);
    
    const newFieldErrors = {
      regUser: usernameValidation.error,
      regPass: passwordValidation.error,
      email: emailValidation.error,
      contact: contactValidation.error,
      fullName: fullNameValidation.error,
      country: countryValidation.error,
      city: cityValidation.error
    };
    
    setFieldErrors({ ...fieldErrors, ...newFieldErrors });
    
    if (!usernameValidation.isValid || !passwordValidation.isValid || 
        !emailValidation.isValid || !contactValidation.isValid || 
        !fullNameValidation.isValid || !countryValidation.isValid || 
        !cityValidation.isValid) {
      setErrorMessage("Please fix the errors in the form.");
      return;
    }

    try {
      await api.post("/users/register", {
        username: regUser,
        password: regPass,
        fullName,
        email,
        contact,
        country,
        city,
        role: "USER",
        locLat: lat,
        locLong: long,
      });

      setSuccessMessage("Registration successful! Please log in.");
      switchTo("login");

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          setErrorMessage(err.response.data);
        } else if (err.response.data.message) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("Registration failed. Please try again.");
        }
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    }
  };

  // --- ROLE TOGGLE ---
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

                <div>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    className={`input-field ${fieldErrors.logUser ? 'input-error' : ''}`}
                    value={logUser} 
                    onChange={(e) => {
                      const filtered = filterUsername(e.target.value);
                      setLogUser(filtered);
                      const validation = validateUsername(filtered);
                      setFieldErrors({ ...fieldErrors, logUser: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateUsername(logUser);
                      setFieldErrors({ ...fieldErrors, logUser: validation.error });
                    }}
                  />
                  {fieldErrors.logUser && <div className="field-error">{fieldErrors.logUser}</div>}
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className={`input-field ${fieldErrors.logPass ? 'input-error' : ''}`}
                    value={logPass} 
                    onChange={(e) => {
                      setLogPass(e.target.value);
                      const validation = validatePassword(e.target.value);
                      setFieldErrors({ ...fieldErrors, logPass: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validatePassword(logPass);
                      setFieldErrors({ ...fieldErrors, logPass: validation.error });
                    }}
                  />
                  {fieldErrors.logPass && <div className="field-error">{fieldErrors.logPass}</div>}
                </div>

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
                <div>
                  <input 
                    type="text" 
                    placeholder="Full name" 
                    className={`input-field ${fieldErrors.fullName ? 'input-error' : ''}`}
                    value={fullName} 
                    onChange={(e) => {
                      const filtered = filterFullName(e.target.value);
                      setFullName(filtered);
                      const validation = validateFullName(filtered);
                      setFieldErrors({ ...fieldErrors, fullName: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateFullName(fullName);
                      setFieldErrors({ ...fieldErrors, fullName: validation.error });
                    }}
                  />
                  {fieldErrors.fullName && <div className="field-error">{fieldErrors.fullName}</div>}
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Username" 
                    className={`input-field ${fieldErrors.regUser ? 'input-error' : ''}`}
                    value={regUser} 
                    onChange={(e) => {
                      const filtered = filterUsername(e.target.value);
                      setRegUser(filtered);
                      const validation = validateUsername(filtered);
                      setFieldErrors({ ...fieldErrors, regUser: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateUsername(regUser);
                      setFieldErrors({ ...fieldErrors, regUser: validation.error });
                    }}
                  />
                  {fieldErrors.regUser && <div className="field-error">{fieldErrors.regUser}</div>}
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className={`input-field ${fieldErrors.regPass ? 'input-error' : ''}`}
                    value={regPass} 
                    onChange={(e) => {
                      setRegPass(e.target.value);
                      const validation = validatePassword(e.target.value);
                      setFieldErrors({ ...fieldErrors, regPass: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validatePassword(regPass);
                      setFieldErrors({ ...fieldErrors, regPass: validation.error });
                    }}
                  />
                  {fieldErrors.regPass && <div className="field-error">{fieldErrors.regPass}</div>}
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Email Address" 
                    className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      const validation = validateEmail(e.target.value);
                      setFieldErrors({ ...fieldErrors, email: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateEmail(email);
                      setFieldErrors({ ...fieldErrors, email: validation.error });
                    }}
                  />
                  {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Contact" 
                    className={`input-field ${fieldErrors.contact ? 'input-error' : ''}`}
                    value={contact} 
                    onChange={(e) => {
                      const filtered = filterContact(e.target.value);
                      setContact(filtered);
                      const validation = validateContact(filtered);
                      setFieldErrors({ ...fieldErrors, contact: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateContact(contact);
                      setFieldErrors({ ...fieldErrors, contact: validation.error });
                    }}
                  />
                  {fieldErrors.contact && <div className="field-error">{fieldErrors.contact}</div>}
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Country" 
                    className={`input-field ${fieldErrors.country ? 'input-error' : ''}`}
                    value={country} 
                    onChange={(e) => {
                      const filtered = filterCountry(e.target.value);
                      setCountry(filtered);
                      const validation = validateCountry(filtered);
                      setFieldErrors({ ...fieldErrors, country: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateCountry(country);
                      setFieldErrors({ ...fieldErrors, country: validation.error });
                    }}
                  />
                  {fieldErrors.country && <div className="field-error">{fieldErrors.country}</div>}
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="City" 
                    className={`input-field ${fieldErrors.city ? 'input-error' : ''}`}
                    value={city} 
                    onChange={(e) => {
                      const filtered = filterCity(e.target.value);
                      setCity(filtered);
                      const validation = validateCity(filtered);
                      setFieldErrors({ ...fieldErrors, city: validation.error });
                    }}
                    onBlur={() => {
                      const validation = validateCity(city);
                      setFieldErrors({ ...fieldErrors, city: validation.error });
                    }}
                  />
                  {fieldErrors.city && <div className="field-error">{fieldErrors.city}</div>}
                </div>

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