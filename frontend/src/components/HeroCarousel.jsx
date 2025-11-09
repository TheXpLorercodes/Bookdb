import React, { useState, useEffect } from "react";
import "../style/HeroCarousel.css";

const slides = [
  { title: "Project Hail Mary", image: "https://picsum.photos/1920/700?1" },
  { title: "Dune", image: "https://picsum.photos/1920/700?2" },
  { title: "Circe", image: "https://picsum.photos/1920/700?3" }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((p) => (p + 1) % slides.length);
  const prevSlide = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-carousel">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${s.image})` }}
        />
      ))}

      {/* Arrows */}
      <button className="arrow left" onClick={prevSlide}>❮</button>
      <button className="arrow right" onClick={nextSlide}>❯</button>
    </div>
  );
}
