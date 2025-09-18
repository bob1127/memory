// app/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Layout from "./Layout";

// ✅ 分別引入 3 個 Book 元件
import Book01 from "../components/Book01";
import Book02 from "../components/Book02";
import Book03 from "../components/Book03";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// 👉 換成你的實際圖片路徑；可放很多張
const TABS = [
  {
    key: "youxiang",
    label: "主食經典",
    images: [
      "/images/有香菜單01.png",
      "/images/有香菜單02.png",
      "/images/有香菜單03.png",
      "/images/有香菜單04.png",
      "/images/有香菜單05.png",
      "/images/有香菜單06.png",
      "/images/有香菜單07.png",
      "/images/有香菜單08.png",
    ],
  },
  {
    key: "yidian",
    label: "快炒小點",
    images: [
      "/images/有香菜單01.png",
      "/images/有香菜單02.png",
      "/images/有香菜單03.png",
      "/images/有香菜單04.png",
      "/images/有香菜單05.png",
      "/images/有香菜單06.png",
      "/images/有香菜單07.png",
      "/images/有香菜單08.png",
    ],
  },
  {
    key: "zaoka",
    label: "飲品專區 ",
    images: [
      "/images/有香菜單01.png",
      "/images/有香菜單02.png",
      "/images/有香菜單03.png",
      "/images/有香菜單04.png",
      "/images/有香菜單05.png",
      "/images/有香菜單06.png",
      "/images/有香菜單07.png",
      "/images/有香菜單08.png",
    ],
  },
];

export default function Home() {
  return (
    <Layout>
      <div className="bg-[#f0cea0]">
        <section className=" grid-cols-2 py-20 max-w-[1300px] mx-auto xl:w-[90%] gap-8 md:w-[90%] w-full grid">
          <div>
            <img src="/images/有香菜單03.png" className="w-full" alt="" />
          </div>
          <div>
            <img src="/images/有香菜單05.png" className="w-full" alt="" />
          </div>
          <div>
            <img src="/images/有香菜單03.png" className="w-full" alt="" />
          </div>
          <div>
            <img src="/images/有香菜單05.png" className="w-full" alt="" />
          </div>
          <div>
            <img src="/images/有香菜單03.png" className="w-full" alt="" />
          </div>
          <div>
            <img src="/images/有香菜單05.png" className="w-full" alt="" />
          </div>
        </section>
      </div>
    </Layout>
  );
}
