import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/* ========== 設定網域 (使用環境變數) ========== */
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
        "有香ㄟ灶腳 Kitchen Corner 宅配菜單。提供冷凍料理包、台灣家常菜宅配服務。",
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
        "Delivery menu of Kitchen Corner. Offering frozen meal packs and authentic Taiwanese home-cooked meals.",
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

/* ========== 4. Lightbox 元件 (手機版觸控修復版) ========== */
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
        // 最外層綁定 onClick，確保點擊任何空白處都能關閉
        <div
          className="fixed inset-0 z-[999999999999999] h-[100dvh] w-screen overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
          />

          {/* Panel 設定 pointer-events-none，讓點擊穿透到外層 */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            className="relative   h-auto sm:h-full max-w-[1200px] p-4 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 圖片本身 pointer-events-auto，阻止冒泡以免關閉 */}
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full object-contain drop-shadow-2xl select-none cursor-default rounded-sm pointer-events-auto"
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

  /* ----- URL & SEO ----- */
  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;
  const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
  const path = pathWithoutLocale === "/" ? "/menu03" : pathWithoutLocale;
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
      name: "Kitchen Corner",
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
        <meta property="og:site_name" content="Kitchen Corner" />
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

      {/* 修改點：背景改為 bg-white */}
      <div className="pt-20  min-h-screen">
        {/* 手機版間距優化：px-4 py-6 */}
        <section className="max-w-[1300px] mx-auto xl:w-[90%] md:w-[90%] w-full px-4 sm:px-0 py-6 sm:py-16">
          <div className="text-center mt-4 sm:mt-10">
            {/* 麵包屑文字縮小 */}
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
            {/* 標題文字縮小 */}
            <h1 className="mt-4 sm:mt-8 text-lg sm:text-3xl font-bold tracking-[0.15em] sm:tracking-[0.25em] text-stone-800 uppercase">
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
                // 手機版間距優化：gap-4 mt-8
                className="grid mt-8 sm:mt-16   grid-cols-1 md:grid-cols-2 items-start"
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
                      {/* 手機版圖片全寬 */}
                      <img
                        src={src}
                        alt={alt}
                        className="w-full sm:w-[100%] mx-auto my-4 h-auto shadow-md bg-white transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                        loading="eager" // 只有2張圖，直接 eager
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
