"use client";

import { useState } from "react";
import Image from "next/image";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

export default function BeerInner({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  if (!product)
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>找不到此商品</p>
        </div>
      </Layout>
    );

  /* ---------- 加入購物車 ---------- */
  const addToCart = () => {
    cartStore.add(
      {
        id: product.id,
        name: product.name,
        img: product.images[0],
        price: Number(product.price || product.regular_price || 0),
      },
      qty
    );
    setToast(true);
    setQty(1); // ✅ 加入購物車後重置數量
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <Layout>
      <section className="w-full bg-white mx-auto px-4 sm:px-6 lg:px-8  py-[100px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
          {/* ---------- 左：圖片區 ---------- */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-sm bg-neutral-50">
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
                        alt={`${product.name} - 圖片 ${idx + 1}`}
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
                {product.name}
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

            <div className="flex items-end gap-3">
              <p className="text-3xl font-semibold tracking-tight">
                NT$ {product.price}
              </p>
              {product.regular_price &&
                product.regular_price !== product.price && (
                  <p className="text-neutral-400 line-through">
                    NT$ {product.regular_price}
                  </p>
                )}
            </div>

            {product.desc && (
              <div
                className="prose prose-neutral max-w-none prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: product.desc }}
              />
            )}

            {/* ✅ 數量 + 加入購物車 */}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 border border-gray-600 rounded-[10px]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-full  flex items-center justify-center text-xl hover:bg-neutral-50 transition"
                >
                  −
                </button>
                <span className="text-lg w-10 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 rounded-full  flex items-center justify-center text-xl hover:bg-neutral-50 transition"
                >
                  +
                </button>
              </div>

              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-black text-white py-3 px-8 font-medium hover:bg-neutral-800 transition shadow-sm"
              >
                加入購物車
              </motion.button>
            </div>

            {/* ---------- 詳細說明 ---------- */}
            <div className="divide-y border rounded-xl overflow-hidden">
              <details className="group open:bg-neutral-50">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
                  <span>成分 / 風味</span>
                  <span className="transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-neutral-700">
                  麥芽、水、啤酒花。清爽收尾與淡淡麥香。
                </div>
              </details>
              <details className="group open:bg-neutral-50">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
                  <span>運送說明</span>
                  <span className="transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-neutral-700">
                  常溫/低溫配送（依品項而定）；下單後 1–2 個工作天出貨。
                </div>
              </details>
              <details className="group open:bg-neutral-50">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
                  <span>退換政策</span>
                  <span className="transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-neutral-700">
                  收到商品 7 天內未開封可申請退換；詳見網站退換貨說明。
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Toast 通知 */}
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
              已加入購物車：{product.name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* ---------- SSG + ISR ---------- */
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
    console.error("⚠️ getStaticPaths 無法連線 WooCommerce:", err.message);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;

  try {
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?slug=${slug}&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
    );
    const data = await res.json();
    if (!data?.length) throw new Error("找不到商品");

    const p = data[0];
    let finalPrice = p.price || p.sale_price || p.regular_price || "0";

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

    const product = {
      id: p.id,
      name: p.name,
      price: finalPrice,
      regular_price: p.regular_price || p.price || "0",
      images: p.images?.map((img) => img.src) || ["/images/beer04.png"],
      desc: p.description || "",
      tags: p.tags?.map((t) => t.name),
    };

    return { props: { product }, revalidate: 300 };
  } catch (err) {
    console.error("❌ 讀取商品錯誤:", err);
    return {
      props: {
        product: {
          id: 0,
          name: "暫無連線",
          price: "0",
          images: ["/images/beer04.png"],
          desc: "<p>目前無法連接 WooCommerce API，請稍後再試。</p>",
        },
      },
      revalidate: 300,
    };
  }
}
