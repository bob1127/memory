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

/* ========== 1. 資料設定 (已更新：有香菜單 4 ~ 21) ========== */
const MENU_IMAGES = [
  "/images/menu/有香/有香_202503菜單本4.jpg",
  "/images/menu/有香/有香_202503菜單本5.jpg",
  "/images/menu/有香/有香_202503菜單本6.jpg",
  "/images/menu/有香/有香_202503菜單本7.jpg",
  "/images/menu/有香/有香_202503菜單本8.jpg",
  "/images/menu/有香/有香_202503菜單本9.jpg",
  "/images/menu/有香/有香_202503菜單本10.jpg",
  "/images/menu/有香/有香_202503菜單本11.jpg",
  "/images/menu/有香/有香_202503菜單本12.jpg",
  "/images/menu/有香/有香_202503菜單本13.jpg",
  "/images/menu/有香/有香_202503菜單本14.jpg",
  "/images/menu/有香/有香_202503菜單本15.jpg",
  "/images/menu/有香/有香_202503菜單本16.jpg",
  "/images/menu/有香/有香_202503菜單本17.jpg",
  "/images/menu/有香/有香_202503菜單本18.jpg",
  "/images/menu/有香/有香_202503菜單本19.jpg",
  "/images/menu/有香/有香_202503菜單本20.jpg",
  "/images/menu/有香/有香_202503菜單本21.jpg",
];

/* ========== 2. i18n 頁面翻譯資料 (僅限本頁內容) ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "有香菜單 | Memory Corner",
      description:
        "有香 Memory Corner 完整菜單。提供經典台灣小吃、羊肉爐、各式鍋物與飲品。瀏覽我們的數位菜單，發現正宗台灣味。",
      keywords:
        "有香菜單, Memory Corner Menu, 羊肉爐菜單, 台灣小吃菜單, 溫哥華台菜菜單",
      ogImage: MENU_IMAGES[0], // 使用第一張菜單作為分享圖
    },
    breadcrumb: {
      home: "首頁",
      brand_menu: "品牌菜單",
      current: "有香菜單",
    },
    heading: "有香 ｜ 台 灣 小 吃 ｜ 菜 單",
    imageAlt: "有香 Memory Corner 菜單頁面",
  },
  en: {
    meta: {
      title: "Menu | Memory Corner",
      description:
        "Full menu of Memory Corner. Serving authentic Taiwanese snacks, Lamb Hot Pot, and various drinks. View our digital menu to explore authentic Taiwanese flavors.",
      keywords:
        "Memory Corner Menu, Taiwanese Food Menu, Lamb Hot Pot Menu, Vancouver Taiwanese Restaurant Menu",
      ogImage: MENU_IMAGES[0],
    },
    breadcrumb: {
      home: "Home",
      brand_menu: "Brand Menu",
      current: "Memory Corner Menu",
    },
    heading: "MEMORY CORNER | TAIWANESE SNACKS | MENU",
    imageAlt: "Memory Corner Menu Page",
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
export default function Menu01Page({ t, locale }) {
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
  // 假設本頁路徑為 /menu01
  const path = pathWithoutLocale === "/" ? "/menu01" : pathWithoutLocale;
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

  // 2. Menu Schema (使用 ImageGallery 或是更具體的 Menu)
  // 這裡使用 ImageGallery 比較適合純圖片菜單
  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: t.meta.title,
    description: t.meta.description,
    image: MENU_IMAGES.map((img) => `${SITE_DOMAIN}${img}`),
    provider: {
      "@type": "Restaurant",
      name: "Memory Corner",
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
        <meta property="og:site_name" content="Memory Corner" />
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
                        loading={i < 2 ? "eager" : "lazy"} // 首屏 2 張圖優先載入
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
