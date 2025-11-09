import React, { useState, useEffect } from 'react';
import '../style/footer.css';   

export default function Footer() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => {
            if (isDropdownOpen) {
                setDropdownOpen(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    return (
        <>
            <footer className="footer-3d">
                <div className="footer-content-3d">
                    <div className="footer-section">
                        <h4 className="footer-title">About The Athenaeum</h4>
                        <p>Your premier destination for book discovery, connecting readers with their next great adventure.</p>
                    </div>
                    <div className="footer-section">
                        <h4 className="footer-title">Quick Links</h4>
                        <a href="#trending">Trending Books</a>
                        <a href="#genres">Browse Genres</a>
                        <a href="#community">Join Community</a>
                    </div>
                    <div className="footer-section">
                        <h4 className="footer-title">Connect</h4>
                        <a href="#newsletter">Newsletter</a>
                        <a href="#social">Follow Us</a>
                        <a href="#contact">Contact Support</a>
                    </div>
                    <div className="footer-section">
                        <h4 className="footer-title">Resources</h4>
                        <a href="#help">Help Center</a>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                    </div>
                </div>
                <div className="footer-bottom-3d">
                    <p>&copy; 2025 The Athenaeum. All rights reserved.</p>
                </div>
            </footer>

            <div className="floating-button-container">
                <button
                    className="floating-button-3d"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up to the window
                        setDropdownOpen(!isDropdownOpen);
                    }}
                >
                    {isDropdownOpen ? '✕' : '⚡'}
                </button>
                <div className={`floating-dropdown-3d ${isDropdownOpen ? 'show' : ''}`}>
                    <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        Back to Top
                    </a>
                    <a href="#search">Quick Search</a>
                    <a href="/dashboard">My Library</a>
                    <a href="#ai-picks">AI Picks</a>
                </div>
            </div>
        </>
    );
}
