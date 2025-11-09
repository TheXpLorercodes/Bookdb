import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../style/Layout.css";

export default function Layout({ children, isLoggedIn }) {
  return (
    <div className="layout">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}
