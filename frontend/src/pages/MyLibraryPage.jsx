import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import api from "../api";
import "../style/MyLibrary.css";

export default function MyLibraryPage() {
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    api.get("/interactions/my-library/")
      .then((res) => setLibrary(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Layout isLoggedIn={true} activePage="mylibrary">
      <main className="main-content">
        <h2 className="section-title-3d">My Library</h2>
        <div className="my-library-grid">
          {library.map((book, i) => (
            <div className="book-card-3d" key={i}>
              {book.title}
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
