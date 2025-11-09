import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/Navbar.css";
import { ACCESS_TOKEN } from "../constants";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Track if user is logged in based on token
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem(ACCESS_TOKEN)
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Dark mode toggle effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Listen for changes in tokens across tabs
  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem(ACCESS_TOKEN));
    };
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Links in center of navbar
  const links = [
    { path: "/all-books", label: "All Books" },
    { path: "/community", label: "Community" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="navbar">
      {/* Left Logo */}
      <div className="navbar-left">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="navbar-logo">
          📚 BookVerse
        </Link>
      </div>

      {/* Center Links */}
      <div className="navbar-center">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="toggle-btn"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Auth Section */}
        {isLoggedIn ? (
          <div className="navbar-auth">
            <div className="avatar">👾</div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-auth">
            <Link to="/login">
              <button className="navbar-btn">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="navbar-btn secondary">Sign Up</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
