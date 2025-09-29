// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "./Layout";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

/** ---- Tabs 設定：五個按鈕 + 每個 tab 的圖片清單（先放示意） ---- */
const TABS = [
  {
    key: "classic",
    label: "主食經典",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",

      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",

      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "snacks",
    label: "快炒小點",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",

      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",

      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "drinks",
    label: "飲品專區",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",

      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",

      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "combo",
    label: "超值套餐",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",

      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",

      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
  {
    key: "seasonal",
    label: "季節限定",
    images: [
      "/images/menu/有香/有香_202503菜單本3.jpg",
      "/images/menu/有香/有香_202503菜單本4.jpg",

      "/images/menu/有香/有香_202503菜單本5.jpg",
      "/images/menu/有香/有香_202503菜單本6.jpg",
      "/images/menu/有香/有香_202503菜單本7.jpg",

      "/images/menu/有香/有香_202503菜單本8.jpg",
    ],
  },
];

export default function Home() {
  const [active, setActive] = useState(TABS[0].key);

  // 大幅度、絲滑的進出場
  const enter = { opacity: 0, y: 56, filter: "blur(10px)" };
  const center = { opacity: 1, y: 0, filter: "blur(0px)" };
  const exit = { opacity: 0, y: -56, filter: "blur(10px)" };
  const TRANSITION = { duration: 0.65, ease: [0.18, 0.8, 0.26, 1] };

  const current = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <Layout>
      <section className="bg-[#8c2022] flex justify-center items-center h-[50vh]">
        <Image
          src="/images/菜單-logo.png"
          alt="菜單-logo"
          width={600}
          height={400}
          placeholder="empty"
          priority
          className="max-w-[550px] pt-10 "
        ></Image>
      </section>
      <div className="bg-[#f0cea0]">
        <section className="max-w-[1300px] mx-auto xl:w-[90%] md:w-[90%] w-full py-16">
          {/* Tabs */}
          <div className="flex flex-wrap mt-2 gap-3 items-center justify-center mb-8">
            {TABS.map((tab) => {
              const isActive = tab.key === active;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`group relative rounded-full px-4 py-2 text-sm transition
                    ${
                      isActive
                        ? "text-white"
                        : "text-stone-700 hover:text-black"
                    }
                  `}
                  aria-pressed={isActive}
                >
                  {/* 背景膠囊（活躍狀態下淡入） */}
                  <span
                    className={`absolute inset-0 rounded-full transition ${
                      isActive
                        ? "bg-[#ab2626]"
                        : "bg-black/0 group-hover:bg-black/5"
                    }`}
                  />
                  <span className="relative z-10 tracking-wide">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 內容：每排只顯示一張圖片 */}
          <MotionConfig transition={TRANSITION}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={enter}
                animate={center}
                exit={exit}
                style={{ willChange: "transform, opacity, filter" }}
                className="grid mt-[90px] grid-cols-1 gap-6"
              >
                {current.images.map((src, i) => (
                  <div key={`${active}-${i}`} className="w-full">
                    {/* 你可改成 <Image>；這裡用 img 簡單直接 */}
                    <img
                      src={src}
                      alt={`${current.label} ${i + 1}`}
                      className="w-[95%] mx-auto h-auto  shadow-sm transition-transform duration-300  hover:scale-[1.01]"
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </MotionConfig>
        </section>
      </div>
    </Layout>
  );
}
