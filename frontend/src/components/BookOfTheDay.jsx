// src/components/BookOfTheDay.jsx (small tweak)
import React, { useState, useEffect } from "react";
import api from "../api";
import { normalizeBook } from "../utils/normalizers";

export default function BookOfTheDay() {
  const [summary, setSummary] = useState("Loading summary...");
  const [book, setBook] = useState({ title: "Loading...", authors: "" });

  useEffect(() => {
    let mounted = true;
    async function fetchBookOfDay() {
      try {
        const res = await api.get("/home/");
        const recommended = Array.isArray(res.data?.recommended) ? res.data.recommended : [];
        if (recommended.length > 0) {
          const n = normalizeBook(recommended[0]);
          if (mounted) setBook({ title: n.title, authors: n.authors });
          try {
            const summaryRes = await api.get(`/summary/${n.id}/`);
            if (mounted) setSummary(summaryRes.data?.summary ?? "No summary available.");
          } catch (err) {
            if (mounted) setSummary("No summary available.");
          }
        } else {
          if (mounted) {
            setBook({ title: "No book", authors: "" });
            setSummary("No recommendation available.");
          }
        }
      } catch (err) {
        if (mounted) setSummary("Failed to load summary.");
      }
    }
    fetchBookOfDay();
    return () => { mounted = false; };
  }, []);

  return (
    /* (rendering unchanged) */
    <section className="book-of-day-section-3d">
      <h3 className="section-title-3d">Book of the Day</h3>
      <div className="book-of-day-card-3d">
        <div className="book-cover-large-3d bg-orange-500"></div>
        <div className="book-of-day-info-3d">
          <h4 className="book-title-large-3d">{book.title}</h4>
          <p className="book-author-large-3d">by {book.authors}</p>
          <div className="ai-summary-3d">
            <p>{summary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
