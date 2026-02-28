"use client";

const items = [
  "Art Direction",
  "Product Design",
  "Prototyping",
  "Systems Design",
  "Identity",
  "Gen AI",
  "Mentorship",
  "Interactive",
  "Animation",
  "Web Dev",
];

export default function MarqueeBanner() {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-4 my-0">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 px-6 text-xs font-space-mono text-white/20 uppercase tracking-widest whitespace-nowrap"
          >
            {item}
            <span className="text-[#ff1111]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
