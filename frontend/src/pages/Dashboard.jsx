import React, { useEffect, useState } from "react";
import axios from "axios";
import { ACCESS_TOKEN } from "../constants";
import Navbar from "../components/Navbar";
import {
  normalizeBackendBook,
  normalizeGoogleBook,
} from "../utils/normalizers";
import "../style/Dashboard.css";

export default function Dashboard() {
  const [carouselBooks, setCarouselBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(ACCESS_TOKEN);

        const res = await axios.get("http://127.0.0.1:8000/api/v1/home/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || {};
        setCarouselBooks((data.carousel || []).map(normalizeBackendBook));
        setRecentBooks((data.recent || []).map(normalizeBackendBook));
        setBestSellers((data.bestsellers || []).map(normalizeBackendBook));
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ✅ Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          searchQuery
        )}`
      );

      setSearchResults(
        (res.data.items || []).map((item) => normalizeGoogleBook(item))
      );
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    }
  };

  const renderBookCard = (book) => (
    <div key={book.id} className="book-card">
      <img src={book.thumbnail} alt={book.title} />
      <h3>{book.title}</h3>
      {book.authors.length > 0 && <p>{book.authors.join(", ")}</p>}
    </div>
  );

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Navbar />

      <div className="dashboard-main">
        <h1>📚 My Library Dashboard</h1>

        {/* 🔎 Search */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search books..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {/* 🎯 Search Results */}
        {searchResults.length > 0 && (
          <section>
            <h2>Search Results</h2>
            <div className="book-grid">
              {searchResults.map((book) => renderBookCard(book))}
            </div>
          </section>
        )}

        {/* 🎡 Carousel */}
        <section>
          <h2>Featured</h2>
          <div className="carousel">
            {carouselBooks.map((book) => renderBookCard(book))}
          </div>
        </section>

        {/* 🆕 Recently Added */}
        <section>
          <h2>Recently Added</h2>
          <div className="book-grid">
            {recentBooks.map((book) => renderBookCard(book))}
          </div>
        </section>

        {/* 🔥 Best Sellers */}
        <section>
          <h2>Best Sellers</h2>
          <div className="book-grid">
            {bestSellers.map((book) => renderBookCard(book))}
          </div>
        </section>
      </div>
    </>
  );
}
