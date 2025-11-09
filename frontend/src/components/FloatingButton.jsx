import React, { useState, useEffect, useRef } from 'react';
import '../style/floatingbutton.css';

export default function FloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="floating-button-container-3d" ref={buttonRef}>
            <div className={`drop-up-menu-3d ${isOpen ? 'show' : ''}`}>
                <a href="#genres">Genres</a>
                <a href="#categories">Categories</a>
                <a href="#authors">Authors</a>
            </div>
            <button
                className="floating-button-3d"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Toggle Explore Menu"
            >
                {isOpen ? '✕' : '⚡'}
            </button>
        </div>
    );
}
