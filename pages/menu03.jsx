import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/* ========== 設定網域 (使用環境變數) ========== */
// 請確認 .env.local 中已設定 NEXT_PUBLIC_SITE_URL
const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* ========== 1. 資料設定 ========== */
const MENU_IMAGES = [
  "/images/menu/有香ㄟ灶腳/2025-10-灶腳-IG-灶腳宅配到府品項(3000x3750px)-定稿.jpg",
  "/images/menu/有香ㄟ灶腳/2025-10-灶腳-IG-灶腳宅配區域&運費說明(3000x3750px)-定稿.jpg",
];

/* ========== 2. i18n 翻譯資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "有香ㄟ灶腳菜單 | Kitchen Corner",
      description:
        "有香ㄟ灶腳 Kitchen Corner 宅配菜單。提供冷凍料理包、台灣家常菜宅配服務，在家也能輕鬆享用有香美味。",
      keywords:
        "有香ㄟ灶腳, Kitchen Corner, 台灣菜宅配, 冷凍料理包, 溫哥華美食外送",
      ogImage: MENU_IMAGES[0],
    },
    breadcrumb: {
      home: "首頁",
      brand_menu: "品牌菜單",
      current: "有香ㄟ灶腳",
    },
    heading: "有 香 ㄟ 灶 腳 ｜ 宅 配 美 味 ｜ 菜 單",
    imageAlt: "有香ㄟ灶腳 Kitchen Corner 菜單",
  },
  en: {
    meta: {
      title: "Menu | Kitchen Corner",
      description:
        "Delivery menu of Kitchen Corner. Offering frozen meal packs and authentic Taiwanese home-cooked meals delivered to your door.",
      keywords:
        "Kitchen Corner Menu, Taiwanese Food Delivery, Frozen Meal Packs, Vancouver Food Delivery",
      ogImage: MENU_IMAGES[0],
    },
    breadcrumb: {
      home: "Home",
      brand_menu: "Brand Menu",
      current: "Kitchen Corner",
    },
    heading: "KITCHEN CORNER | DELIVERY MENU",
    imageAlt: "Kitchen Corner Delivery Menu",
  },
};

/* ========== 3. SSG 資料獲取 ========== */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: { t, locale },
  };
}

/* ========== 4. Lightbox 元件 (保持不變) ========== */
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
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            className="relative w-full h-full max-w-[1200px] p-4 flex items-center justify-center cursor-pointer"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full object-contain drop-shadow-2xl select-none cursor-default"
              decoding="async"
            />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* ========== 5. 頁面主體 ========== */
export default function Menu03Page({ t, locale }) {
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

  /* ----- SEO URL 處理 ----- */
  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;

  // Hreflang
  const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
  // 假設本頁路徑為 /menu03
  const path = pathWithoutLocale === "/" ? "/menu03" : pathWithoutLocale;
  const zhUrl = `${SITE_DOMAIN}${path}`;
  const enUrl = `${SITE_DOMAIN}/en${path}`;

  /* ----- SEO Schema (JSON-LD) ----- */

  // 1. Breadcrumb Schema
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

  // 2. ImageGallery Schema
  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: t.meta.title,
    description: t.meta.description,
    image: MENU_IMAGES.map((img) => `${SITE_DOMAIN}${img}`),
    provider: {
      "@type": "Restaurant",
      name: "Kitchen Corner / 有香ㄟ灶腳",
      image: `${SITE_DOMAIN}/logo.png`, // 請確認有 logo 檔案
    },
  };

  const jsonLdList = [breadcrumbSchema, imageGallerySchema];

  return (
    <Layout>
      <Head>
        {/* 基本 Meta */}
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Hreflang */}
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Kitchen Corner" />
        <meta property="og:image" content={`${SITE_DOMAIN}${t.meta.ogImage}`} />
        <meta
          property="og:locale"
          content={locale === "zh-TW" ? "zh_TW" : "en_US"}
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta
          name="twitter:image"
          content={`${SITE_DOMAIN}${t.meta.ogImage}`}
        />

        {/* JSON-LD 注入 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }}
        />
      </Head>

      <div className="pt-20">
        <section className="max-w-[1300px] mx-auto xl:w-[90%] md:w-[90%] w-full py-10 sm:py-16">
          <div className="text-center mt-6 sm:mt-10">
            <div className="text-[18px] text-stone-800 sm:text-stone-500 tracking-wide">
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
            <h1 className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.25em] text-stone-800 uppercase">
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
                className="grid mt-12 sm:mt-16 gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 items-start"
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
                        className="w-[95%] mx-auto h-auto shadow-sm bg-white transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                        loading="eager" // 只有兩張圖，皆設為 eager
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
