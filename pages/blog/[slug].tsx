import Head from "next/head";
import Layout from "../Layout"; // 依你專案路徑
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  LazyMotion,
  domAnimation,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";

import { getPostBySlug, getAllPostsForCards } from "../../lib/wp";

const UI = {
  "zh-TW": { home: "首頁", news: "品牌動態" },
  en: { home: "Home", news: "News" },
};

const spring = { type: "spring", stiffness: 70, damping: 22, mass: 0.9 };

export async function getStaticPaths() {
  const posts = await getAllPostsForCards();
  return {
    paths: posts.map((p: any) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: any) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { notFound: true };
  return { props: { post }, revalidate: 60 };
}

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

/**
 * ✅ 移除內容最前面「等於 featured image」的那張圖，避免封面重複
 */
function removeLeadingFeaturedImage(
  contentHtml: string,
  featuredUrl?: string | null
) {
  if (!contentHtml || !featuredUrl) return contentHtml;

  const featuredKey = featuredUrl.split("?")[0].split("/").pop();
  if (!featuredKey) return contentHtml;

  const figureRegex = new RegExp(
    `^\\s*<figure[\\s\\S]*?<img[^>]+src=["'][^"']*${escapeRegExp(
      featuredKey
    )}[^"']*["'][\\s\\S]*?<\\/figure>\\s*`,
    "i"
  );
  let out = contentHtml.replace(figureRegex, "");

  const pImgRegex = new RegExp(
    `^\\s*<p[\\s\\S]*?>\\s*<img[^>]+src=["'][^"']*${escapeRegExp(
      featuredKey
    )}[^"']*["'][^>]*>\\s*<\\/p>\\s*`,
    "i"
  );
  out = out.replace(pImgRegex, "");

  const imgRegex = new RegExp(
    `^\\s*<img[^>]+src=["'][^"']*${escapeRegExp(
      featuredKey
    )}[^"']*["'][^>]*>\\s*`,
    "i"
  );
  out = out.replace(imgRegex, "");

  return out;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeUrlJoin(base: string, path: string) {
  const b = (base || "").replace(/\/$/, "");
  const p = (path || "").startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export default function BlogPost({ post }: { post: any }) {
  const { locale } = useRouter();
  const t = UI[locale as "zh-TW" | "en"] || UI["zh-TW"];
  const reduce = useReducedMotion();

  // ✅ Site config（從 env 來，沒設就給 fallback）
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website";
  const siteLogo = process.env.NEXT_PUBLIC_SITE_LOGO || "/images/logo.png";
  const publisherLogoUrl = siteLogo.startsWith("http")
    ? siteLogo
    : safeUrlJoin(siteUrl, siteLogo);

  // ✅ Post data
  const titleText = stripHtml(post.title?.rendered);
  const descText = clamp(stripHtml(post.excerpt?.rendered), 160);
  const canonical = `${siteUrl}/blog/${post.slug}`;

  const featured =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

  const contentHtmlRaw = post.content?.rendered ?? "";
  const contentHtml = removeLeadingFeaturedImage(contentHtmlRaw, featured);

  // ✅ author（WP 有時在 _embedded.author）
  const authorName = post._embedded?.author?.[0]?.name || siteName;

  // ✅ dates
  const publishedISO = post.date
    ? new Date(post.date).toISOString()
    : undefined;
  const modifiedISO = post.modified
    ? new Date(post.modified).toISOString()
    : publishedISO;

  // ✅ categories/tags（如果你 _embed 有 terms 才能抓）
  const terms = post._embedded?.["wp:term"] || [];
  const categories = Array.isArray(terms?.[0])
    ? terms[0].map((x: any) => x?.name).filter(Boolean)
    : [];
  const tags = Array.isArray(terms?.[1])
    ? terms[1].map((x: any) => x?.name).filter(Boolean)
    : [];
  const keywords: string[] = Array.from(
    new Set<string>([...categories, ...tags].filter(Boolean))
  ).slice(0, 12);

  // ✅ OG image fallback
  const ogImage = featured || safeUrlJoin(siteUrl, "/images/news-01.jpg");

  // ✅ JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.home, item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: t.news,
        item: `${siteUrl}/blog`,
      },
      { "@type": "ListItem", position: 3, name: titleText, item: canonical },
    ],
    inLanguage: locale || "zh-TW",
  };

  // ✅ JSON-LD: BlogPosting（完整）
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: titleText,
    description: descText,
    inLanguage: locale || "zh-TW",
    datePublished: publishedISO,
    dateModified: modifiedISO,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: publisherLogoUrl,
      },
    },
    image: ogImage ? [ogImage] : undefined,
    keywords: keywords.length ? keywords.join(", ") : undefined,
    articleSection: categories?.[0] || undefined,
  };

  // ✅ hreflang
  const altEn = `${siteUrl}/en/blog/${post.slug}`;
  const altZh = `${siteUrl}/blog/${post.slug}`;

  // 🔹 修正點：定義 customSwitchLink
  // 當使用者點擊語言切換時，應該跳轉到當前文章的對應語言版本
  const customSwitchLink = `/blog/${post.slug}`;

  return (
    // 🔹 修正點：將 customSwitchLink 傳入 Layout
    <Layout customSwitchLink={customSwitchLink}>
      <Head>
        {/* ✅ 基本 SEO */}
        <title>{titleText}</title>
        <meta name="description" content={descText} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index,follow,max-image-preview:large" />

        {/* ✅ keywords */}
        {keywords.length ? (
          <meta name="keywords" content={keywords.join(", ")} />
        ) : null}

        {/* ✅ Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={titleText} />
        <meta property="og:description" content={descText} />
        <meta property="og:url" content={canonical} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        {publishedISO ? (
          <meta property="article:published_time" content={publishedISO} />
        ) : null}
        {modifiedISO ? (
          <meta property="article:modified_time" content={modifiedISO} />
        ) : null}
        {categories?.[0] ? (
          <meta property="article:section" content={categories[0]} />
        ) : null}
        {tags?.length
          ? tags
              .slice(0, 6)
              .map((tag: string) => (
                <meta key={tag} property="article:tag" content={tag} />
              ))
          : null}

        {/* ✅ Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titleText} />
        <meta name="twitter:description" content={descText} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

        {/* ✅ hreflang */}
        <link rel="alternate" hrefLang="zh-TW" href={altZh} />
        <link rel="alternate" hrefLang="en" href={altEn} />
        <link rel="alternate" hrefLang="x-default" href={altZh} />

        {/* ✅ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostingJsonLd),
          }}
        />
      </Head>

      <LazyMotion features={domAnimation}>
        <MotionConfig transition={spring} reducedMotion="user">
          <div className="bg-[#eddbc1] px-5 min-h-screen">
            {/* 麵包屑 */}
            <div className="max-w-[800px] xl:w-[60%] md:w-[70%] w-full mx-auto pt-[140px] pb-4">
              <nav className="flex items-center text-sm text-gray-600 font-medium">
                <Link
                  href="/"
                  className="hover:text-black text-[18px] transition-colors"
                >
                  {t.home}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  href="/blog"
                  className="hover:text-black text-[18px] transition-colors"
                >
                  {t.news}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900 truncate max-w-[200px] text-[18px] md:max-w-none">
                  {titleText}
                </span>
              </nav>
            </div>

            {/* Hero */}
            <section className="section-hero">
              <div className="max-w-[800px] max-h-[90vh] xl:w-[60%] md:w-[70%] w-full mx-auto">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ ...spring }}
                  className="aspect-[16/16] relative overflow-hidden shadow-lg border-2 border-black"
                >
                  <motion.div
                    initial={reduce ? false : { scale: 1.02 }}
                    animate={reduce ? undefined : { scale: 1 }}
                    transition={{ ...spring }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={featured || "/images/news-01.jpg"}
                      alt={titleText}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 90vw, 800px"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* Title + Date */}
            <section className="py-10 px-4 md:px-0">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ ...spring, delay: reduce ? 0 : 0.05 }}
                className="max-w-3xl mx-auto text-center"
              >
                <h1 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">
                  {titleText}
                </h1>
                <p className="text-gray-600 font-medium">
                  {post.date ? new Date(post.date).toLocaleDateString() : ""}
                </p>
              </motion.div>
            </section>

            {/* Content */}
            <section className="px-4 md:px-0 pb-16">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ ...spring, delay: reduce ? 0 : 0.1 }}
                className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </section>
          </div>
        </MotionConfig>
      </LazyMotion>
    </Layout>
  );
}