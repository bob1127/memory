import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Layout from "./Layout";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/* ========== 1. 資料設定 ========== */
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

/* ========== 2. i18n 頁面翻譯資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "有香菜單 | Memory Corner",
      description:
        "有香 Memory Corner 完整菜單。提供經典台灣小吃、羊肉爐、各式鍋物與飲品。",
    },
    breadcrumb: {
      home: "首頁",
      brand_menu: "品牌菜單",
      current: "有香菜單",
    },
    heading: "有香 ｜ 台 灣 小 吃 ｜ 菜 單",
    imageAlt: "有香菜單頁面",
  },
  en: {
    meta: {
      title: "Menu | Memory Corner",
      description:
        "Full menu of Memory Corner. Serving authentic Taiwanese snacks, Lamb Hot Pot, and various drinks.",
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

/* ========== 4. Lightbox 元件 (已新增右上角關閉按鈕) ========== */
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
        <div
          className="fixed inset-0 z-[999999999999999] h-[100dvh] w-screen overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          {/* 背景遮罩 (視覺層) */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
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

          {/* Panel 設定 pointer-events-none，讓點擊空白處可穿透關閉 */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            className="relative w-full h-full max-w-[1200px] p-4 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Image 設定 pointer-events-auto，防止點擊圖片時關閉 */}
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

/* ========== 5. 頁面主體 (含手機版排版優化) ========== */
export default function Menu01Page({ t, locale }) {
  const enter = { opacity: 0, y: 56, filter: "blur(10px)" };
  const center = { opacity: 1, y: 0, filter: "blur(0px)" };
  const exit = { opacity: 0, y: -56, filter: "blur(10px)" };
  const TRANSITION = { duration: 0.65, ease: [0.18, 0.8, 0.26, 1] };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src, alt) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  /* ----- SEO Schema ----- */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.breadcrumb.home,
        item: `https://www.memorycorner8.com${locale === "en" ? "/en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.breadcrumb.brand_menu,
        item: `https://www.memorycorner8.com${
          locale === "en" ? "/en/menu" : "/menu"
        }`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t.breadcrumb.current,
        item: `https://www.memorycorner8.com${
          locale === "en" ? "/en/menu01" : "/menu01"
        }`,
      },
    ],
  };

  const imageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: t.meta.title,
    description: t.meta.description,
    image: MENU_IMAGES.map((img) => `https://www.memorycorner8.com${img}`),
  };

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
      />

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