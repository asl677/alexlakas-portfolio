"use client";

const col1 = [
  { label: "Alex Lakas", href: "/", enabled: true },
  { label: "Los Angeles", href: "#", enabled: false },
];

const col2 = [
  { label: "F45", href: "https://f45training.com", enabled: true, external: true },
  { label: "514", href: "https://fiveonefour.com", enabled: true, external: true },
  { label: "Povio", href: "https://www.povio.com", enabled: true, external: true },
  { label: "Culprit", href: "https://www.youtube.com/watch?v=0OScZ_93-_0", enabled: true, external: true },
  { label: "Peanut", href: "https://www.producthunt.com/products/peanut-for-chrome/launches", enabled: true, external: true },
  { label: "Linkedin", href: "https://linkedin.com", enabled: true, external: true },
  { label: "Google", href: "https://google.com", enabled: true, external: true },
  { label: "Ueno", href: "https://ueno.co", enabled: true, external: true },
  { label: "Journeys", href: "https://www.journeys.com", enabled: true, external: true },
  { label: "Zippo", href: "https://www.zippo.com", enabled: true, external: true },
  { label: "Nintendo", href: "https://www.nintendo.com", enabled: true, external: true },
  { label: "Converse", href: "https://www.converse.com", enabled: true, external: true },
];

const col3 = [
  { label: "Art Direction", href: "#", enabled: false },
  { label: "Product Design", href: "#", enabled: false },
  { label: "Prototyping", href: "#", enabled: false },
  { label: "Systems", href: "#", enabled: false },
  { label: "Identity", href: "#", enabled: false },
  { label: "Gen AI", href: "#", enabled: false },
];

function NavLink({
  label,
  href,
  enabled,
  external,
}: {
  label: string;
  href: string;
  enabled: boolean;
  external?: boolean;
}) {
  if (!enabled) {
    return (
      <span className="link disabled">
        <p className="base">{label}</p>
        <div className="link-strip" />
      </span>
    );
  }
  return (
    <a
      href={href}
      className="link enabled"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <p className="base">{label}</p>
      <div className="link-strip" />
    </a>
  );
}

export default function NavLeft() {
  return (
    <nav className="nav-left">
      <div className="inner-nav nav-left-primary">
        {col1.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </div>
      <div className="inner-nav nav-left-cases">
        {col2.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </div>
      <div className="inner-nav nav-left-services">
        {col3.map((item) => (
          <NavLink key={item.label} {...item} />
        ))}
      </div>
    </nav>
  );
}
