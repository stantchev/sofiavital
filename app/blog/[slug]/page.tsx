import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Link              from "next/link";
import { MDXRemote }     from "next-mdx-remote/rsc";
import { getPost, getAllSlugs, formatDateBg } from "@/lib/blog";
import { TbArrowLeft, TbClock, TbTag, TbArrowRight, TbCalendar } from "react-icons/tb";

// ── Static params ──────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ── Metadata ───────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post     = getPost(slug);
  if (!post) return { title: "Не е намерено • SofiaVital" };

  return {
    title:       `${post.title} • SofiaVital`,
    description: post.description,
    alternates:  { canonical: `https://sofiavital.bg/blog/${slug}` },
    openGraph: {
      title:         post.title,
      description:   post.description,
      type:          "article",
      url:           `https://sofiavital.bg/blog/${slug}`,
      publishedTime: post.date,
      authors:       [post.author],
      tags:          post.tags,
      images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: post.description,
    },
  };
}

// ── Tag colors ─────────────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  "класация": "#34d399", "райони": "#a78bfa", "качество на живот": "#60a5fa",
  "квартали": "#fbbf24", "spatial анализ": "#f472b6", "въздух": "#38bdf8",
  "замърсяване": "#fb923c", "здраве": "#4ade80", "технология": "#818cf8",
  "данни": "#34d399", "sofia": "#e2e8f0",
};
const tagColor = (t: string) => TAG_COLORS[t.toLowerCase()] ?? "#3d5470";

