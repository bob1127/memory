// pages/blog/index.tsx
import Layout from "../Layout"; // 依你的路徑調整
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  motion,
  AnimatePresence,
  LazyMotion,
  domAnimation,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

import { getAllPostsForCards, type WPPostCard } from "@/lib/wp";

const PAGE_TRANSLATIONS: Record<string, any> = {
  "zh-TW": { prev: "上一頁", next: "下一頁", home: "首頁", news: "品牌動態" },
  en: { prev: "Prev", next: "Next", home: "Home", news: "News" },
};

const PAGE_SIZE = 8;
const spring = { type: "spring", stiffness: 70, damping: 22, mass: 0.9 };

const listVariants = (reduce: boolean) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: reduce ? 0 : 0.085,
      delayChildren: reduce ? 0 : 0.04,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
});

const cardVariants = {
  hidden: { opacity: 0, y: 96, filter: "blur(10px)", scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { ...spring },
  },
};

function stripHtml(html: string) {
  return (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(s: string, n: number) {
  const t = (s || "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// ✅ JSON-LD helpers
function buildBreadcrumbJsonLd({
  siteUrl,
  homeName,
  newsName,
  locale,
}: {
  siteUrl: string;
  homeName: string;
  newsName: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: newsName,
        item: `${siteUrl}/blog`,
      },
    ],
    inLanguage: locale,
  };
}

function buildBlogJsonLd({
  siteUrl,
  pageUrl,
  title,
  description,
  posts,
  locale,
}: {
  siteUrl: string;
  pageUrl: string;
  title: string;
  description: string;
  posts: WPPostCard[];
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: title,
    description,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      url: siteUrl,
    },
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: stripHtml(p.title),
      url: `${siteUrl}/blog/${p.slug}`,
      datePublished: p.date ?? undefined,
      image: p.image ? [p.image] : undefined,
      description: p.excerpt ? clamp(stripHtml(p.excerpt), 180) : undefined,
    })),
  };
}

export async function getStaticProps() {
  const posts = await getAllPostsForCards();
  return {
    props: { posts },
    revalidate: 60,
  };
}

