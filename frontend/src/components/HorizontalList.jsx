// src/components/HorizontalList.jsx
import React, { useEffect, useState, useRef } from "react";
import "../style/HorizontalList.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HorizontalList = ({ title, query }) => {
  const [books, setBooks] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${query}&limit=15`
        );
        const data = await res.json();
        setBooks(data.docs || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchBooks();
  }, [query]);

  const scroll = (dir) => {
    if (!listRef.current) return;
    listRef.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <div className="horizontal-section">
      <h2>{title}</h2>
      <div className="carousel-wrapper">
        <button className="scroll-btn left" onClick={() => scroll("left")}>
          <ChevronLeft size={28} />
        </button>

        <div className="horizontal-list" ref={listRef}>
          {books.map((book, idx) => (
            <div className="horizontal-card" key={idx}>
              <img
                src={
                  book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150x220?text=No+Cover"
                }
                alt={book.title}
              />
              <p>{book.title}</p>
            </div>
          ))}
        </div>

        <button className="scroll-btn right" onClick={() => scroll("right")}>
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};

export default HorizontalList;
