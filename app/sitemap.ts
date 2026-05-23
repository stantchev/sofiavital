import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://sofiavital.bg";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: SITE_URL,              lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/map`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/blog`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    ...posts.map((p) => ({
      url:             `${SITE_URL}/blog/${p.slug}`,
      lastModified:    new Date(p.date),
      changeFrequency: "monthly" as const,
      priority:        0.7,
    })),
  ];
}
