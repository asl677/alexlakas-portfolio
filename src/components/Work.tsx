"use client";

import { useState } from "react";

interface Project {
  id: string;
  company: string;
  title: string;
  year: string;
  tags: string[];
  description: string;
  accent: string;
}

const projects: Project[] = [
  {
    id: "514",
    company: "514 / fiveonefour",
    title: "AI-Native Product Platform",
    year: "2023–Now",
    tags: ["Product Design", "Systems", "Gen AI"],
    description:
      "Building the design system and core product experiences for 514's AI-native platform. Led end-to-end design across onboarding, core loops, and identity — contributing to a $17M raise.",
    accent: "#ff1111",
  },
  {
    id: "linkedin",
    company: "LinkedIn",
    title: "Content Experience — Home Feed, Polls & Bookings",
    year: "2019–2022",
    tags: ["Product Design", "Content", "Prototyping"],
    description:
      "Led the redesign of LinkedIn's home feed content experience. Shipped polls, live video, and the bookings feature used by millions of professionals globally.",
    accent: "#0077b5",
  },
  {
    id: "google-maps",
    company: "Google",
    title: "Local Search & SMB Ecosystem",
    year: "2013–2019",
    tags: ["Product Design", "Maps", "Local"],
    description:
      "Merged Google+ and Maps in 2013 to form the first SMB ecosystem. Shipped Live Popular Times (featured on The Tonight Show), restaurant wait times, salon bookings, and modernized local search for domestic and emerging markets.",
    accent: "#4285f4",
  },
  {
    id: "peanut",
    company: "Insured Nomads × Peanut",
    title: "Peanut Browser Extension",
    year: "2022",
    tags: ["Product Design", "Identity", "Extension"],
    description:
      "Designed the Peanut browser extension acquired by Insured Nomads. End-to-end design from concept to acquisition — brand identity, UX, and visual system.",
    accent: "#f5a623",
  },
  {
    id: "culprit",
    company: "Culprit Underwear",
    title: "Brand & E-commerce Experience",
    year: "2018–2019",
    tags: ["Art Direction", "Identity", "E-commerce"],
    description:
      "Full art direction and e-commerce experience design for Culprit Underwear. Built the visual identity and digital shopping experience from the ground up.",
    accent: "#e8e8e8",
  },
];

function ProjectRow({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group border-b border-white/[0.06] py-8 cursor-default transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-space-mono uppercase tracking-widest transition-colors duration-300"
              style={{ color: hovered ? project.accent : "rgba(255,255,255,0.3)" }}
            >
              {project.company}
            </span>
            <span className="text-xs font-space-mono text-white/20">
              {project.year}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-space-grotesk font-semibold text-white group-hover:text-white/90 transition-colors mb-3">
            {project.title}
          </h3>

          <p
            className="text-sm font-inter text-white/40 leading-relaxed max-w-2xl transition-all duration-500 overflow-hidden"
            style={{
              maxHeight: hovered ? "120px" : "0",
              opacity: hovered ? 1 : 0,
            }}
          >
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end max-w-xs shrink-0 mt-1">
          {project.tags.map((t) => (
            <span
              key={t}
              className="text-xs font-space-mono border border-white/10 rounded-full px-2.5 py-0.5 text-white/30"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Work() {
  return (
    <section id="work" className="px-6 py-24 max-w-5xl mx-auto">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          002
        </span>
        <span className="block flex-1 h-px bg-white/10" />
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          Work
        </span>
      </div>

      <div className="border-t border-white/[0.06]">
        {projects.map((p) => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
