"use client";

import React, { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

/**
 * 熱銷產品 Embla Carousel（參照樣式）
 * @param {Array}  items  - [{ id, name, price, img, leftNote?, rightNote? }]
 * @param {Function} onAdd - 點擊加入購物車時觸發 (p)=>void
 */
export default function HotProductsCarousel({ items = [], onAdd }) {
  // 自動播放：3 秒一格、滑鼠移入暫停
  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1, dragFree: false },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-full">
      {/* 右上角箭頭 */}
      <div className="pointer-events-auto absolute -top-5 right-2 z-10 flex gap-2">
        <button
          onClick={scrollPrev}
          aria-label="上一個"
          className="size-9 rounded-full bg-white text-black/80 shadow ring-1 ring-black/10 hover:bg-black hover:text-white transition"
        >
          ‹
        </button>
        <button
          onClick={scrollNext}
          aria-label="下一個"
          className="size-9 rounded-full bg-white text-black/80 shadow ring-1 ring-black/10 hover:bg-black hover:text-white transition"
        >
          ›
        </button>
      </div>

      {/* Embla */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {items.map((p, idx) => (
            <div
              key={p.id ?? idx}
              className="
                embla__slide px-4 
                flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%]
              "
            >
              {/* 卡片（盡量貼近參考圖：大量留白、陰影極淡） */}
              <article className="group bg-white overflow-visible flex flex-col h-full shadow-sm hover:shadow-md transition">
                {/* 視覺區（高佔比） */}
                <div className="relative w-full aspect-[4/5]">
                  {/* 橢圓背景（超淡） */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-[86%] w-[66%] rounded-full bg-stone-100"></div>
                  </div>

                  {/* 左右直書輔助文字（可按項目傳入 leftNote/rightNote，不傳則用預設） */}
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <span className="[writing-mode:vertical-rl] text-[11px] tracking-widest text-stone-400 select-none">
                      {p.leftNote ?? "季節限定"}
                    </span>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <span className="[writing-mode:vertical-rl] text-[11px] tracking-widest text-stone-400 select-none">
                      {p.rightNote ?? "クラフトラガー"}
                    </span>
                  </div>

                  {/* 商品罐身 */}
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    priority={false}
                    className="object-contain transition-transform duration-300 group-hover:-translate-y-1"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  />

                  {/* 右下角 + 加入購物車快捷鍵 */}
                  <button
                    onClick={() => onAdd?.(p)}
                    aria-label="加入購物車"
                    className="
                      absolute bottom-[20%] right-[16%]
                      size-10 rounded-full bg-white text-black shadow
                      ring-1 ring-black/10
                      grid place-items-center
                      hover:bg-black hover:text-white transition
                    "
                  >
                    +
                  </button>
                </div>

                {/* 文案區 */}
                <div className="px-4 pt-3 pb-5 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-[13px] font-bold leading-tight line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="mt-1 text-[12px] text-stone-500">
                      {typeof p.price !== "undefined" ? `NT$${p.price}` : ""}
                    </div>
                  </div>

                  {/* 底部操作按鈕（對應參考圖的右側小圓鈕，這裡保留一個完整按鈕） */}
                  <div className="mt-auto pt-3">
                    <button
                      onClick={() => onAdd?.(p)}
                      className="w-full rounded-full bg-black text-white py-2 text-xs hover:opacity-90 transition"
                    >
                      加入購物車
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
