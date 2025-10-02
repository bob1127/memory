// app/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

const PHONE_INTL = "886939767977";

// ✅ 12 筆假資料，每個都有唯一 id
const PRODUCTS = [
  { id: "beer01", name: "台灣啤酒-經典", img: "/images/beer04.png" },
  { id: "beer02", name: "台灣啤酒-金牌", img: "/images/beer04.png" },
  { id: "beer03", name: "台灣啤酒-蜂蜜", img: "/images/beer04.png" },
  { id: "beer04", name: "台灣啤酒-水果", img: "/images/beer04.png" },
  { id: "beer05", name: "金色三麥-IPA", img: "/images/beer04.png" },
  { id: "beer06", name: "金色三麥-白啤", img: "/images/beer04.png" },
  { id: "beer07", name: "金色三麥-黑啤", img: "/images/beer04.png" },
  { id: "beer08", name: "在地精釀-拉格", img: "/images/beer04.png" },
  { id: "beer09", name: "在地精釀-艾爾", img: "/images/beer04.png" },
  { id: "beer10", name: "在地精釀-世濤", img: "/images/beer04.png" },
  { id: "beer11", name: "進口啤酒-拉格", img: "/images/beer04.png" },
  { id: "beer12", name: "進口啤酒-皮爾森", img: "/images/beer04.png" },
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
  // 每個商品的數量（獨立）：以 id 為 key
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

  /* ===== 訂閱 Email 狀態 + 送出 ===== */
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) {
      showToast("請先輸入 Email");
      return;
    }
    // TODO: 串接 Mailchimp / 後端 API
    showToast("訂閱成功，感謝！");
    setSubscribeEmail("");
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

        <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-8">
          {PRODUCTS.map((p) => {
            const q = qtyMap[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="item flex flex-col justify-center items-center group transition"
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

                {/* 數量選擇器（允許 0，彼此獨立） */}
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
                  <button className="relative inline-flex h-12 items-center justify-center overflow-hidden px-6 font-medium text-neutral-800">
                    <span>產品資訊</span>
                    <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
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

      {/* ───────── 新增：訂閱區塊（如圖示） ───────── */}
      <section className="section-newsletter w-full py-16">
        <motion.form
          onSubmit={handleSubscribe}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-[460px] px-6 text-center"
        >
          {/* 標題（日文） */}
          <h3 className="text-[20px] font-bold text-gray-800">メルマガ登録</h3>
          {/* 副標（細字） */}
          <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
            お得な情報や商品の新着など最新情報をお届けします。
          </p>

          {/* 下劃線輸入框 + 右側信封圖標 */}
          <div className="relative mx-auto mt-6">
            <label htmlFor="newsletter-email" className="sr-only">
              メールアドレス
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              placeholder="メールアドレスを入力"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              className="w-full border-0 border-b border-gray-400 bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-gray-400 focus:border-gray-700"
              aria-label="メールアドレス"
              required
            />
            {/* 信封小圖標（靠右） */}
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="m4 7 8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
          </div>

          {/* 圓角水藍色按鈕 */}
          <button
            type="submit"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[#2f93a0] px-10 py-3 text-[14px] text-white hover:brightness-110 transition"
          >
            登録する
          </button>
        </motion.form>
      </section>

      {/* 地圖 + 跑馬燈標語 */}
      <section className="section-map pt-20 flex flex-col">
        <div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2608.125676211783!2d-123.1274940232461!3d49.17920177807608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548675082541f249%3A0x87d1f92d1d46df5f!2zTWVtb3J5IENvcm5lciDmnInpppk!5e0!3m2!1szh-TW!2stw!4v1759130334759!5m2!1szh-TW!2stw"
            className="w-full h-[500px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div>
          <Marquee>
            <h2 className="text-[70px] mx-3">MEMORY CORNER</h2>
            <h2 className="text-[70px] mx-3">MEMORY CORNER</h2>
            <h2 className="text-[70px] mx-3">MEMORY CORNER</h2>
            <h2 className="text-[70px] mx-3">MEMORY CORNER</h2>
          </Marquee>
        </div>
      </section>
    </Layout>
  );
}