// ── MDX custom components ──────────────────────────────────────────────────────
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} style={{
      fontFamily: "Greengoth, 'Syne', sans-serif",
      fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900,
      color: "#e8f0fe", letterSpacing: "-0.02em",
      margin: "0 0 24px", lineHeight: 1.15,
    }} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} style={{
      fontFamily: "Greengoth, 'Syne', sans-serif",
      fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 900,
      color: "#e8f0fe", letterSpacing: "-0.01em",
      margin: "48px 0 16px", lineHeight: 1.2,
      borderBottom: "1px solid #0f1e32", paddingBottom: 12,
    }} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} style={{
      fontFamily: "var(--font-display)",
      fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 700,
      color: "#34d399", margin: "32px 0 10px", lineHeight: 1.3,
    }} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} style={{
      fontSize: "clamp(14px, 1.8vw, 16px)",
      color: "#a8c0d6", lineHeight: 1.8,
      margin: "0 0 18px",
    }} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} style={{
      color: "#34d399", textDecoration: "underline",
      textDecorationColor: "rgba(52,211,153,0.3)",
      textUnderlineOffset: 3,
      transition: "text-decoration-color 0.15s",
    }} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} style={{
      paddingLeft: "1.4em", margin: "0 0 18px",
      listStyleType: "none",
    }} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} style={{
      paddingLeft: "1.4em", margin: "0 0 18px",
    }} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} style={{
      fontSize: "clamp(14px, 1.8vw, 16px)",
      color: "#a8c0d6", lineHeight: 1.75,
      marginBottom: 6, position: "relative",
      paddingLeft: "1.2em",
    }}>
      <span style={{
        position: "absolute", left: 0,
        color: "#34d399", fontWeight: 700,
      }}>›</span>
      {props.children}
    </li>
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} style={{
      borderLeft: "3px solid #34d399",
      margin: "24px 0", padding: "12px 20px",
      background: "rgba(52,211,153,0.05)",
      borderRadius: "0 10px 10px 0",
      fontStyle: "italic", color: "#6ee7b7",
      fontSize: "clamp(14px, 1.8vw, 16px)",
    }} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code {...props} style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "0.88em",
      background: "#0a1525", color: "#34d399",
      padding: "2px 7px", borderRadius: 5,
      border: "1px solid #0f1e32",
    }} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre {...props} style={{
      background: "#050d1a",
      border: "1px solid #0f1e32",
      borderRadius: 12, padding: "20px 24px",
      overflowX: "auto", margin: "24px 0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "clamp(12px, 1.5vw, 13px)",
      lineHeight: 1.7, color: "#7a9ab8",
    }} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div style={{ overflowX: "auto", margin: "24px 0" }}>
      <table {...props} style={{
        width: "100%", borderCollapse: "collapse",
        fontSize: "clamp(12px, 1.6vw, 14px)", color: "#a8c0d6",
      }} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} style={{
      padding: "10px 14px", textAlign: "left",
      background: "#070d1a",
      borderBottom: "1px solid #1a2d47",
      color: "#34d399", fontWeight: 600, fontSize: 12,
      textTransform: "uppercase", letterSpacing: 0.8,
      fontFamily: "var(--font-display)",
      whiteSpace: "nowrap",
    }} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} style={{
      padding: "10px 14px",
      borderBottom: "1px solid #0a1525",
      verticalAlign: "top",
    }} />
  ),
  hr: () => (
    <hr style={{
      border: "none", borderTop: "1px solid #0f1e32",
      margin: "40px 0",
    }} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} style={{ color: "#e8f0fe", fontWeight: 700 }} />
  ),
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post     = getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context":      "https://schema.org",
    "@type":         "BlogPosting",
    headline:        post.title,
    description:     post.description,
    datePublished:   post.date,
    dateModified:    post.date,
    author:          { "@type": "Organization", name: post.author, url: "https://sofiavital.bg" },
    publisher:       { "@type": "Organization", name: "SofiaVital", url: "https://sofiavital.bg" },
    url:             `https://sofiavital.bg/blog/${slug}`,
    keywords:        post.tags.join(", "),
    inLanguage:      "bg",
    ...(post.image ? { image: { "@type": "ImageObject", url: post.image } } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: "Greengoth, 'Syne', sans-serif", fontSize: 17, fontWeight: 900, color: "#fff" }}>
                Sofia<span style={{ color: "#34d399" }}>Vital</span>
              </span>
            </Link>
            <span style={{ color: "#1a2d47" }}>/</span>
            <Link href="/blog" style={{ fontSize: 12, color: "#7a9ab8", textDecoration: "none" }}>
              Блог
            </Link>
          </div>
          <Link href="/map" style={{
            fontSize: 11, fontWeight: 700, color: "#022c22",
            background: "linear-gradient(135deg, #34d399, #059669)",
            padding: "6px 14px", borderRadius: 999, textDecoration: "none",
          }}>
            Картата →
          </Link>
        </nav>

        {/* ── Article ── */}
        <article style={{
          maxWidth: 720, margin: "0 auto",
          padding: "clamp(32px,6vw,80px) clamp(16px,4vw,40px)",
        }}>

          {/* Back */}
          <Link href="/blog" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#7a9ab8", textDecoration: "none",
            marginBottom: 32, transition: "color 0.15s",
          }}>
            <TbArrowLeft size={13} />
            Всички публикации
          </Link>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, padding: "3px 10px", borderRadius: 999,
                background: `${tagColor(tag)}15`,
                border:     `1px solid ${tagColor(tag)}30`,
                color:      tagColor(tag),
              }}>
                <TbTag size={9} />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "Greengoth, 'Syne', sans-serif",
            fontSize: "clamp(24px, 4.5vw, 44px)",
            fontWeight: 900, color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.1, margin: "0 0 16px",
          }}>
            {post.title}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#7a9ab8", lineHeight: 1.65,
            margin: "0 0 24px",
          }}>
            {post.description}
          </p>

          {/* Meta */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
            padding: "14px 18px",
            background: "rgba(7,13,26,0.8)",
            border: "1px solid #0f1e32", borderRadius: 10,
            marginBottom: 48,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7a9ab8" }}>
              <TbCalendar size={13} color="#34d399" />
              {formatDateBg(post.date)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7a9ab8" }}>
              <TbClock size={13} color="#34d399" />
              {post.readingTime} мин. четене
            </div>
            <div style={{ fontSize: 12, color: "#7a9ab8" }}>
              от <span style={{ color: "#e8f0fe" }}>{post.author}</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ lineHeight: 1.8 }}>
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 64, padding: "32px 28px",
            background: "linear-gradient(135deg, #070d1a, #0a1525)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 16, textAlign: "center",
          }}>
            <p style={{ fontSize: 16, color: "#7a9ab8", marginBottom: 20, lineHeight: 1.6 }}>
              Разгледай интерактивната карта и намери своя идеален квартал
            </p>
            <Link href="/map" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #34d399, #059669)",
              color: "#022c22", fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-display)",
              padding: "12px 28px", borderRadius: 999, textDecoration: "none",
              boxShadow: "0 0 40px rgba(52,211,153,0.2)",
            }}>
              Отвори картата <TbArrowRight size={16} />
            </Link>
          </div>

          {/* Back link */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #0f1e32" }}>
            <Link href="/blog" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "#7a9ab8", textDecoration: "none",
            }}>
              <TbArrowLeft size={14} />
              Всички публикации
            </Link>
          </div>
        </article>

        <footer style={{
          borderTop: "1px solid #0f1e32",
          padding: "24px clamp(16px,4vw,40px)",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 12, color: "#1f3350" }}>
            © {new Date().getFullYear()} SofiaVital · MIT License
          </span>
        </footer>
      </div>
    </>
  );
}
