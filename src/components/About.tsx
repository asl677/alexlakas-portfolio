"use client";

const skills = [
  "Art Direction",
  "Product Design",
  "Prototyping",
  "Mentorship",
  "Systems Design",
  "Identity",
  "Gen AI",
];

const companies = [
  { name: "514", href: "https://fiveonefour.com" },
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "Google", href: "https://google.com" },
  { name: "Culprit", href: "#" },
  { name: "Ueno", href: "#" },
  { name: "Method", href: "#" },
  { name: "Journeys", href: "#" },
  { name: "Zippo", href: "#" },
  { name: "Converse", href: "#" },
];

export default function About() {
  return (
    <section id="about" className="px-6 py-24 max-w-5xl mx-auto">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          001
        </span>
        <span className="block flex-1 h-px bg-white/10" />
        <span className="text-xs font-space-mono text-white/30 uppercase tracking-widest">
          About
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Bio */}
        <div>
          <p className="text-lg font-inter font-semibold leading-relaxed text-white/90 mb-6">
            Starting in illustration, animation, web dev, and interactive design
            before moving into Bay Area tech.
          </p>
          <p className="text-base font-inter font-normal leading-relaxed text-white/50 mb-6">
            I merged Google+ and Maps in 2013 to form the first SMB ecosystem
            serving domestic and emerging markets — work that ended up on The
            Tonight Show. From there, I led content experiences at LinkedIn
            including home feed, polls, and bookings.
          </p>
          <p className="text-base font-inter font-normal leading-relaxed text-white/50">
            Currently building at{" "}
            <a
              href="https://fiveonefour.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white border-b border-[#ff1111] hover:text-[#ff1111] transition-colors"
            >
              514
            </a>
            , a company that just raised $17M. Based in Los Angeles.
          </p>
        </div>

        {/* Skills + Companies */}
        <div className="space-y-12">
          {/* Skills */}
          <div>
            <h3 className="text-xs font-space-mono text-white/30 uppercase tracking-widest mb-4">
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-xs font-space-mono border border-white/10 rounded-full px-3 py-1 text-white/60 hover:border-[#ff1111] hover:text-[#ff1111] transition-colors cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Companies */}
          <div>
            <h3 className="text-xs font-space-mono text-white/30 uppercase tracking-widest mb-4">
              Past &amp; Present
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {companies.map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-inter text-white/50 hover:text-white transition-colors"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
