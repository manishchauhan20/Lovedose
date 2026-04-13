import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "linear-gradient(180deg, #120c08 0%, #050403 100%)",
        color: "#f5e7c2",
      }}
    >
      <section
        style={{
          width: "min(560px, 100%)",
          padding: "32px",
          borderRadius: "24px",
          border: "1px solid rgba(212,175,55,0.22)",
          background: "rgba(255,255,255,0.04)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "12px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(245,231,194,0.6)",
          }}
        >
          Page not found
        </p>
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "36px",
            lineHeight: 1.05,
            fontFamily: "var(--font-playfair, serif)",
            fontWeight: 600,
          }}
        >
          This page does not exist.
        </h1>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: "15px",
            lineHeight: 1.7,
            color: "rgba(245,231,194,0.78)",
          }}
        >
          Check the URL or return to the main experience.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            borderRadius: "999px",
            padding: "12px 18px",
            background: "#d4af37",
            color: "#120c08",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
