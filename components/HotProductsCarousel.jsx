"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

/**
 * 熱銷產品 Embla Carousel
 * @param {Array} items - [{id, name, price, img}]
 * @param {Function} onAdd - 點擊加入購物車時觸發
 */
export default function HotProductsCarousel({ items = [], onAdd }) {
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  return (
    <div className="">
      <div className=" w-[1300px] overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {items.map((p, idx) => (
            <div
              key={p.id || idx}
              className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-4"
            >
              <article className=" bg-white overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition">
                {/* 商品圖片 */}
                <div className="relative w-full aspect-square">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-contain bg-white"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  />
                </div>

                {/* 商品資訊 */}
                <div className="p-4 flex-1 flex flex-col">
                  <b className="line-clamp-2">{p.name}</b>
                  <div className="mt-1 text-stone-700">NT${p.price}</div>

                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => onAdd?.(p)}
                      className="w-full rounded-lg bg-[#e19c36] text-white py-2 text-sm hover:opacity-90 transition"
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
