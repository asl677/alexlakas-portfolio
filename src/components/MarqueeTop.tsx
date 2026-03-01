"use client";

// Doubled for seamless loop — original text, no separators
const text = "Forbes  TechCrunch  Tonight Show  ";
const doubled = text + text;

export default function MarqueeTop() {
  return (
    <div className="marquee-fixed">
      <div className="marquee-inner">
        <div className="marquee-clip">
          <span className="marquee-track">{doubled}</span>
        </div>
      </div>
    </div>
  );
}
