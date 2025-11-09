import React from "react";
import BookCard from "./BookCard";
import "../style/BookList.css";

export default function BookList({ title, books = [] }) {
  return (
    <section className="book-list-section">
      {title && <h2 className="booklist-title">{title}</h2>}
      <div className="book-list-grid">
        {books && books.length ? (
          books.map((bk) => <BookCard key={bk.google_id ?? bk.id ?? JSON.stringify(bk)} book={bk} />)
        ) : (
          <div className="empty-note">No books found.</div>
        )}
      </div>
    </section>
  );
}
