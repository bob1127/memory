// components/HeroStackedFader.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

function Layer({ src, alt, className, width, height, fill = false, sizes }) {
  return (
    <motion.div
      key={src}
      className="absolute"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {fill ? (
        <Image src={src} alt={alt} fill sizes={sizes} className={className} />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={className}
        />
      )}
    </motion.div>
  );
}

/**
 * props.layers: 每一層的配置（位置 + base 路徑等）
 *   - posClass: 絕對定位 + zIndex + transform 等 class（決定該層放哪）
 *   - base: 不含 -a.png 的基底，例如 "/images/index/banner-06"
 *   - ext: 副檔名，預設 "png"
 *   - imgProps: 交給 <Image> 的屬性（width/height/fill/sizes/className）
 * props.variants: 切換序列（預設 ["a","b"]）
 * props.autoplayMs: 自動播放毫秒；不想自動播就傳 null
 */
export default function HeroStackedFader({
  layers = [],
  variants = ["a", "b"],
  autoplayMs = null,
  className = "relative h-[80vh] md:h-screen min-h-[560px] overflow-hidden",
}) {
  const [idx, setIdx] = useState(0);
  const total = variants.length;

  const next = useCallback(() => setIdx((p) => (p + 1) % total), [total]);
  const prev = useCallback(
    () => setIdx((p) => (p - 1 + total) % total),
    [total]
  );

  // 自動播放（可關閉）
  useEffect(() => {
    if (!autoplayMs) return;
    const t = setInterval(next, autoplayMs);
    return () => clearInterval(t);
  }, [autoplayMs, next]);

  // 鍵盤左右切換
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // 目前要顯示的 variant（例如 "a" 或 "b"）
  const cur = variants[idx];

  return (
    <section className={className} aria-roledescription="carousel">
      <div className="relative h-full w-full">
        {layers.map((L, i) => {
          const { posClass = "", base, ext = "png", imgProps = {} } = L;
          const src = `${base}-${cur}.${ext}`;
          return (
            <div key={i} className={posClass}>
              <AnimatePresence mode="wait">
                <Layer src={src} alt="" {...imgProps} />
              </AnimatePresence>
            </div>
          );
        })}

        {/* 左右箭頭（可聚焦可用鍵盤操作） */}
        <button
          aria-label="Previous slide"
          onClick={prev}
          className="group absolute left-3 top-1/2 -translate-y-1/2 z-[999] grid place-items-center rounded-full bg-black/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70 w-11 h-11"
        >
          <span className="sr-only">Previous</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="fill-white"
          >
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <button
          aria-label="Next slide"
          onClick={next}
          className="group absolute right-3 top-1/2 -translate-y-1/2 z-[999] grid place-items-center rounded-full bg-black/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70 w-11 h-11"
        >
          <span className="sr-only">Next</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="fill-white"
          >
            <path d="m10 6 1.41 1.41L8.83 10H20v2H8.83l2.58 2.59L10 16l-6-6z" />
          </svg>
        </button>

        {/* 小圓點（可點擊切換） */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] flex gap-2">
          {variants.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-opacity ${
                i === idx ? "bg-white opacity-100" : "bg-white/60 opacity-70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
