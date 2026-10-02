import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wiki-shell">
      <article className="wiki-article not-found-page">
        <h1>Page not found</h1>
        <p>The requested Alexipidia page does not exist.</p>
        <p>
          <Link href="/">Return to Alexipidia</Link>
        </p>
      </article>
    </main>
  );
}
