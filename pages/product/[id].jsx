// pages/product/[id].jsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../Layout"; // ← 確認 Layout 路徑；若在 /components 就改成 "@/components/Layout"
import { cartStore } from "@/lib/cartStore";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import Image from "next/image";
import HotProductsCarousel from "@/components/HotProductsCarousel";

/* helpers */
const priceFromStore = (p) =>
  p?.prices?.price ? Number(p.prices.price) / 100 : 0;

const imagesFromProduct = (p) =>
  Array.isArray(p?.images) && p.images.length
    ? p.images
    : [{ src: "/images/placeholder.png", alt: p?.name || "product" }];

export default function ProductDetail() {
  const { query } = useRouter();
  const { id } = query;

  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`/api/store/products/${id}`);
        const data = await r.json();
        if (!r.ok || !data?.id) {
          setErr(`讀取失敗 ${r.status}: ${data?.message || "unknown"}`);
        } else {
          setP(data);
        }
      } catch (e) {
        setErr(String(e));
      }
    })();
  }, [id]);

  if (err) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-16 px-4 text-red-600">{err}</div>
      </Layout>
    );
  }
  if (!p) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-16 px-4 text-gray-500">
          載入中…
        </div>
      </Layout>
    );
  }

  const imgs = imagesFromProduct(p);
  const price = priceFromStore(p);

  const add = () => {
    const img = imgs?.[0]?.src || "/images/placeholder.png";
    cartStore.add({ id: p.id, name: p.name, img, price }, Math.max(1, qty));
    alert("已加入購物車");
  };

  return (
    <Layout>
      {/* ★★ Swiper 高度修正：務必存在（讓主圖不再空白） ★★ */}
      <style jsx global>{`
        /* 讓主圖輪播吃到父層高度 */
        .product-swiper,
        .product-swiper .swiper-wrapper,
        .product-swiper .swiper-slide {
          height: 100%;
        }
      `}</style>

      <main className="max-w-6xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 左：主圖 + 縮圖 */}
          <div className="w-full flex flex-col items-center gap-4">
            {/* 主圖容器：用 aspect 比例產生高度，再把高度一路傳給 Swiper/Slide */}
            <div className="w-full max-w-[520px] aspect-[3/4] relative">
              <Swiper
                loop
                navigation
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="product-swiper w-full h-full"
                style={{ height: "100%" }} // 關鍵：確保吃到父層 aspect 高度
              >
                {imgs.map((image, i) => (
                  <SwiperSlide key={`main-${i}`} className="!h-full">
                    <div className="relative w-full h-full min-h-[320px] rounded overflow-hidden bg-white">
                      <Image
                        src={image.src}
                        alt={image.alt || `Product Image ${i}`}
                        fill
                        className="object-contain"
                        sizes="(max-width:768px) 100vw, 520px"
                        priority={i === 0}
                        /* 如果 next.config.js 還沒把 i0.wp.com 加入，就先解鎖：
                           unoptimized
                        */
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* 縮圖列 */}
            <div className="w-full max-w-[520px]">
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                watchSlidesProgress
                modules={[FreeMode, Thumbs]}
                className="w-full"
                breakpoints={{
                  480: { slidesPerView: 5 },
                  768: { slidesPerView: 6 },
                }}
              >
                {imgs.map((image, i) => (
                  <SwiperSlide key={`thumb-${i}`}>
                    <div className="relative w-full aspect-square rounded overflow-hidden cursor-pointer hover:opacity-80 bg-white">
                      <Image
                        src={image.src}
                        alt={image.alt || `Thumbnail ${i}`}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* 右：內容 */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{p.name}</h1>
            <div className="text-xl mb-4">NT$ {price}</div>

            {p.short_description && (
              <div
                className="prose prose-sm text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: p.short_description }}
              />
            )}

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="border rounded px-3 py-1"
              >
                -
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="border rounded px-3 py-1"
              >
                +
              </button>
            </div>

            <button
              onClick={add}
              className="px-6 py-3 bg-black text-white rounded"
            >
              加入購物車
            </button>
          </div>
        </div>

        {/* 詳細介紹 */}
        {p.description && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-2">商品介紹</h2>
            <div
              className="prose prose-sm text-gray-800"
              dangerouslySetInnerHTML={{ __html: p.description }}
            />
          </div>
        )}

        {/* 推薦產品（保底顯示至少一張卡） */}
        <section className="mt-16">
          <h3 className="text-xl font-bold mb-4">其他推薦產品</h3>
          <RelatedCarousel
            currentId={p.id}
            categories={p.categories}
            currentFirstImage={imgs?.[0]?.src || "/images/placeholder.png"}
            currentPrice={price}
          />
        </section>
      </main>
    </Layout>
  );
}

/* 推薦區：即使只剩自己，也會顯示自己一張卡 */
function RelatedCarousel({
  currentId,
  categories,
  currentFirstImage,
  currentPrice,
}) {
  return (
    <HotProductsCarousel
      fetchFromWoo
      perPage={12}
      excludeId={currentId}
      categoryIds={(categories || []).map((c) => c.id)}
      fallbackItem={{
        id: currentId,
        name: "本商品",
        img: currentFirstImage,
        price: currentPrice,
      }}
      onAdd={(prod) =>
        cartStore.add(
          { id: prod.id, name: prod.name, img: prod.img, price: prod.price },
          1
        )
      }
    />
  );
}
