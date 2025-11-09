import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Layout from "../layout/Layout";
import {
  normalizeBackendBook,
  normalizeGoogleBook,
} from "../utils/normalizers";
import "../style/BookDetails.css";

export default function BookDetails() {
  const { google_id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await api.get(`/books/details/${google_id}/`);
        setBook(normalizeBook(res.data));
      } catch (err) {
        console.error("Error loading book details", err);
      }
    }
    fetchBook();
  }, [google_id]);

  if (!book) return <p>Loading...</p>;

  return (
    <Layout isLoggedIn={true} activePage="books">
      <div className="book-details">
        <img src={book.thumbnail} alt={book.title} className="book-cover" />
        <div className="book-info">
          <h1>{book.title}</h1>
          <h3>{book.authors?.join(", ") || "Unknown Author"}</h3>
          <p><strong>Published:</strong> {book.published_date || "N/A"}</p>
          <p><strong>Categories:</strong> {book.categories?.join(", ") || "N/A"}</p>
          <p className="description">{book.description || "No description available."}</p>
        </div>
      </div>
    </Layout>
  );
}