export default function BlogIndex({ posts }: { posts: WPPostCard[] }) {
  const router = useRouter();
  const { locale } = router;

  const t = PAGE_TRANSLATIONS[locale as string] || PAGE_TRANSLATIONS["zh-TW"];
  const reduce = useReducedMotion();

  // ✅ SEO/分頁：從 query 讀 page，並同步 state
  const pageFromQuery = useMemo(() => {
    const q = router.query?.page;
    const n = typeof q === "string" ? parseInt(q, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [router.query?.page]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(pageFromQuery);
  }, [pageFromQuery]);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  // 切換頁面或語言時，滾動到頂部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, locale]);

  const currentItems = useMemo(() => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return posts.slice(start, start + PAGE_SIZE);
  }, [page, posts, totalPages]);

  const MotionLink = motion(Link);

  // ✅ SEO base
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageUrl =
    safePage > 1 ? `${siteUrl}/blog?page=${safePage}` : `${siteUrl}/blog`;

  const title = safePage > 1 ? `${t.news} - ${safePage}` : `${t.news}`;
  const description =
    locale === "en"
      ? "Latest updates and brand news."
      : "最新品牌動態與公告資訊。";

  const ogImage = currentItems?.[0]?.image || `${siteUrl}/images/news-01.jpg`; 

  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    siteUrl,
    homeName: t.home,
    newsName: t.news,
    locale: (locale as string) || "zh-TW",
  });

  const blogJsonLd = buildBlogJsonLd({
    siteUrl,
    pageUrl,
    title: t.news,
    description,
    posts: currentItems,
    locale: (locale as string) || "zh-TW",
  });

  function goToPage(nextPage: number) {
    const p = Math.min(Math.max(1, nextPage), totalPages);
    // ✅ push query，讓每一頁有自己的 URL（SEO 需要）
    router.push(
      { pathname: "/blog", query: p > 1 ? { page: String(p) } : {} },
      undefined,
      { shallow: true, scroll: false }
    );
  }

  // 🔹 修正重點：定義切換語言時的連結
  // 如果當前在第 2 頁，切換語言時也要保留在第 2 頁
  const customSwitchLink = safePage > 1 ? `/blog?page=${safePage}` : "/blog";

  return (
    // 🔹 修正重點：傳入 customSwitchLink 屬性
    <Layout customSwitchLink={customSwitchLink}>
      <Head>
        {/* ✅ 基本 SEO */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index,follow,max-image-preview:large" />

        {/* ✅ Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={t.news} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

        {/* ✅ 分頁 SEO：prev/next */}
        {safePage > 1 ? (
          <link
            rel="prev"
            href={
              safePage - 1 === 1
                ? `${siteUrl}/blog`
                : `${siteUrl}/blog?page=${safePage - 1}`
            }
          />
        ) : null}
        {safePage < totalPages ? (
          <link rel="next" href={`${siteUrl}/blog?page=${safePage + 1}`} />
        ) : null}

        {/* ✅ JSON-LD 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      </Head>

      <LazyMotion features={domAnimation}>
        <MotionConfig transition={spring} reducedMotion="user">
          <section className="py-[120px] bg-[#ede5d6]">
            {/* 麵包屑導覽 */}
            <div className="mx-auto w-full md:w-[90%] px-5 xl:w-[85%] max-w-[1400px] mb-8">
              <nav className="flex items-center text-sm text-gray-500 font-medium">
                <Link
                  href="/"
                  className="hover:text-black text-[18px] transition-colors"
                >
                  {t.home}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-black cursor-default text-[18px] ">
                  {t.news}
                </span>
              </nav>
            </div>

            <div
              className="mx-auto w-full md:w-[90%] px-5 xl:w-[85%] max-w-[1400px]
                         grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${safePage}-lang-${locale}`}
                  className="contents"
                  variants={listVariants(!!reduce)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {currentItems.map((n, i) => {
                    const titleText = stripHtml(n.title);
                    return (
                      <MotionLink
                        href={`/blog/${n.slug}`}
                        key={`${n.id}-${safePage}-${i}-lang-${locale}`}
                        className="block will-change-transform"
                        whileTap={{ scale: 0.98 }}
                        style={{ transform: "translateZ(0)" }}
                        layout
                      >
                        <motion.article
                          layout
                          variants={cardVariants}
                          className="flex flex-col"
                          style={{
                            backfaceVisibility: "hidden",
                            WebkitFontSmoothing: "antialiased",
                            willChange: "transform, opacity, filter",
                          }}
                        >
                          <div className="relative aspect-[1/1] border-2 border-black overflow-hidden">
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={spring}
                              className="w-full h-full"
                            >
                              <Image
                                src={n.image || "/images/news-01.jpg"}
                                alt={titleText}
                                fill
                                className="object-cover w-full"
                                sizes="(max-width: 1024px) 50vw, 25vw"
                                priority={i < 4}
                              />
                            </motion.div>
                          </div>

                          <div className="pt-1">
                            <div className="px-3 py-5">
                              <h2 className="text-[24px] font-medium leading-tight text-black">
                                {titleText}
                              </h2>
                            </div>
                          </div>
                        </motion.article>
                      </MotionLink>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={goToPage}
              t={t}
            />
          </section>
        </MotionConfig>
      </LazyMotion>
    </Layout>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
  t,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  t: any;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const range = (s: number, e: number) => {
    for (let i = s; i <= e; i++) pages.push(i);
  };

  if (totalPages <= 7) {
    range(1, totalPages);
  } else {
    const l = Math.max(2, page - 1);
    const r = Math.min(totalPages - 1, page + 1);
    pages.push(1);
    if (l > 2) pages.push("...");
    range(l, r);
    if (r < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  const itemBase =
    "inline-flex items-center justify-center min-w-9 h-9 rounded-full text-sm transition select-none";
  const btnBase =
    "px-3 h-9 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm";

  return (
    <div className="mt-10 flex flex-wrap gap-2 justify-center">
      <motion.button
        className={btnBase}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label={t.prev}
        whileTap={{ scale: 0.96 }}
      >
        {t.prev}
      </motion.button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="inline-flex items-center justify-center w-9 h-9 text-gray-400"
          >
            …
          </span>
        ) : (
          <motion.button
            key={`p-${p}`}
            onClick={() => onChange(p as number)}
            aria-current={p === page ? "page" : undefined}
            whileTap={{ scale: 0.96 }}
            className={[
              itemBase,
              p === page
                ? "bg-black text-white"
                : "border border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {p}
          </motion.button>
        )
      )}

      <motion.button
        className={btnBase}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label={t.next}
        whileTap={{ scale: 0.96 }}
      >
        {t.next}
      </motion.button>
    </div>
  );
}