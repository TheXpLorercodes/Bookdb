import React from "react";
import { normalizeBook } from "../utils/normalizers";
import "../style/BookCard.css";

export default function BookCard({ book }) {
  const b = normalizeBook(book);

  return (
    <article className="book-card">
      <div className="book-cover">
        {b.thumbnail ? (
          <img src={b.thumbnail} alt={b.title} />
        ) : (
          <div className="book-cover-placeholder">📘</div>
        )}
      </div>

      <div className="book-body">
        <h3 className="book-title">{b.title}</h3>
        <p className="book-authors">{b.authors}</p>
        <p className="book-desc">{b.description ? truncate(b.description, 150) : "No description available."}</p>

        <div className="book-meta">
          <span className="meta-item">Published: {b.published_date}</span>
          <span className="meta-item">Rating: {b.rating}</span>
        </div>
      </div>
    </article>
  );
}

function truncate(text, n) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n).trim() + "…" : text;
}
