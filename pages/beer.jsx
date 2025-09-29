// app/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; // ← 新增：用於進入 /beer-inner
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

const PHONE_INTL = "886939767977";

const PRODUCTS = [
  { id: "beer01", name: "台灣啤酒-01", img: "/images/beer04.png" },
];

const MARQUEE_ITEMS = [
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 1",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 2",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 3",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 4",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 5",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 6",
  },
];

const APPEAR_DELAY_MS = 800;

export default function Home() {
  // 每個商品的數量：允許 0（加入後會重設為 0）
  const [qtyMap, setQtyMap] = useState(() =>
    Object.fromEntries(PRODUCTS.map((p) => [p.id, 1]))
  );

  // 跑馬燈時機
  const [showMarquee, setShowMarquee] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Toast 狀態
  const [toast, setToast] = useState(null); // { id, text }
  const toastTimerRef = useRef(null);
  const showToast = (text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, text });
    toastTimerRef.current = setTimeout(() => setToast(null), 1600);
  };
  useEffect(
    () => () => toastTimerRef.current && clearTimeout(toastTimerRef.current),
    []
  );

  const setQty = (id, next) =>
    setQtyMap((m) => ({
      ...m,
      [id]: Math.max(0, Number.isFinite(+next) ? +next : 0),
    }));

  const addToCart = (product) => {
    const raw = qtyMap[product.id] ?? 0;
    if (raw <= 0) return; // 0 不處理
    const safeQty = Math.max(1, raw);

    cartStore.add(
      { id: product.id, name: product.name, img: product.img },
      safeQty
    );

    // 按鈕回饋動畫
    const btn = document.getElementById(`btn-${product.id}`);
    if (btn) {
      btn.animate(
        [
          { transform: "scale(1)", filter: "brightness(1)" },
          { transform: "scale(1.06)", filter: "brightness(1.15)" },
          { transform: "scale(1)", filter: "brightness(1)" },
        ],
        { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }

    // 成功提示 + 重設數量為 0
    showToast(`「${product.name}」已加入購物車（${safeQty} 箱）`);
    setQty(product.id, 0);
  };

  return (
    <Layout>
      {/* 全局 Toast */}
      <div className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: -8, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
              transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
              className="mb-8 rounded-xl bg-black text-white px-4 py-2 shadow-lg"
              style={{ willChange: "opacity, transform, filter" }}
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 跑馬燈 */}
      <AnimatePresence>
        {showMarquee && (
          <motion.div
            key="marquee-wrap"
            className="pointer-events-none w-full py-6 overflow-hidden absolute z-50 left-0 top-20"
            initial={{ opacity: 0, y: 64, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ willChange: "transform, opacity, filter" }}
          >
            <Marquee velocity={28} direction="rtl" scatterRandomly={false}>
              {MARQUEE_ITEMS.map((item, idx) => (
                <div
                  key={`m1-${idx}`}
                  className="mx-6 flex items-center drop-shadow"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-[420px] object-contain"
                  />
                </div>
              ))}
            </Marquee>
            <Marquee velocity={24} direction="ltr" scatterRandomly={false}>
              {MARQUEE_ITEMS.map((item, idx) => (
                <div
                  key={`m2-${idx}`}
                  className="mx-6 flex items-center drop-shadow"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-[420px] object-contain"
                  />
                </div>
              ))}
            </Marquee>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="section_hero relative h-screen overflow-hidden">
        <motion.div
          className="absolute right-20 top-20 z-20"
          initial={{ scale: 1.5, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/logo-6.png"
            alt="logo"
            placeholder="empty"
            loading="eager"
            priority
            width={800}
            height={500}
            className="w-[200px] transform-gpu"
          />
        </motion.div>

        <motion.div
          className="absolute left-10 bottom-20 z-20"
          initial={{ scale: 1.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/beer02.png"
            alt="beer"
            placeholder="empty"
            loading="eager"
            priority
            width={800}
            height={500}
            className="w-[700px] transform-gpu"
          />
        </motion.div>
      </section>

      {/* 商品清單 */}
      <section className="section-content min-h-screen pb-24">
        <div className="title flex justify-center pt-20 items-center">
          <h4 className="text-[22px] font-bold">ORDER</h4>
        </div>

        <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {PRODUCTS.map((p) => {
            const q = qtyMap[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="item flex flex-col justify-center items-center  group  transition"
              >
                <div className="item-info mb-2">
                  <b>{p.name}</b>
                </div>

                {/* 產品圖可點擊 → /beer-inner */}
                <Link href="/beer-inner" aria-label={`${p.name} 內頁`}>
                  <Image
                    src={p.img}
                    alt={p.name}
                    className="w-[200px] h-auto transition-transform group-hover:scale-[1.02]"
                    width={330}
                    height={120}
                    priority={false}
                  />
                </Link>

                {/* 數量選擇器（允許 0） */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setQty(p.id, q - 1)}
                    className="rounded-xl border px-4 py-2"
                    aria-label="decrease"
                    disabled={q <= 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={q}
                    onChange={(e) =>
                      setQty(
                        p.id,
                        Math.max(0, parseInt(e.target.value || "0", 10))
                      )
                    }
                    className="w-28 rounded-xl border px-3 py-2 text-center"
                    aria-label="quantity"
                  />
                  <button
                    onClick={() => setQty(p.id, q + 1)}
                    className="rounded-xl border px-4 py-2"
                    aria-label="increase"
                  >
                    +
                  </button>
                </div>

                {/* Product Info 連結 → /beer-inner */}
                <Link
                  href="/beer-inner"
                  className="mt-3 text-sm underline underline-offset-4 hover:opacity-80"
                >
                  <button class=" relative inline-flex h-12 items-center justify-center overflow-hidden  px-6 font-medium text-neutral-800">
                    <span>產品資訊</span>
                    <div class="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </Link>

                {/* 直接加入購物車（q=0 時禁用） */}
                <button
                  onClick={() => addToCart(p)}
                  id={`btn-${p.id}`}
                  disabled={q <= 0}
                  className={`mt-3 rounded-xl px-4 py-2 text-white ${
                    q > 0
                      ? "bg-black hover:opacity-90"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  加入購物車
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
