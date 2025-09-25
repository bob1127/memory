"use client";

import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Layout from "./Layout";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import HotProductsCarousel from "@/components/HotProductsCarousel";
import { cartStore } from "@/lib/cartStore"; // ★ 引入購物車 store

/** ===== 假資料（可自由更換） ===== */
const FAKE_PRODUCT = {
  id: 1001,
  name: "記憶拉格｜Lager · 370ml",
  price: 199,
  short_description:
    "乾淨俐落、收口清爽。適合任何你想放鬆的夜晚。<br/>使用低溫發酵，強調麥香與細緻碳酸。",
  description: `
    <p>更完整的商品介紹可以放這裡，支援 HTML。你也可以把釀造筆記、食物搭配、保存方式等資訊放進來。</p>
    <ul>
      <li>酒精：5.5%</li>
      <li>容量：370ml</li>
      <li>原料：大麥麥芽、啤酒花、酵母、水</li>
    </ul>
  `,
  images: [
    { src: "/images/beer04.png", alt: "Lager 主圖 1" },
    { src: "/images/beer05.png", alt: "Lager 主圖 2" },
    { src: "/images/beer06.png", alt: "Lager 主圖 3" },
  ],
};

/** 假的熱銷清單（給輪播用） */
const HOT_ITEMS = [
  { id: "h1", name: "皮爾森 · 330ml", price: 89, img: "/images/beer05.png" },
  { id: "h2", name: "淡愛爾 · 500ml", price: 129, img: "/images/beer06.png" },
  { id: "h3", name: "世濾 · 330ml", price: 99, img: "/images/beer04.png" },
  { id: "h4", name: "經典拉格 · 500ml", price: 139, img: "/images/beer05.png" },
  { id: "h5", name: "黑啤 · 330ml", price: 109, img: "/images/beer06.png" },
];

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);

  const product = FAKE_PRODUCT;
  const images = product.images?.length
    ? product.images
    : [{ src: "/images/placeholder.png", alt: product.name }];

  /** 加入購物車 */
  const handleAddToCart = () => {
    cartStore.add({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      img: images[0]?.src,
    });
    alert("已加入購物車！");
  };

  return (
    <Layout>
      <Head>
        <title>{product.name}</title>
      </Head>

      <div className="max-w-6xl mx-auto py-20 px-4">
        <div className="flex flex-col lg:flex-row gap-12 py-[60px]">
          {/* ===== 圖片區 ===== */}
          <div className="w-full lg:w-1/2 flex flex-col items-center gap-4">
            <div className="w-full max-w-[520px] aspect-[3/4] relative">
              <Swiper
                onSwiper={setMainSwiper}
                loop
                navigation
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="w-full h-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="w-full h-full relative rounded overflow-hidden ">
                      <Image
                        src={image.src}
                        alt={image.alt || `Product Image ${index}`}
                        fill
                        className="object-cover bg-white"
                        sizes="(max-width:768px) 100vw, 520px"
                        priority={index === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* 小圖 */}
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
                {images.map((image, index) => (
                  <SwiperSlide key={`thumb-${index}`}>
                    <div className="w-full aspect-square relative rounded overflow-hidden cursor-pointer hover:opacity-80">
                      <Image
                        src={image.src}
                        alt={image.alt || `Thumbnail ${index}`}
                        fill
                        className="object-cover bg-white"
                        sizes="(max-width:768px) 20vw, 80px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* ===== 內容區 ===== */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start">
            <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-gray-800 mb-4">NT${product.price}</p>

            {product.short_description && (
              <div
                className="text-gray-600 mb-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 border rounded"
              >
                -
              </button>
              <span className="min-w-[2ch] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 border rounded"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-2 px-6 py-3 bg-[#e39820] text-white max-w-[150px] rounded hover:opacity-90 transition"
            >
              加入購物車
            </button>

            <div className="mt-12">
              <h2 className="text-xl font-bold mb-2">商品介紹</h2>
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>
        </div>

        <section className="mt-10 grid md:grid-cols-3 gap-6">
          {/* 介紹卡 */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold text-lg mb-3">風味筆記</h3>
            <p className="text-gray-700 leading-relaxed">
              以低溫長時間發酵，帶出乾淨麥香與細緻碳酸；口感清爽，苦味適中，尾韻乾淨不黏口。建議飲用溫度
              6–8℃
            </p>
          </div>

          {/* 規格表 */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold text-lg mb-3">規格資訊</h3>
            <table className="w-full text-sm">
              <tbody className="[&_td]:py-1.5 [&_td]:align-top [&_td:first-child]:text-gray-500">
                <tr>
                  <td>容量</td>
                  <td>370ml</td>
                </tr>
                <tr>
                  <td>酒精濃度</td>
                  <td>5.5%</td>
                </tr>
                <tr>
                  <td>原料</td>
                  <td>大麥麥芽、啤酒花、酵母、水</td>
                </tr>
                <tr>
                  <td>保存方式</td>
                  <td>建議冷藏，避免陽光直射</td>
                </tr>
                <tr>
                  <td>有效期限</td>
                  <td>製造日起 4 個月</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 出貨/退換 */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-semibold text-lg mb-3">出貨與退換</h3>
            <ul className="text-gray-700 list-disc pl-5 space-y-1">
              <li>工作日下單 24–48 小時內出貨。</li>
              <li>易碎品將以防撞材妥善包裝。</li>
              <li>未拆封可於 7 日鑑賞期內退換（運費自付）。</li>
            </ul>
          </div>
        </section>

        {/* FAQ（手風琴） */}
        <section className="mt-8">
          <h3 className="font-semibold text-lg mb-3">常見問題</h3>
          <Accordion
            items={[
              {
                q: "需要冷藏配送嗎？",
                a: "一般常溫配送即可，收到後建議冷藏保存、冰鎮後風味更佳。",
              },
              {
                q: "含酒精能否超商取貨？",
                a: "依各地法規限制，部分通路可能不支援，請以結帳頁可選配送方式為準。",
              },
              {
                q: "是否提供禮盒與客製卡片？",
                a: "可，請在結帳備註填寫需求或聯繫客服。",
              },
            ]}
          />
        </section>

        {/* ===== 熱銷產品輪播 ===== */}
        <section className="mt-14">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">熱銷產品</h2>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              看更多
            </a>
          </div>
          <HotProductsCarousel
            items={HOT_ITEMS}
            onAdd={(item) =>
              cartStore.add({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: 1,
                img: item.img,
              })
            }
          />
        </section>
      </div>
    </Layout>
  );
}
/** 簡易手風琴 */
function Accordion({ items = [] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y rounded-2xl border bg-white">
      {items.map((it, i) => {
        const isOpen = i === open;
        return (
          <div key={i}>
            <button
              className="w-full text-left px-4 py-3 flex items-center justify-between"
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span className="font-medium">{it.q}</span>
              <span className="text-gray-500">{isOpen ? "－" : "＋"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-gray-700 leading-relaxed">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
