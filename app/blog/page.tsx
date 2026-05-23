import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import BlogPostCard from "@/components/ui/BlogPostCard";
import { TbArrowLeft, TbArrowRight } from "react-icons/tb";

export const metadata: Metadata = {
  title: "Блог • SofiaVital",
  description:
    "Анализи, данни и съвети за живот в Sofia. Кои райони са най-добри, как работи spatial scoring-ът, и всичко за качеството на живот в столицата.",
  alternates: { canonical: "https://sofiavital.bg/blog" },
  openGraph: {
    title:       "Блог • SofiaVital",
    description: "Анализи и данни за живота в Sofia.",
    type:        "website",
    url:         "https://sofiavital.bg/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "SofiaVital Блог",
    description: "Анализи и данни за качеството на живот в Sofia",
    url: "https://sofiavital.bg/blog",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
      url: `https://sofiavital.bg/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <div style={{
        background: "#03070f", minHeight: "100vh",
        fontFamily: "var(--font-body)", color: "#e8f0fe",
      }}>

        {/* ── Nav ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(3,7,15,0.92)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid #0f1e32",
          padding: "0 clamp(16px, 4vw, 40px)",
          height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <TbArrowLeft size={15} color="#7a9ab8" />
            <span style={{
              fontFamily: "Greengoth, 'Syne', sans-serif",
              fontSize: 18, fontWeight: 900, color: "#fff",
            }}>
              Sofia<span style={{ color: "#34d399" }}>Vital</span>
            </span>
          </Link>
          <Link href="/map" style={{
            fontSize: 12, fontWeight: 700, color: "#022c22",
            background: "linear-gradient(135deg, #34d399, #059669)",
            padding: "6px 16px", borderRadius: 999, textDecoration: "none",
            fontFamily: "var(--font-body)",
          }}>
            Картата →
          </Link>
        </nav>

        {/* ── Hero ── */}
        <header style={{
          padding: "clamp(48px,8vw,96px) clamp(16px,4vw,40px) clamp(32px,5vw,64px)",
          maxWidth: 800, margin: "0 auto", textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 999, padding: "4px 14px", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#6ee7b7", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--font-display)" }}>
              Блог
            </span>
          </div>
          <h1 style={{
            fontFamily: "Greengoth, 'Syne', sans-serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 900, color: "#fff",
            letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.1,
          }}>
            Данни и анализи за Sofia
          </h1>
          <p style={{
            fontSize: "clamp(14px, 2vw, 17px)",
            color: "#7a9ab8", lineHeight: 1.7, maxWidth: 520, margin: "0 auto",
          }}>
            Задълбочени анализи на качеството на живот в столицата — базирани на реални данни от Sofiaplan.
          </p>
        </header>

        {/* ── Posts grid ── */}
        <main style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 40px) clamp(64px, 8vw, 120px)",
        }}>
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#3d5470", fontSize: 14 }}>Скоро — нови публикации.</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
              gap: 20,
            }}>
              {posts.map((post, i) => (
                <BlogPostCard
                  key={post.slug}
                  post={post}
                  featured={i === 0}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── CTA ── */}
        <section style={{
          borderTop: "1px solid #0f1e32",
          padding: "clamp(48px,6vw,80px) clamp(16px,4vw,40px)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 14, color: "#7a9ab8", marginBottom: 20 }}>
            Готов да намериш своя квартал?
          </p>
          <Link href="/map" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #34d399, #059669)",
            color: "#022c22", fontSize: 14, fontWeight: 700,
            fontFamily: "var(--font-display)",
            padding: "12px 28px", borderRadius: 999, textDecoration: "none",
            boxShadow: "0 0 40px rgba(52,211,153,0.2)",
          }}>
            Разгледай картата <TbArrowRight size={16} />
          </Link>
        </section>

        <footer style={{
          borderTop: "1px solid #0f1e32",
          padding: "24px clamp(16px,4vw,40px)",
          display: "flex", justifyContent: "center",
        }}>
          <span style={{ fontSize: 12, color: "#1f3350" }}>
            © {new Date().getFullYear()} SofiaVital · Данни: Sofiaplan · MIT
          </span>
        </footer>
      </div>
    </>
  );
}
