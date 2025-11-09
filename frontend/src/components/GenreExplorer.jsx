import React, { useState, useEffect } from 'react';
import '../style/genreexplorer.css';

export default function GenreExplorer() {
    const [activeGenre, setActiveGenre] = useState('Fantasy');
    const [recommendation, setRecommendation] = useState({
        title: "The Name of the Wind",
        author: "Patrick Rothfuss",
        summary: "Generating recommendation...",
    });

    const genreData = {
        Fantasy: { title: "The Name of the Wind", author: "Patrick Rothfuss", summary: "A masterful tale of magic, music, and mystery in a world where stories have power." },
        "Sci-Fi": { title: "The Martian", author: "Andy Weir", summary: "A gripping survival story combining hard science with humor and heart." },
        Mystery: { title: "The Thursday Murder Club", author: "Richard Osman", summary: "A delightful blend of cozy mystery and sharp wit from a retirement home." },
        Romance: { title: "Beach Read", author: "Emily Henry", summary: "A perfect enemies-to-lovers story with depth, humor, and real characters." },
    };

    const handleGenreClick = (genre) => {
        setActiveGenre(genre);
        setRecommendation({ ...genreData[genre], summary: "Generating recommendation..." });

        // Simulate fetching a new recommendation
        setTimeout(() => {
            setRecommendation(genreData[genre]);
        }, 1500);
    };

    // Load initial recommendation
    useEffect(() => {
         const timer = setTimeout(() => {
            setRecommendation(genreData['Fantasy']);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="genre-explorer-section-3d">
            <h3 className="section-title-3d">Genre Explorer</h3>
            <div className="genre-buttons-3d">
                {Object.keys(genreData).map((genre) => (
                    <button
                        key={genre}
                        className={`genre-btn-3d ${activeGenre === genre ? 'active' : ''}`}
                        onClick={() => handleGenreClick(genre)}
                    >
                        {genre}
                    </button>
                ))}
            </div>
            <div className="genre-recommendation-card-3d">
                {recommendation.summary.includes("Generating") ? (
                    <div className="loading-indicator-3d">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                ) : (
                    <>
                        <h4 className="recommendation-title-3d">{recommendation.title}</h4>
                        <p className="recommendation-author-3d">by {recommendation.author}</p>
                        <p className="recommendation-summary-3d">{recommendation.summary}</p>
                    </>
                )}
            </div>
        </section>
    );
}
