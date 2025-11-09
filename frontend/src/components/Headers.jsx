import React, { useState, useEffect } from 'react';
import '../style/header.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    // Effect to handle scroll detection for the header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Placeholder for authentication state
    const isLoggedIn = true; // Set to 'false' to see the Sign In/Up view

    return (
        <header className={`header-3d ${isScrolled ? 'scrolled' : ''}`}>
            <nav className="flex items-center justify-between w-full">
                <div className="logo">
                    <a href="/" className="text-2xl font-serif font-bold text-black">The Athenaeum</a>
                </div>

                <div className="nav-links hidden md:flex gap-8">
                    <a href="/all-books" className="nav-link-3d">All Books</a>
                    <a href="/community" className="nav-link-3d">Community</a>
                    <a href="/contact" className="nav-link-3d">Contact</a>
                </div>

                <div className="user-actions">
                    {isLoggedIn ? (
                        <div className="relative">
                            <button 
                                onClick={() => setDropdownOpen(!isDropdownOpen)} 
                                className="avatar-btn-3d"
                            >
                                A {/* Placeholder for user initial or avatar image */}
                            </button>
                            {isDropdownOpen && (
                                <div className="dropdown-menu-3d">
                                    <a href="/dashboard">Dashboard</a>
                                    <a href="/profile">Profile</a>
                                    <a href="/settings">Settings</a>
                                    <div className="separator-3d"></div>
                                    <a href="/logout">Sign Out</a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <a href="/login" className="signin-btn-3d">Sign In</a>
                            <a href="/login?action=signup" className="signup-btn-3d">Sign Up</a>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
