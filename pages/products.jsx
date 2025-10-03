"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

const APPEAR_DELAY_MS = 800;

export default function Home() {
  const [items, setItems] = useState([]); // ← Woo 商品
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState({});
  const [showMarquee, setShowMarquee] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // 抓 Woo 商品（公開）
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/store/products?per_page=48`);
        const data = await r.json();
        setItems(Array.isArray(data) ? data : []);
        // 初始化各商品數量 = 1
        const init = Object.fromEntries(
          (Array.isArray(data) ? data : []).map((p) => [p.id, 1])
        );
        setQtyMap(init);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setQty = (id, next) =>
    setQtyMap((m) => ({
      ...m,
      [id]: Math.max(0, Number.isFinite(+next) ? +next : 0),
    }));

  const toastTimerRef = useRef(null);
  const [toast, setToast] = useState(null);
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

  const addToCart = (p) => {
    const q = qtyMap[p.id] ?? 0;
    if (q <= 0) return;

    // Woo Store API 價格是「字串數字（分）」，例如 "10000" = NT$100.00
    const priceNumber = p?.prices?.price ? Number(p.prices.price) / 100 : 0;
    const img = p?.images?.[0]?.src || "/images/placeholder.png";

    cartStore.add(
      {
        id: p.id, // 必須是 Woo 數字 id
        name: p.name,
        img,
        price: priceNumber, // 讓結帳頁可直接算小計
        sku: p.sku || "",
      },
      q
    );

    showToast(`「${p.name}」已加入購物車（${q} 件）`);
    setQty(p.id, 0);
  };

  return (
    <Layout>
      {/* 簡易 Toast */}
      <div className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: -8, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
              transition={{ duration: 0.36 }}
              className="mb-8 rounded-xl bg-black text-white px-4 py-2 shadow-lg"
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 你的 Hero / Marquee 保留（略） */}

      <section className="section-content min-h-screen pb-24">
        <div className="title flex justify-center pt-20 items-center">
          <h4 className="text-[22px] font-bold">ORDER</h4>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">載入商品中…</div>
        ) : (
          <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-8">
            {items.map((p) => {
              const q = qtyMap[p.id] ?? 0;
              const img = p?.images?.[0]?.src || "/images/placeholder.png";
              const price = p?.prices?.price
                ? Number(p.prices.price) / 100
                : null;
              return (
                <div
                  key={p.id}
                  className="item flex flex-col justify-center items-center group"
                >
                  <div className="item-info mb-2">
                    <b>{p.name}</b>
                    {price !== null && (
                      <div className="text-sm text-gray-600">NT$ {price}</div>
                    )}
                  </div>

                  <Link href={`/product/${p.id}`} aria-label={`${p.name} 內頁`}>
                    {/* 用原生 img 可跨網域；若想 Image 需要設定 next.config 的 remotePatterns */}
                    <img
                      src={img}
                      alt={p.name}
                      className="w-[200px] h-auto transition-transform group-hover:scale-[1.02]"
                    />
                  </Link>

                  {/* 數量 */}
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
                      className="w-28 rounded-xl border px-3 py-2 text-center"
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
                    disabled={q <= 0}
                    className={`mt-3 rounded-xl px-4 py-2 text-white ${
                      q > 0
                        ? "bg-black hover:opacity-90"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    加入購物車
                  </button>

                  <Link
                    href={`/product/${p.id}`}
                    className="mt-3 text-sm underline underline-offset-4 hover:opacity-80"
                  >
                    產品資訊
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}
