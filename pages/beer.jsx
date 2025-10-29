"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

const PHONE_INTL = "886939767977";
const APPEAR_DELAY_MS = 800;

const MARQUEE_ITEMS = [
  { src: "/images/gif/output-onlinegiftools-25.gif", alt: "beer anim 1" },
  { src: "/images/gif/output-onlinegiftools-58.gif", alt: "beer anim 2" },
  { src: "/images/gif/output-onlinegiftools-52.gif", alt: "beer anim 3" },
  { src: "/images/gif/output-onlinegiftools-2.gif", alt: "beer anim 4" },
  { src: "/images/gif/output-onlinegiftools-5.gif", alt: "beer anim 5" },
];

export default function Home() {
  /* ---------- 狀態 ---------- */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* ---------- 抓 WooCommerce 啤酒產品 ---------- */
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products/beer");
        const data = await res.json();
        if (data.ok && Array.isArray(data.items)) {
          setProducts(data.items);
          setQtyMap(Object.fromEntries(data.items.map((p) => [p.id, 1])));
        }
      } catch (err) {
        console.error("抓取 WooCommerce 產品失敗:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  /* ---------- Toast ---------- */
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

  /* ---------- 數量控制 ---------- */
  const setQty = (id, next) =>
    setQtyMap((m) => ({
      ...m,
      [id]: Math.max(0, Number.isFinite(+next) ? +next : 0),
    }));

  const addToCart = (product) => {
    const raw = qtyMap[product.id] ?? 0;
    if (raw <= 0) return;
    const safeQty = Math.max(1, raw);

    cartStore.add(
      { id: product.id, name: product.name, img: product.img },
      safeQty
    );

    // 動畫回饋
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

    showToast(`「${product.name}」已加入購物車（${safeQty} 箱）`);
    setQty(product.id, 0);
  };

  /* ---------- 跑馬燈控制 ---------- */
  const [showMarquee, setShowMarquee] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  /* ---------- 訂閱 Email ---------- */
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) {
      showToast("請先輸入 Email");
      return;
    }
    showToast("訂閱成功，感謝！");
    setSubscribeEmail("");
  };

  /* ---------- Render ---------- */
  return (
    <Layout>
      {/* ✅ 全局 Toast */}
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
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ 跑馬燈 */}
      <AnimatePresence>
        {showMarquee && (
          <motion.div
            key="marquee-wrap"
            className="pointer-events-none w-full py-6 overflow-hidden absolute z-50 left-0 top-20"
            initial={{ opacity: 0, y: 64, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Marquee velocity={28} direction="rtl">
              {MARQUEE_ITEMS.map((item, idx) => (
                <div key={`m1-${idx}`} className="mx-6 flex items-center">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-[420px] object-contain"
                  />
                </div>
              ))}
            </Marquee>
            <Marquee velocity={24} direction="ltr">
              {MARQUEE_ITEMS.map((item, idx) => (
                <div key={`m2-${idx}`} className="mx-6 flex items-center">
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

      {/* ✅ Hero 區塊（保持原樣） */}
      <section className="section_hero relative h-screen overflow-hidden">
        <motion.div
          className="absolute right-20 top-20 z-20"
          initial={{ scale: 1.5, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/images/logo-6.png"
            alt="logo"
            width={800}
            height={500}
            priority
            className="w-[200px]"
          />
        </motion.div>

        <motion.div
          className="absolute left-10 bottom-20 z-20"
          initial={{ scale: 1.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/images/beer02.png"
            alt="beer"
            width={800}
            height={500}
            priority
            className="w-[700px]"
          />
        </motion.div>
      </section>

      {/* ✅ 商品清單區（改成 WooCommerce） */}
      <section className="section-content min-h-screen pb-24">
        <div className="title flex justify-center pt-20 items-center">
          <h4 className="text-[22px] font-bold">ORDER</h4>
        </div>

        {loading ? (
          <p className="text-center mt-10 text-gray-500">載入中...</p>
        ) : (
          <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-8">
            {products.map((p) => {
              const q = qtyMap[p.id] ?? 0;
              return (
                <div
                  key={p.id}
                  className="item flex flex-col justify-center items-center group transition"
                >
                  <div className="item-info mb-2 text-center">
                    <b>{p.name}</b>
                    {p.price && (
                      <p className="text-gray-500 text-sm mt-1">${p.price}</p>
                    )}
                  </div>

                  <Link href={`/beer/${p.slug}`} aria-label={`${p.name} 內頁`}>
                    <Image
                      src={p.img}
                      alt={p.name}
                      className="w-[200px] h-auto transition-transform group-hover:scale-[1.02]"
                      width={330}
                      height={120}
                    />
                  </Link>

                  {/* 數量控制 */}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setQty(p.id, q - 1)}
                      className="rounded-xl border px-4 py-2"
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
                      className="w-20 rounded-xl border px-3 py-2 text-center"
                    />
                    <button
                      onClick={() => setQty(p.id, q + 1)}
                      className="rounded-xl border px-4 py-2"
                    >
                      +
                    </button>
                  </div>

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
        )}
      </section>

      {/* ✅ Newsletter 區 & 地圖 跑馬燈區（完全保留） */}
      <section className="section-newsletter bg-white w-full py-16">
        <motion.form
          onSubmit={handleSubscribe}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-[460px] px-6 text-center"
        >
          <h3 className="text-[20px] font-bold text-gray-800">メルマガ登録</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
            お得な情報や商品の新着など最新情報をお届けします。
          </p>

          <div className="relative mx-auto mt-6">
            <input
              type="email"
              placeholder="メールアドレスを入力"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              className="w-full border-0 border-b border-gray-400 bg-transparent px-3 py-2 text-[14px] outline-none placeholder:text-gray-400 focus:border-gray-700"
            />
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

          <button
            type="submit"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[#2f93a0] px-10 py-3 text-[14px] text-white hover:brightness-110 transition"
          >
            登録する
          </button>
        </motion.form>
      </section>

      <section className="section-map  bg-white pt-20 flex flex-col">
        <div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2608.125676211783!2d-123.1274940232461!3d49.17920177807608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548675082541f249%3A0x87d1f92d1d46df5f!2zTWVtb3J5IENvcm5lciDmnInpppk!5e0!3m2!1szh-TW!2stw!4v1759130334759!5m2!1szh-TW!2stw"
            className="w-full h-[500px]"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="">
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
