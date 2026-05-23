import fs   from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug:        string;
  title:       string;
  description: string;
  date:        string;
  author:      string;
  tags:        string[];
  image?:      string;
  readingTime: number;
}

export interface Post extends PostMeta {
  content: string;
}

// ── Get all posts sorted by date desc ─────────────────────────────────────────
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug    = file.replace(/\.(md|mdx)$/, "");
      const raw     = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug,
        title:       data.title       ?? "Untitled",
        description: data.description ?? "",
        date:        data.date        ?? "2024-01-01",
        author:      data.author      ?? "SofiaVital",
        tags:        data.tags        ?? [],
        image:       data.image,
        readingTime: data.readingTime ?? 3,
      } as PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ── Get single post by slug ────────────────────────────────────────────────────
export function getPost(slug: string): Post | null {
  const mdPath  = path.join(BLOG_DIR, `${slug}.md`);
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const filePath = fs.existsSync(mdPath) ? mdPath : fs.existsSync(mdxPath) ? mdxPath : null;

  if (!filePath) return null;

  const raw             = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title:       data.title       ?? "Untitled",
    description: data.description ?? "",
    date:        data.date        ?? "2024-01-01",
    author:      data.author      ?? "SofiaVital",
    tags:        data.tags        ?? [],
    image:       data.image,
    readingTime: data.readingTime ?? 3,
    content,
  };
}

// ── Get all slugs (for generateStaticParams) ───────────────────────────────────
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""));
}

// ── Format date in Bulgarian ───────────────────────────────────────────────────
export { formatDateBg } from "./dateUtils";
