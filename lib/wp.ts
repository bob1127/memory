// lib/wp.ts
import type { RequestInit } from "next/dist/server/web/spec-extension/request";

const WP_BASE = process.env.WC_URL;

if (!WP_BASE) {
  throw new Error("Missing WC_URL in .env.local");
}

function authHeaders(): Record<string, string> {
  const user = process.env.WP_USER;
  const pass = process.env.WP_APP_PASSWORD;
  if (!user || !pass) return {};
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

function mergeHeaders(initHeaders?: HeadersInit): Record<string, string> {
  if (!initHeaders) return {};
  if (initHeaders instanceof Headers) return Object.fromEntries(initHeaders.entries());
  if (Array.isArray(initHeaders)) return Object.fromEntries(initHeaders);
  return initHeaders;
}

export async function wpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${WP_BASE}${path}`, {
    ...init,
    headers: {
      ...mergeHeaders(init?.headers),
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP fetch failed ${res.status}: ${path}\n${text}`);
  }

  return res.json() as Promise<T>;
}

export type WPPostCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image?: string | null;
  date?: string | null;
};

export async function getAllPostsForCards(): Promise<WPPostCard[]> {
  const perPage = 100;
  let page = 1;
  const all: any[] = [];

  while (true) {
    const batch = await wpFetch<any[]>(
      `/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=1`
    );
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return all.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p?.title?.rendered ?? "",
    excerpt: p?.excerpt?.rendered ?? "",
    image: p?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    date: p?.date ?? null,
  }));
}

// ✅ 這個就是你紅線的關鍵：確保它存在、且是 named export
export async function getPostBySlug(slug: string) {
  const arr = await wpFetch<any[]>(
    `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`
  );
  return arr?.[0] ?? null;
}
