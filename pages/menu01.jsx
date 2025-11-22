// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "./Layout";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/** ---- Tabs 設定（保留資料，但不再顯示/切換） ---- */
const TABS = [
  {
    key: "classic",
    label: "主食經典",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",
      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",
      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "snacks",
    label: "快炒小點",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",
      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",
      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "drinks",
    label: "飲品專區",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",
      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",
      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "combo",
    label: "超值套餐",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",
      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",
      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "seasonal",
    label: "季節限定",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",
      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",
      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
];

/* ========= Popup / Lightbox（z-index 更高 + 可滾動） ========= */
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
          {/* Backdrop（點空白可關） */}
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
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              className="
                relative w-full max-w-[1100px]
                max-h-[100vh] overflow-y-auto
                 bg-white shadow-2xl
              "
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
              {/* Close Button */}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Home() {
  // 不再顯示/切換 tabs，固定使用第一組資料
  const current = TABS[0];

  // 大幅度、絲滑的進出場
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

  return (
    <Layout>
      <div className="pt-20">
        <section className="max-w-[1300px] mx-auto xl:w-[90%] md:w-[90%] w-full py-10 sm:py-16">
          {/* ===== 上方設計參照圖（麵包屑 + 大標） ===== */}
          <div className="text-center mt-6 sm:mt-10">
            <div className="text-xs sm:text-sm text-stone-500 tracking-wide">
              <Link href="/" className="hover:text-black duration-400">
                首頁
              </Link>{" "}
              ›{" "}
              <Link href="/menu" className="hover:text-black duration-400">
                品牌菜單
              </Link>{" "}
              ›
              <Link href="" className="hover:text-black duration-400">
                {" "}
                有香菜單
              </Link>
            </div>
            <h1 className="mt-6 sm:mt-8 text-xl sm:text-2xl md:text-3xl font-semibold tracking-[0.25em] text-stone-800">
              有香 ｜ 台 灣 小 吃 ｜ 菜 單
            </h1>
          </div>

          {/* 內容：兩個一排 + 絲滑進場 */}
          <MotionConfig transition={TRANSITION}>
            <AnimatePresence mode="wait">
              <motion.div
                key="menu-grid"
                initial={enter}
                animate={center}
                exit={exit}
                style={{ willChange: "transform, opacity, filter" }}
                className="
                  grid mt-12 sm:mt-16 gap-6 sm:gap-8
                  grid-cols-1 md:grid-cols-2
                  items-start
                "
              >
                {current.images.map((src, i) => {
                  const alt = `${current.label} ${i + 1}`;
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
                        className="
                          w-[95%] mx-auto h-auto
                          shadow-sm bg-white
                          transition-transform duration-500 ease-out
                          group-hover:scale-[1.015]
                        "
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

      {/* Lightbox */}
      <ImageLightbox
        open={lightboxOpen}
        src={lightboxSrc}
        alt={lightboxAlt}
        onClose={() => setLightboxOpen(false)}
      />
    </Layout>
  );
}
