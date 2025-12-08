"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

/* =================================================================
   1. 靜態 UI 翻譯資料庫
   ================================================================= */
const PAGE_TRANSLATIONS = {
  "zh-TW": {
    not_found: "找不到此商品",
    add_to_cart: "加入購物車",
    add_success_prefix: "已加入購物車：",
    currency: "NT$",
  },
  en: {
    not_found: "Product not found",
    add_to_cart: "Add to Cart",
    add_success_prefix: "Added to cart: ",
    currency: "NT$",
  },
};

export default function BeerInner({ product }) {
  const { locale } = useRouter();
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];

  // 判斷是否為英文模式
  const isEn = locale === "en";

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  if (!product)
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>{t.not_found}</p>
        </div>
      </Layout>
    );

  /* ---------- 決定顯示的名稱與描述 ---------- */
  const displayName =
    isEn && product.name_en ? product.name_en : product.name_zh;
  const displayDesc =
    isEn && product.desc_en ? product.desc_en : product.desc_zh;

  /* ---------- [修改] 加入購物車 ---------- */
  const addToCart = () => {
    // 這裡我們直接使用 getStaticProps 已經整理好的 name_zh 和 name_en
    const zhName = product.name_zh || product.name; // fallback if empty
    const enName = product.name_en || product.name_zh; // fallback if empty

    cartStore.add(
      {
        id: product.id,
        name: zhName, // Default/Fallback
        name_zh: zhName, // ✅ 明確存入中文名
        name_en: enName, // ✅ 明確存入英文名
        img: product.images[0],
        price: Number(product.price),
      },
      qty
    );
    setToast(true);
    setQty(1);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <Layout>
      <section className="w-full bg-white mx-auto px-4 sm:px-6 lg:px-8 py-[100px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
          {/* ---------- 左：圖片區 ---------- */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="aspect-square rounded-2xl overflow-hidden ">
              <Swiper
                modules={[Thumbs]}
                spaceBetween={12}
                thumbs={{ swiper: thumbsSwiper }}
                className="w-full h-full"
              >
                {(product.images?.length
                  ? product.images
                  : ["/images/beer04.png"]
                ).map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`${displayName} - ${idx + 1}`}
                        fill
                        priority={idx === 0}
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 600px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={5}
              breakpoints={{
                480: { slidesPerView: 5 },
                768: { slidesPerView: 6 },
                1024: { slidesPerView: 7 },
              }}
              modules={[Thumbs]}
              className="mt-3"
            >
              {(product.images?.length
                ? product.images
                : ["/images/beer04.png"]
              ).map((img, idx) => (
                <SwiperSlide key={idx}>
                  <Image
                    src={img}
                    alt={`thumb-${idx}`}
                    width={140}
                    height={140}
                    className="rounded-xl aspect-square object-cover border transition-all duration-200"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* ---------- 右：商品資訊 ---------- */}
          <div className="flex flex-col gap-6">
            <header className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                {displayName}
              </h1>
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs sm:text-sm border border-neutral-300 px-3 py-1 rounded-full text-neutral-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* 價格顯示區塊 */}
            <div className="flex items-end gap-3">
              {Number(product.regular_price) > Number(product.price) ? (
                <>
                  <p className="text-3xl font-semibold tracking-tight text-red-600">
                    {t.currency} {product.price}
                  </p>
                  <p className="text-neutral-400 line-through text-lg mb-1">
                    {t.currency} {product.regular_price}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {t.currency} {product.price}
                </p>
              )}
            </div>

            {/* 描述 */}
            {displayDesc && (
              <div
                className="prose prose-neutral max-w-none prose-img:rounded-xl text-gray-600 custom-html-content"
                dangerouslySetInnerHTML={{ __html: displayDesc }}
              />
            )}

            {/* 數量 + 加入購物車 */}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 border border-gray-600 rounded-[10px]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-neutral-50 transition"
                >
                  −
                </button>
                <span className="text-lg w-10 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-neutral-50 transition"
                >
                  +
                </button>
              </div>

              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-black text-white py-3 px-8 font-medium hover:bg-neutral-800 transition shadow-sm"
              >
                {t.add_to_cart}
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Toast 通知 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: [0.45, 0, 0.1, 1] }}
            className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-[#c1a46f] text-white text-sm sm:text-base px-6 py-3 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
              {t.add_success_prefix}
              {displayName}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* =================================================================
   SSG + ISR: 資料抓取 (保持不變)
   ================================================================= */

// 1. 抓取所有路徑
export async function getStaticPaths() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/products/beer`);
    const data = await res.json();
    const paths = (data.items || []).map((p) => ({
      params: { slug: p.slug },
    }));
    return { paths, fallback: "blocking" };
  } catch (err) {
    console.error("⚠️ getStaticPaths 無法連線:", err.message);
    return { paths: [], fallback: "blocking" };
  }
}

// 2. 抓取單一商品詳細資料
export async function getStaticProps({ params }) {
  const { slug } = params;
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;

  try {
    // 呼叫 WooCommerce API
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?slug=${slug}&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
    );
    const data = await res.json();
    if (!data?.length) throw new Error("找不到商品");

    const p = data[0];
    let finalPrice = p.price || p.sale_price || p.regular_price || "0";

    // 處理變體商品價格 (Variable Product)
    if (p.type === "variable" && (!p.price || p.price === "0")) {
      const varRes = await fetch(
        `${WC_URL}/wp-json/wc/v3/products/${p.id}/variations?consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
      );
      const varData = await varRes.json();
      if (Array.isArray(varData) && varData.length > 0) {
        finalPrice =
          varData[0].price ||
          varData[0].sale_price ||
          varData[0].regular_price ||
          finalPrice;
      }
    }

    // 解析自訂欄位
    const meta = p.meta_data || [];
    const enName = pickEnName(meta);
    const enDesc = pickEnDesc(meta);

    const product = {
      id: p.id,
      name_zh: p.name,
      desc_zh: p.description || "",
      name_en: enName,
      desc_en: enDesc,
      price: finalPrice,
      regular_price: p.regular_price || "0",
      images: p.images?.map((img) => img.src) || ["/images/beer04.png"],
      tags: p.tags?.map((t) => t.name),
    };

    return { props: { product }, revalidate: 300 };
  } catch (err) {
    console.error("❌ 讀取商品錯誤:", err);
    return {
      props: { product: null },
      revalidate: 300,
    };
  }
}

// Helper: 解碼 HTML (避免 <style> 標籤被 escape)
function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function pickEnName(meta = []) {
  const row = meta.find((m) => m?.key === "zh_product_name");
  return row?.value ? String(row.value) : "";
}

function pickEnDesc(meta = []) {
  const row = meta.find((m) => m?.key === "zh_short_description");
  return row?.value ? decodeHtml(String(row.value)) : "";
}
