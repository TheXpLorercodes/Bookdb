// src/pages/Home.jsx
import React from "react";
import Layout from "../layout/Layout";

export default function Home() {
  return (
    <Layout isLoggedIn={true} activePage="home">
      <div className="home-page">
        <h1>Welcome to the Home Page 🎉</h1>
      </div>
    </Layout>
  );
}
