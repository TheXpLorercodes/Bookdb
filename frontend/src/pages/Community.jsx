import React, { useState } from "react";
import Layout from "../layout/Layout";
import "../style/Community.css";

export default function Community() {
  const [activeTab, setActiveTab] = useState("discussions");

  return (
    <Layout isLoggedIn={true} activePage="community">
      <h1 className="community-title">Community</h1>

      <div className="tab-container">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "discussions" ? "active" : ""}`}
            onClick={() => setActiveTab("discussions")}
          >
            Discussions
          </button>
          <button
            className={`tab-button ${activeTab === "clubs" ? "active" : ""}`}
            onClick={() => setActiveTab("clubs")}
          >
            Clubs
          </button>
          <button
            className={`tab-button ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            Events
          </button>
        </div>
      </div>
    </Layout>
  );
}
