import React from "react";
import "../style/MyLibrary.css";

// Mock data (replace later with real data)
const recentBooks = [
    { id: 1, title: "Dune", author: "Frank Herbert", cover: "#D6C4A3" },
    { id: 2, title: "Neuromancer", author: "William Gibson", cover: "#AFAAC0" },
    { id: 3, title: "The Midnight Library", author: "Matt Haig", cover: "#C0B8AF" },
    { id: 4, title: "Project Hail Mary", author: "Andy Weir", cover: "#B8C0AF" },
    { id: 5, title: "Circe", author: "Madeline Miller", cover: "#BDAFAF" },
];

export default function MyLibrary() {
    return (
        <section className="my-library-section">
            <div className="my-library-grid">
                {recentBooks.map((book) => (
                    <div key={book.id} className="my-library-card">
                        <div
                            className="my-library-cover"
                            style={{ backgroundColor: book.cover }}
                        ></div>
                        <h3 className="my-library-title">{book.title}</h3>
                        <p className="my-library-author">by {book.author}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
