"use client";

interface NavRightProps {
  onLifeClick: () => void;
}

export default function NavRight({ onLifeClick }: NavRightProps) {
  return (
    <>
      {/* "Let's Go" — top-right */}
      <div className="nav-right">
        <div className="inner-nav">
          <a
            href="mailto:alex.lakas@gmail.com?subject=Let's%20collab"
            className="link enabled"
          >
            <p className="base">Let&apos;s Go</p>
            <div className="link-strip" />
          </a>
        </div>
      </div>
    </>
  );
}
