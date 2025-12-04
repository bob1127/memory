import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Layout from "./Layout"; // 請確認您的 Layout路徑
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/* ========== 1. 資料設定 (保留原始結構) ========== */
const MENU_IMAGES = [
  "/images/menu/憶點點/憶點點_202509菜單本P2.jpg",
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
        "憶點點 Sweet Memory 完整菜單。提供各式鹹食、甜食與懷舊台灣小吃。",
    },
    breadcrumb: {
      home: "首頁",
      brand_menu: "品牌菜單",
      current: "憶點點菜單",
    },
    heading: "憶 點 點 ｜ 鹹 食 甜 食 台 灣 小 吃 ｜ 菜 單",
    imageAlt: "憶點點菜單頁面",
  },
  en: {
    meta: {
      title: "Menu | Sweet Memory",
      description:
        "Full menu of Sweet Memory. Offering savory dishes, desserts, and nostalgic Taiwanese snacks.",
    },
    breadcrumb: {
      home: "Home",
      brand_menu: "Brand Menu",
      current: "Sweet Memory Menu",
    },
    heading: "SWEET MEMORY | SAVORY & SWEET | MENU",
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
        <div className="fixed inset-0 z-[999999999999999]">
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-[1100px] max-h-[100vh] overflow-y-auto bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="sticky top-3 ml-auto mr-3 mt-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-black shadow-lg hover:bg-white"
                aria-label="Close"
              >
                ✕
              </button>
              <img
                src={src}
                alt={alt}
                className="w-full h-auto block"
                decoding="async"
                loading="eager"
              />
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* ========== 5. 頁面主體 ========== */
export default function Menu02Page({ t, locale }) {
  // 動畫設定
  const enter = { opacity: 0, y: 56, filter: "blur(10px)" };
  const center = { opacity: 1, y: 0, filter: "blur(0px)" };
  const exit = { opacity: 0, y: -56, filter: "blur(10px)" };
  const TRANSITION = { duration: 0.65, ease: [0.18, 0.8, 0.26, 1] };

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src, alt) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  /* ----- SEO Schema (Breadcrumb + ImageGallery) ----- */
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
          locale === "en" ? "/en/menu02" : "/menu02"
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

      <div className="pt-20">
        <section className="max-w-[1300px] mx-auto xl:w-[90%] md:w-[90%] w-full py-10 sm:py-16">
          {/* 麵包屑 + 大標 */}
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

          {/* 內容網格 */}
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
