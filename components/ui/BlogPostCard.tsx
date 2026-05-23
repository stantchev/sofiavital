"use client";

import Link from "next/link";
import { TbTag, TbClock, TbArrowRight } from "react-icons/tb";
import { formatDateBg } from "@/lib/dateUtils";
import type { PostMeta } from "@/lib/blog";

const TAG_COLORS: Record<string, string> = {
  "класация": "#34d399", "райони": "#a78bfa", "качество на живот": "#60a5fa",
  "квартали": "#fbbf24", "spatial анализ": "#f472b6", "въздух": "#38bdf8",
  "замърсяване": "#fb923c", "здраве": "#4ade80", "технология": "#818cf8",
  "данни": "#34d399", "sofia": "#e2e8f0",
};
const tagColor = (t: string) => TAG_COLORS[t.toLowerCase()] ?? "#3d5470";

interface Props {
  post: PostMeta;
  featured?: boolean;
}

export default function BlogPostCard({ post, featured }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "linear-gradient(135deg, #070d1a 0%, #0a1525 100%)",
          border: "1px solid #0f1e32",
          borderRadius: 16,
          padding: "28px 26px",
          height: "100%",
          display: "flex", flexDirection: "column", gap: 14,
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(52,211,153,0.3)";
          el.style.transform   = "translateY(-4px)";
          el.style.boxShadow   = "0 20px 48px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "#0f1e32";
          el.style.transform   = "none";
          el.style.boxShadow   = "none";
        }}
      >
        {featured && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 999, padding: "3px 10px", width: "fit-content",
          }}>
            <span style={{ fontSize: 9, color: "#34d399", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--font-display)" }}>
              Ново
            </span>
          </div>
        )}

        <h2 style={{
          fontFamily: "Greengoth, 'Syne', sans-serif",
          fontSize: "clamp(16px, 2vw, 19px)",
          fontWeight: 900, color: "#e8f0fe",
          letterSpacing: "-0.01em", lineHeight: 1.2, margin: 0,
        }}>
          {post.title}
        </h2>

        <p style={{
          fontSize: 13, color: "#7a9ab8", lineHeight: 1.65,
          margin: 0, flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {post.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {post.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, padding: "3px 9px", borderRadius: 999,
              background: `${tagColor(tag)}15`,
              border: `1px solid ${tagColor(tag)}30`,
              color: tagColor(tag),
              fontFamily: "var(--font-body)",
            }}>
              <TbTag size={9} />
              {tag}
            </span>
          ))}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid #0f1e32", paddingTop: 14,
        }}>
          <span style={{ fontSize: 11, color: "#3d5470" }}>
            {formatDateBg(post.date)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#3d5470" }}>
            <TbClock size={11} />
            {post.readingTime} мин.
          </span>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, color: "#34d399", fontWeight: 600,
          fontFamily: "var(--font-body)",
        }}>
          Прочети <TbArrowRight size={13} />
        </div>
      </article>
    </Link>
  );
}
