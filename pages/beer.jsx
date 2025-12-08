"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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

/* =================================================================
   1. 靜態 UI 翻譯資料庫
   ================================================================= */
const PAGE_TRANSLATIONS = {
  "zh-TW": {
    title: "ORDER",
    loading: "載入中...",
    add_to_cart: "加入購物車",
    add_success_prefix: "「",
    add_success_suffix: "」已加入購物車",
    unit: "箱",
    currency: "NT$",
  },
  en: {
    title: "ORDER",
    loading: "Loading...",
    add_to_cart: "Add to Cart",
    add_success_prefix: "",
    add_success_suffix: " has been added to cart",
    unit: "box(es)",
    currency: "NT$",
  },
};

/** 價格處理 Helper */
const priceFromItem = (p) => {
  if (!p) return 0;
  // Store API 回傳的價格通常是字串且含單位 (e.g., "10000" 代表 100.00)
  // 或者有時候是 prices 物件

  let price = 0;

  // 優先使用 prices 物件 (Store API 標準)
  if (p.prices) {
    // 價格通常是「最小單位」整數 (例如 8616 代表 86.16)
    // 需要除以 100
    const rawPrice =
      p.prices.price || p.prices.sale_price || p.prices.regular_price;
    if (rawPrice) return Number(rawPrice) / 100;
  }

  // fallback: 直接讀取最外層屬性 (V3 API 格式)
  const raw = p.price || p.sale_price || p.regular_price || 0;
  if (typeof raw === "string") return parseFloat(raw);
  return Number(raw);
};

