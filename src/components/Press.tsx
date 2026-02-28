"use client";

const pressItems = [
  {
    headline: "514 raises $17M",
    outlet: "TechCrunch",
    year: "2024",
    href: "https://fiveonefour.com",
  },
  {
    headline: "Insured Nomads acquires Peanut",
    outlet: "Insured Nomads",
    year: "2023",
    href: "#",
  },
  {
    headline: "Do I need a covid test to travel",
    outlet: "Forbes",
    year: "2021",
    href: "#",
  },
  {
    headline: "LinkedIn adds polls and live video",
    outlet: "TechCrunch",
    year: "2020",
    href: "#",
  },
  {
    headline: "Live Popular Times — The Tonight Show",
    outlet: "NBC",
    year: "2018",
    href: "#",
  },
  {
    headline: "Google can tell you how busy places are",
    outlet: "The Verge",
    year: "2017",
    href: "#",
  },
  {
    headline: "Google to add restaurant wait times",
    outlet: "Bloomberg",
    year: "2016",
    href: "#",
  },
  {
    headline: "Google adds bookings and salons to Maps",
    outlet: "Wired",
    year: "2015",
    href: "#",
  },
];

export default function Press() {
  return (
    <section id="press" className="px-6 py-24 max-w-5xl mx-auto">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          003
        </span>
        <span className="block flex-1 h-px bg-white/10" />
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          Press
        </span>
      </div>

      <div className="space-y-0 border-t border-white/[0.06]">
        {pressItems.map((item, i) => (
          <a
            key={i}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between py-5 border-b border-white/[0.06] hover:border-[#ff1111]/30 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-space-mono text-white/20 w-8 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-base font-inter text-white/70 group-hover:text-white transition-colors duration-200">
                {item.headline}
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs font-space-mono text-white/30 hidden sm:block">
                {item.outlet}
              </span>
              <span className="text-xs font-space-mono text-white/20">
                {item.year}
              </span>
              <span className="text-white/20 group-hover:text-[#ff1111] transition-colors duration-200">
                ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
