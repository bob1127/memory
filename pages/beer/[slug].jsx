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

  const addToCart = () => {
    cartStore.add(
      { id: product.id, name: product.name, img: product.images[0] },
      qty
    );
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <Layout>
      {/* ---------- 主內容 ---------- */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* ---------- 左側圖片區 ---------- */}
        <div className="relative w-full">
          {/* 主圖 */}
          <Swiper
            modules={[Thumbs]}
            spaceBetween={10}
            thumbs={{ swiper: thumbsSwiper }}
            className="mb-4 rounded-2xl overflow-hidden shadow-md"
          >
            {product.images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <Image
                  src={img}
                  alt={product.name}
                  width={900}
                  height={900}
                  className="w-full h-auto object-cover"
                  priority={idx === 0}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 縮圖 */}
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            breakpoints={{
              640: { slidesPerView: 5 },
              1024: { slidesPerView: 6 },
            }}
            modules={[Thumbs]}
            className="cursor-pointer"
          >
            {product.images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <Image
                  src={img}
                  alt={`thumb-${idx}`}
                  width={100}
                  height={100}
                  className="rounded-lg aspect-square object-cover border hover:border-black transition-all duration-200"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ---------- 右側商品資訊 ---------- */}
        <div className="flex flex-col gap-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide leading-snug">
            <span className="text-gray-400 mr-2">BEER</span>
            {product.name}
          </h1>

          {/* Tag 標籤 */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs sm:text-sm border border-gray-300 px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* 價格區 */}
          <div className="mt-3">
            <p className="text-3xl font-semibold text-black">
              NT$ {product.price}
            </p>
            {product.regular_price && (
              <p className="text-gray-400 line-through text-sm mt-1">
                NT$ {product.regular_price}
              </p>
            )}
          </div>

          {/* 描述 */}
          {product.desc && (
            <div
              className="prose prose-sm sm:prose-base text-gray-700 mt-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.desc }}
            />
          )}

          {/* 數量控制 */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl hover:bg-gray-100 transition"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, parseInt(e.target.value || "1", 10)))
              }
              className="w-16 text-center border rounded-lg py-2 text-base"
            />
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl hover:bg-gray-100 transition"
            >
              +
            </button>
          </div>

          {/* 加入購物車按鈕 */}
          <motion.button
            onClick={addToCart}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full sm:w-auto rounded-full bg-black text-white py-3 px-10 text-center font-medium hover:bg-neutral-800 transition"
          >
            加入購物車
          </motion.button>
        </div>
      </section>

      {/* ---------- Toast 通知（下方淡入淡出） ---------- */}
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
            <div className="bg-black text-white text-sm sm:text-base px-6 py-3 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-green-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
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
    // fallback 模式下允許手動輸入網址仍可動態生成
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

    if (!data?.length) {
      // 若沒抓到就顯示假資料
      return {
        props: {
          product: {
            id: 0,
            name: "測試啤酒商品",
            price: "199",
            regular_price: "250",
            images: ["/images/beer04.png"],
            desc: "<p>暫無商品資料，這是範例內容。</p>",
            tags: ["Local", "Craft"],
          },
        },
        revalidate: 300,
      };
    }

    const p = data[0];
    const product = {
      id: p.id,
      name: p.name,
      price: p.price,
      regular_price: p.regular_price,
      images: p.images?.map((img) => img.src) || ["/images/beer04.png"],
      desc: p.description || "",
      tags: p.tags?.map((t) => t.name),
    };

    return { props: { product }, revalidate: 300 };
  } catch (err) {
    console.error("❌ 讀取商品錯誤:", err);
    // fallback 假資料
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
