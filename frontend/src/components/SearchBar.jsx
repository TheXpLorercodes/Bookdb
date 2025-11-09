// src/components/SearchBar.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/SearchBar.css";

export default function SearchBar({ onSelectBook }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔎 Fetch books when query changes (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
          )}&maxResults=5`
        );
        const items = res.data.items || [];
        setResults(
          items.map((item) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors?.join(", ") || "Unknown Author",
            thumbnail:
              item.volumeInfo.imageLinks?.thumbnail ||
              "https://via.placeholder.com/60x90",
          }))
        );
      } catch (err) {
        console.error("Google Books search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500); // 0.5s debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="searchbar-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for books..."
        className="searchbar-input"
      />
      {loading && <div className="searchbar-loading">Loading…</div>}

      {results.length > 0 && (
        <ul className="searchbar-results">
          {results.map((book) => (
            <li
              key={book.id}
              className="searchbar-item"
              onClick={() => {
                if (onSelectBook) onSelectBook(book);
                setQuery("");
                setResults([]);
              }}
            >
              <img src={book.thumbnail} alt={book.title} />
              <div>
                <strong>{book.title}</strong>
                <div className="searchbar-author">{book.authors}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
