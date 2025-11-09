import React from "react";
import { Link } from "react-router-dom";
import "../style/Sidebar.css";

export default function Sidebar({ isOpen, onClose, isLoggedIn }) {
  const items = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/all-books", label: "All Books" },
    { to: "/community", label: "Community" },
  ];
  if (isLoggedIn) items.push({ to: "/mylibrary", label: "My Library" });

  return (
    <>
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">📚 BookVerse</div>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="drawer-nav">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className="drawer-link" onClick={onClose}>
              {i.label}
            </Link>
          ))}

          <hr />
          <Link to="/settings" className="drawer-link" onClick={onClose}>
            Settings
          </Link>
          <Link to="/profile" className="drawer-link" onClick={onClose}>
            Profile
          </Link>
        </nav>
      </div>

      <div
        className={`drawer-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />
    </>
  );
}
