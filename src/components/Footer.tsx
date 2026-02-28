export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] px-6 py-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs font-space-mono text-white/20">
          © {year} Alex Lakas
        </span>
        <div className="flex items-center gap-6">
          <span className="text-xs font-space-mono text-white/20">
            Product Designer
          </span>
          <span className="text-xs font-space-mono text-white/10">·</span>
          <span className="text-xs font-space-mono text-white/20">
            Los Angeles
          </span>
          <span className="text-xs font-space-mono text-white/10">·</span>
          <a
            href="mailto:alex.lakas@gmail.com"
            className="text-xs font-space-mono text-white/20 hover:text-[#ff1111] transition-colors"
          >
            alex.lakas@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
