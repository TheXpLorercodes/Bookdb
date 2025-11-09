// src/pages/AllBooks.jsx
import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import api from "../api";
import {
  normalizeBackendBook,
  normalizeGoogleBook,
} from "../utils/normalizers";

import "../style/AllBooks.css";

export default function AllBooks() {
  const [recent, setRecent] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [top, setTop] = useState([]);

  // ✅ wrapper normalizer to handle both backend & google
  const normalizeBook = (book) => {
    if (book.volumeInfo || book.kind === "books#volume") {
      return normalizeGoogleBook(book); // Google Books API
    }
    return normalizeBackendBook(book); // Backend
  };

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await api.get("/home/");
        const { recent, bestsellers, carousel } = res.data;

        setRecent(recent.map(normalizeBook));
        setBestsellers(bestsellers.map(normalizeBook));
        setTop(carousel.map(normalizeBook));
      } catch (err) {
        console.error("Error loading all books", err);
      }
    }
    fetchBooks();
  }, []);

  return (
    <Layout isLoggedIn={true} activePage="allbooks">
      <div className="allbooks-page">
        <div className="allbooks-container">
          <h1 className="page-title">All Books</h1>

          {/* Recently Added */}
          <div className="books-row">
            <h2>Recently Added</h2>
            <div className="books-grid">
              {recent.map((book) => (
                <div
                  key={book.id}
                  className="book-card-3d"
                  onClick={() => (window.location.href = `/books/${book.id}`)}
                >
                  <img src={book.thumbnail} alt={book.title} />
                  <h3>{book.title}</h3>
                  <p>{book.authors}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Most Popular */}
          <div className="books-row">
            <h2>Most Popular</h2>
            <div className="books-grid">
              {bestsellers.map((book) => (
                <div
                  key={book.id}
                  className="book-card-3d"
                  onClick={() => (window.location.href = `/books/${book.id}`)}
                >
                  <img src={book.thumbnail} alt={book.title} />
                  <h3>{book.title}</h3>
                  <p>{book.authors}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 */}
          <div className="books-row">
            <h2>Top 10</h2>
            <div className="books-grid">
              {top.map((book) => (
                <div
                  key={book.id}
                  className="book-card-3d"
                  onClick={() => (window.location.href = `/books/${book.id}`)}
                >
                  <img src={book.thumbnail} alt={book.title} />
                  <h3>{book.title}</h3>
                  <p>{book.authors}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
