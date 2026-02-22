import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/* ========== 設定網域 (使用環境變數) ========== */
const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* ========== 1. 資料設定 (憶點點) ========== */
const MENU_IMAGES = [
  "/images/menu/憶點點/憶點點_202509菜單本P3.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P4.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P5.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P6.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P7.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P8.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P10.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P11.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P13.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P14.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P15.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P16.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P18.jpg",
  "/images/menu/憶點點/憶點點_202509菜單本P19.jpg",
];

/* ========== 2. i18n 翻譯資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "憶點點菜單 | Sweet Memory",
      description:
        "憶點點 Sweet Memory 完整菜單。提供古早味鹹食、手作甜點與懷舊台灣小吃。",
    },
    breadcrumb: {
      home: "首頁",
      brand_menu: "品牌菜單",
      current: "憶點點菜單",
    },
    heading: "憶 點 點 ｜ 『療癒甜點鹹食』 ｜ 菜 單",
    imageAlt: "憶點點 Sweet Memory 菜單頁面",
  },
  en: {
    meta: {
      title: "Menu | Sweet Memory",
      description:
        "Full menu of Sweet Memory. Offering traditional savory dishes, handmade desserts, and nostalgic Taiwanese snacks.",
    },
    breadcrumb: {
      home: "Home",
      brand_menu: "Brand Menu",
      current: "Sweet Memory Menu",
    },
    heading: "Sweet Memory | Sweet & Savoury Delights | MENU",
    imageAlt: "Sweet Memory Menu Page",
  },
};

/* ========== 3. SSG 資料獲取 ========== */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: { t, locale },
  };
}

/* ========== 4. Lightbox 元件 (已新增關閉按鈕) ========== */
function ImageLightbox({ open, src, alt, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[999999999999999] h-[100dvh] w-screen overflow-hidden flex items-center justify-center">
          {/* Layer 1: 黑色遮罩 (Backdrop) */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* ==================== 新增：右上角關閉按鈕 ==================== */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // 避免事件冒泡
              onClose();
            }}
            className="absolute top-5 right-5 z-[1000] p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-all duration-200 pointer-events-auto flex items-center justify-center"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          {/* ========================================================== */}

          {/* Layer 2: 圖片容器 (Panel) */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            className="relative h-auto sm:h-full p-4 md:p-10 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Layer 3: 圖片本身 (Image) */}
            <img
              src={src}
              alt={alt}
              className="object-contain drop-shadow-2xl select-none cursor-default rounded-sm pointer-events-auto"
              decoding="async"
            />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* ========== 5. 頁面主體 ========== */
export default function Menu02Page({ t, locale }) {
  const router = useRouter();
  const TRANSITION = { duration: 0.65, ease: [0.18, 0.8, 0.26, 1] };
  const enter = { opacity: 0, y: 56, filter: "blur(10px)" };
  const center = { opacity: 1, y: 0, filter: "blur(0px)" };
  const exit = { opacity: 0, y: -56, filter: "blur(10px)" };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src, alt) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  /* ----- URL & SEO ----- */
  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;
  const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
  const path = pathWithoutLocale === "/" ? "/menu02" : pathWithoutLocale;
  const zhUrl = `${SITE_DOMAIN}${path}`;
  const enUrl = `${SITE_DOMAIN}/en${path}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.breadcrumb.home,
        item: `${SITE_DOMAIN}/${locale === "en" ? "en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.breadcrumb.brand_menu,
        item: `${SITE_DOMAIN}${locale === "en" ? "/en/menu" : "/menu"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t.breadcrumb.current,
        item: canonicalUrl,
      },
    ],
  };

  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: t.meta.title,
    description: t.meta.description,
    image: MENU_IMAGES.map((img) => `${SITE_DOMAIN}${img}`),
    provider: {
      "@type": "Restaurant",
      name: "Sweet Memory",
      image: `${SITE_DOMAIN}/logo.png`,
    },
  };

  const jsonLdList = [breadcrumbSchema, imageGallerySchema];

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Sweet Memory" />
        <meta property="og:image" content={`${SITE_DOMAIN}${t.meta.ogImage}`} />
        <meta
          property="og:locale"
          content={locale === "zh-TW" ? "zh_TW" : "en_US"}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta
          name="twitter:image"
          content={`${SITE_DOMAIN}${t.meta.ogImage}`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }}
        />
      </Head>

      <div className="pt-20 min-h-screen">
        <section className="max-w-[1300px] mx-auto xl:w-[90%] md:w-[90%] w-full px-4 sm:px-0 py-6 sm:py-16">
          <div className="text-center mt-4 sm:mt-10">
            <div className="text-[14px] sm:text-[18px] text-stone-600 sm:text-stone-500 tracking-wide">
              <Link href="/" className="hover:text-black duration-400">
                {t.breadcrumb.home}
              </Link>{" "}
              ›{" "}
              <Link href="/menu" className="hover:text-black duration-400">
                {t.breadcrumb.brand_menu}
              </Link>{" "}
              ›{" "}
              <span className="text-black font-medium">
                {t.breadcrumb.current}
              </span>
            </div>
            <h1 className="mt-4 sm:mt-8 text-lg sm:text-3xl font-bold tracking-[0.15em] sm:tracking-[0.25em] text-stone-800  ">
              {t.heading}
            </h1>
          </div>

          <MotionConfig transition={TRANSITION}>
            <AnimatePresence mode="wait">
              <motion.div
                key="menu-grid"
                initial={enter}
                animate={center}
                exit={exit}
                style={{ willChange: "transform, opacity, filter" }}
                className="grid mt-8 sm:mt-16 grid-cols-1 md:grid-cols-2 items-start"
              >
                {MENU_IMAGES.map((src, i) => {
                  const alt = `${t.imageAlt} ${i + 1}`;
                  return (
                    <motion.button
                      key={`menu-${i}`}
                      type="button"
                      onClick={() => openLightbox(src, alt)}
                      className="group w-full cursor-zoom-in"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <img
                        src={src}
                        alt={alt}
                        className="w-full sm:w-[100%] mx-auto my-4 h-auto shadow-md bg-white transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                        loading={i < 2 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </MotionConfig>
        </section>
      </div>

      <ImageLightbox
        open={lightboxOpen}
        src={lightboxSrc}
        alt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />
    </Layout>
  );
}
