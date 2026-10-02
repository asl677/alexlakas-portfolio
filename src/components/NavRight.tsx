"use client";

interface NavRightProps {
  onLifeClick: () => void;
}

export default function NavRight({ onLifeClick }: NavRightProps) {
  return (
    <>
      {/* Cases — top-right */}
      <div className="nav-right">
        <div className="inner-nav">
          <a
            href="https://alexslakas.medium.com"
            className="link enabled"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="base">Cases</p>
            <div className="link-strip" />
          </a>
        </div>
      </div>
    </>
  );
}