export default function Home({ initialItems = [] }) {
  /* ---------- 取得語系 ---------- */
  const { locale } = useRouter();
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  // 判斷是否為英文版
  const isEn = locale === "en";

  /* ---------- 狀態 ---------- */
  const [products, setProducts] = useState(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);

  // 建立數量 Map
  const [qtyMap, setQtyMap] = useState({});
  useEffect(() => {
    if (initialItems.length > 0) {
      setQtyMap(Object.fromEntries(initialItems.map((p) => [p.id, 1])));
      setLoading(false);
    }
  }, [initialItems]);

  /* ---------- 客戶端抓取 (備用 / 更新) ---------- */
  useEffect(() => {
    if (initialItems.length > 0) return;

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
  }, [initialItems]);

  /* ---------- Toast ---------- */
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = (text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, text });
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };
  useEffect(() => {
    return () => toastTimerRef.current && clearTimeout(toastTimerRef.current);
  }, []);

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
    const price = priceFromItem(product);

    // 決定要存入購物車的名稱 (依據當前語言)
    const enName = product.extensions?.custom_acf?.en_product_name;
    // 如果是英文版且有英文名，用英文；否則用中文名 (product.name)
    const displayName = isEn && enName ? enName : product.name;

    cartStore.add(
      {
        id: product.id,
        name: displayName,
        img: product.img,
        price,
      },
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

    if (locale === "en") {
      showToast(
        `${t.add_success_prefix}${displayName}${t.add_success_suffix} (${safeQty} ${t.unit})`
      );
    } else {
      showToast(
        `${t.add_success_prefix}${displayName}${t.add_success_suffix}（${safeQty} ${t.unit}）`
      );
    }

    setQty(product.id, 0);
  };

  /* ---------- 跑馬燈控制 ---------- */
  const [showMarquee, setShowMarquee] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // HTML 解碼 (避免 &lt;style&gt; 被印出來)
  const decodeHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  };

  /* ---------- Render ---------- */
  return (
    <Layout>
      <div className="bg-[#f9f6f3]">
        {/* Toast */}
        <div className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center">
          <AnimatePresence mode="wait">
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: -8, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
                className="mb-8 rounded-xl bg-[#c1a46f] text-white px-4 py-2 shadow-lg text-sm sm:text-base"
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
            >
              <Marquee velocity={28} direction="rtl">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <div key={`m1-${idx}`} className="mx-6 flex items-center">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="w-[clamp(220px,60vw,420px)] sm:w-[clamp(260px,50vw,420px)] object-contain h-auto max-w-full"
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
                      className="w-[clamp(220px,60vw,420px)] sm:w-[clamp(260px,50vw,420px)] object-contain h-auto max-w-full"
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
            className="absolute left-[-10%] sm:left-10 bottom-20 z-20"
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
              className=" w-[400px] lg:w-[700px]"
            />
          </motion.div>
        </section>

        {/* 商品列表 */}
        <section className="section-content bg-white min-h-screen py-24">
          <div className="title flex justify-center pt-20 items-center">
            <h4 className="text-[22px] font-bold">{t.title}</h4>
          </div>

          {loading ? (
            <p className="text-center mt-10 text-gray-500">{t.loading}</p>
          ) : (
            <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-8">
              {products.map((p) => {
                const q = qtyMap[p.id] ?? 0;
                const displayPrice = priceFromItem(p);

                // --- 1. 名稱處理邏輯 ---
                // 取得英文名稱 (存在 custom_acf.en_product_name 中)
                const enName = p.extensions?.custom_acf?.en_product_name;

                // 如果是英文版(isEn)且有英文名，用英文；否則用預設(中文)名
                const displayName = isEn && enName ? enName : p.name;

                // --- 2. 描述處理邏輯 ---
                // 取得英文描述 (存在 custom_acf.en_description 中)
                const enDesc = p.extensions?.custom_acf?.en_description;

                // 如果是英文版且有英文描述，用英文；否則用預設短描述(Store API)
                // 記得解碼 HTML
                const rawDesc =
                  isEn && enDesc ? enDesc : p.short_description || "";
                const displayDesc = decodeHtml(rawDesc);

                return (
                  <div
                    key={p.id}
                    className="item flex flex-col justify-center items-center group transition"
                  >
                    <div className="item-info mb-2 text-center px-2">
                      {/* 名稱 */}
                      <b className="block min-h-[1.5em] text-lg">
                        {displayName}
                      </b>

                      {/* 價格 */}
                      {displayPrice > 0 && (
                        <p className="text-black font-medium text-sm mt-2">
                          {t.currency}
                          {displayPrice}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/beer/${p.slug}`}
                      aria-label={`${displayName} 內頁`}
                      className="relative block w-[240px] h-[240px]"
                    >
                      <Image
                        src={p.img}
                        alt={displayName}
                        fill
                        sizes="(max-width: 768px) 100vw, 240px"
                        className="object-contain p-2 transition-transform group-hover:scale-[1.05]"
                      />
                    </Link>

                    {/* 數量控制 */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => setQty(p.id, q - 1)}
                        className="rounded-xl border px-4 py-2 hover:bg-gray-50"
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
                        className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      id={`btn-${p.id}`}
                      disabled={q <= 0}
                      className={`mt-3 rounded-xl px-4 py-2 text-white transition-colors ${
                        q > 0
                          ? "bg-black hover:opacity-90"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {t.add_to_cart}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 地圖 */}
        <section className="section-map bg-white pt-20 flex flex-col">
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
      </div>
    </Layout>
  );
}

/* =================================================================
   Server Side Data Fetching
   ================================================================= */
export async function getStaticProps({ locale }) {
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;

  let initialItems = [];

  try {
    // 1. 抓取基本商品列表 (Store API - 效能較好)
    const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
    storeURL.searchParams.set("per_page", "100");

    const r = await fetch(storeURL.toString(), {
      headers: { Accept: "application/json" },
    });
    const rawList = (await r.json()) || [];
    const list = Array.isArray(rawList) ? rawList : [];

    // 取得需要查詢 Meta 的 ID 列表
    const ids = list
      .map((p) => p.id)
      .filter(Boolean)
      .slice(0, 100);

    // 2. 抓取 Meta Data (V3 API) - 為了拿到英文名稱(zh_product_name)和英文描述(zh_short_description)
    let metaMap = new Map();
    if (ids.length && ck && cs) {
      const v3 = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
      v3.searchParams.set("include", ids.join(","));
      v3.searchParams.set("per_page", String(ids.length));
      // 這裡只需要 id 和 meta_data
      v3.searchParams.set("_fields", "id,meta_data");

      const vr = await fetch(v3.toString(), {
        headers: {
          Accept: "application/json",
          Authorization: basicAuth(ck, cs),
        },
      });

      if (vr.ok) {
        const v3data = await vr.json();
        for (const it of Array.isArray(v3data) ? v3data : []) {
          metaMap.set(it.id, {
            meta: it.meta_data || [],
          });
        }
      }
    }

    // 3. 合併資料
    initialItems = list.map((p) => {
      const detail = metaMap.get(p.id) || { meta: [] };

      // 抓取 Meta 中的英文名稱 (key = zh_product_name)
      const enName = pickMetaValue(detail.meta, "zh_product_name");

      // 抓取 Meta 中的英文描述 (key = zh_short_description)
      const enDesc = pickMetaValue(detail.meta, "zh_short_description");

      // 確保結構存在
      if (!p.extensions) p.extensions = {};
      if (!p.extensions.custom_acf) p.extensions.custom_acf = {};

      // 將抓到的英文資料填入自訂結構中
      // (我們重新命名 key 比較不會搞混: zh_product_name -> en_product_name)
      p.extensions.custom_acf.en_product_name = enName;
      p.extensions.custom_acf.en_description = enDesc;

      // 圖片整理
      p.img = p.images?.[0]?.src || "/images/placeholder.png";

      return p;
    });
  } catch (e) {
    console.error("getStaticProps error:", e);
  }

  return {
    props: {
      initialItems,
    },
    revalidate: 60,
  };
}

/* --- Helpers --- */
function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}

function basicAuth(ck, cs) {
  return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
}

// 通用 Meta 抓取 Helper
function pickMetaValue(meta = [], targetKey) {
  const row = meta.find((m) => m?.key === targetKey && m?.value);
  return row?.value ? String(row.value) : "";
}
