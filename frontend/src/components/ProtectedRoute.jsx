// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
// robust import to work across bundlers
import * as jwtDecodeModule from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";

const jwtDecode =
  (jwtDecodeModule && (jwtDecodeModule.default || jwtDecodeModule.jwtDecode)) ||
  jwtDecodeModule;

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    try {
      console.log("🔐 ProtectedRoute: starting auth check (sync)");
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log("🔑 access token:", token);

      if (!token) {
        setIsAuthorized(false);
        return;
      }

      if (typeof jwtDecode !== "function") {
        console.warn("jwt-decode not a function; allowing access because token exists");
        setIsAuthorized(true);
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (e) {
        console.warn("Failed to decode token:", e);
        setIsAuthorized(false);
        return;
      }

      const now = Date.now() / 1000;
      if (decoded?.exp && decoded.exp < now) {
        console.log("Token expired (sync check) — will require login/refresh via API interceptor");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    } catch (err) {
      console.error("ProtectedRoute unexpected error:", err);
      setIsAuthorized(false);
    }
  }, []);

  if (isAuthorized === null) {
    // short, non-hanging loading UI
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading auth check…</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}
