import Link from "next/link";
import { getManagedProposals } from "@/lib/server/managed-proposal-store";

export default async function ProposalsPage() {
  const proposals = await getManagedProposals();
  const published = proposals.filter((proposal) => proposal.status === "published");

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top,#1d170b 0%,#0b0b0b 48%,#000 100%)", color: "#f5f0e8", padding: "2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#d4af37", marginBottom: "0.8rem" }}>Published Proposals</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 300, marginBottom: "2rem" }}>Dynamic Proposal Library</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "1rem" }}>
          {published.map((proposal) => (
            <Link key={proposal.id} href={`/proposal?managed=${encodeURIComponent(proposal.slug)}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ height: 180, background: proposal.coverImage ? `linear-gradient(rgba(8,6,4,0.18), rgba(8,6,4,0.72)), url(${proposal.coverImage}) center/cover` : "linear-gradient(135deg,#241b14,#b58a2a,#1a130d)" }} />
                <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
                  <p style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>{proposal.proposalType}</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 400, marginBottom: "0.35rem" }}>{proposal.title}</h2>
                  <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.58)" }}>/{proposal.slug}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
