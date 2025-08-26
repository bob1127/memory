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
  // ======= 桌機：圖牆 + Popup =======
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const currentTab = TABS[active];
  const imgs = useMemo(() => currentTab.images, [currentTab]);

  useEffect(() => {
    setViewerOpen(false);
    setViewerIndex(0);
  }, [active]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setViewerOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, viewerIndex, active]);

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };
  const goPrev = () =>
    setViewerIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const goNext = () => setViewerIndex((i) => (i + 1) % imgs.length);

  // ======= 手機：按鈕 → 進入「下一頁感覺」的 Bookxx =======
  // menu | book1 | book2 | book3
  const [mobileView, setMobileView] = useState("menu");
  const [slideDir, setSlideDir] = useState(1); // 1: 往右進場（從右邊滑入）；-1: 往左回到上一頁

  // 手機頁面開啟時鎖捲動
  useEffect(() => {
    if (mobileView === "menu") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileView]);

  const enterBook = (which) => {
    setSlideDir(1);
    setMobileView(which); // "book1" | "book2" | "book3"
  };
  const backToMenu = () => {
    setSlideDir(-1);
    setMobileView("menu");
  };

  const pageVariants = {
    initial: (d) => ({
      x: d > 0 ? "100%" : "-100%",
      opacity: 0.9,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 380, damping: 36, mass: 0.9 },
    },
    exit: (d) => ({
      x: d > 0 ? "-8%" : "8%",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeInOut" },
    }),
  };

  return (
    <Layout>
      <section className="fixed z-50 left-0 bottom-4 fixed-switch w-full ">
        <div className="w-full justify-center items-center flex switch">
          <div className="flex bg-[#ff2929] justify-center items-center px-6 py-3   rounded-[40px]">
            <div className="flex text-gray-200 justify-center flex-col items-center">
              Uber Eat <br></br>
              <span className="text-[14px]">(立即訂餐)</span>
            </div>
            <span className="mx-4 text-white">|</span>
            <div className="flex text-gray-200 justify-center flex-col items-center">
              Waiting list <br></br>
              <span className="text-[14px]">(預約候位)</span>
            </div>
          </div>
        </div>
      </section>
      {/* ======= Desktop Hero（保留你的設計） ======= */}
      <section className="title bg-[#2b2d2c] hidden sm:block overflow-hidden h-[90vh] pt-[150px] relative">
        <div className="color-bar bg-[#fd3737] h-[200px] absolute w-full left-0 !top-1/2 -translate-y-1/2 z-30"></div>
        <div className="main-txt w-full absolute z-50 left-[0%] top-[5%] p-20">
          <div className="flex w-full border-t border-gray-400 pt-8 flex-col justify-center items-start">
            <h1 className="text-[#c9c9c9] font-extrabold text-4xl">
              MEMORY FOOD
            </h1>
            <p className="text-[#c6c6c6]">記憶中的好味道</p>
          </div>
        </div>
        <div className="absolute main-img z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/images/menu-01.png"
            alt="main-img"
            width={1000}
            height={1000}
            placeholder="empty"
            priority
            className="max-w-[680px]"
          />
        </div>
        <div className="absolute main-img-01 z-40 left-[20%] bottom-[-5%] -translate-x-1/2">
          <Image
            src="/images/beer04.png"
            alt="main-img"
            width={1000}
            height={1000}
            placeholder="empty"
            priority
            className="max-w-[380px] rotate-[20deg]"
          />
        </div>
      </section>

      {/* ======= Mobile：按鈕清單 & 進入 Book 分頁 ======= */}
      <section className="section-title-mobile block sm:hidden bg-[#2b2d2c] overflow-hidden h-[100vh] pt-[150px] relative">
        {/* 背景與標題（主畫面） */}
        <div className="main-txt w-full absolute z-10 left-[0%] top-[5%] px-6">
          <div className="flex w-full border-t border-gray-400 pt-6 flex-col justify-center items-start">
            <h1 className="text-[#c9c9c9] font-extrabold text-3xl">
              MEMORY FOOD
            </h1>
            <p className="text-[#c6c6c6]">記憶中的好味道</p>
          </div>
        </div>

        {/* 三個按鈕（主畫面） */}
        <div className="color-bar h-[200px] absolute w-full left-0 !top-1/2 -translate-y-1/2 z-20">
          <div className="menu-btn flex flex-col h-full justify-center items-center w-full gap-4">
            <button
              onClick={() => enterBook("book1")}
              className="px-6 py-3 rounded-full bg-white/90 text-black text-base font-medium"
            >
              有香餐飲
            </button>
            <button
              onClick={() => enterBook("book2")}
              className="px-6 py-3 rounded-full bg-white/90 text-black text-base font-medium"
            >
              一點點
            </button>
            <button
              onClick={() => enterBook("book3")}
              className="px-6 py-3 rounded-full bg-white/90 text-black text-base font-medium"
            >
              有香ㄟ灶咖
            </button>
          </div>
        </div>

        {/* 主視覺圖（主畫面） */}
        <div className="absolute w-full main-img z-10 left-1/2 bottom-[-18%] -translate-x-1/2 ">
          <Image
            src="/images/menu-01.png"
            alt="main-img"
            width={1000}
            height={1000}
            placeholder="empty"
            priority
            className="w-[86%] mx-auto"
          />
        </div>

        {/* ======= Mobile Page Transition 層：從右滑入的「下一頁」感覺 ======= */}
        <AnimatePresence initial={false} custom={slideDir}>
          {mobileView !== "menu" && (
            <motion.div
              key={mobileView}
              custom={slideDir}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-[1000] bg-white overflow-hidden"
            >
              {/* 頂部導覽（返回 & 標題） */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-black/10 bg-white/90 backdrop-blur">
                <button
                  onClick={backToMenu}
                  className="rounded-full px-3 py-1.5 bg-black text-white text-sm"
                  aria-label="back"
                >
                  ← 返回
                </button>
                <div className="text-sm text-black/70">
                  {mobileView === "book1" && "有香餐飲"}
                  {mobileView === "book2" && "一點點"}
                  {mobileView === "book3" && "有香ㄟ灶咖"}
                </div>
                <div className="w-[64px]" />
              </div>

              {/* Book 內容：全螢幕滾動區域 */}
              <div className="relative h-[calc(100vh-52px)] overflow-y-auto">
                {mobileView === "book1" && <Book01 />}
                {mobileView === "book2" && <Book02 />}
                {mobileView === "book3" && <Book03 />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ======= Desktop：Tabs + 圖牆（4欄） + Popup 檢視 ======= */}
      <section className="section-hero-desktop py-[150px] sm:flex flex-col justify-center items-center hidden min-h-[100svh]">
        <div className="title flex justify-center">
          <h2 className="text-gray-800 text-3xl font-normal tracking-wider">
            MENUS
          </h2>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="品牌切換"
          className="mx-auto mt-8 flex w-[90%] max-w-[1200px] items-center justify-center gap-6"
        >
          {TABS.map((t, i) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === i}
              aria-controls={`panel-${t.key}`}
              onClick={() => setActive(i)}
              className={`relative px-2 py-1 text-base transition-colors ${
                active === i
                  ? "font-semibold text-black"
                  : "text-black/50 hover:text-black/80"
              }`}
            >
              {t.label}
              {active === i && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-1/2 top-[calc(100%+6px)] h-[2px] w-[70%] -translate-x-1/2 bg-black"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* 圖片網格：grid-cols-4、無邊框無陰影，切換時整牆 fade */}
        <div className="mx-auto mt-6 w-[90%] max-w-[1400px]">
          <LayoutGroup>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab.key}
                role="tabpanel"
                id={`panel-${currentTab.key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {imgs.map((src, idx) => (
                  <button
                    key={src}
                    onClick={() => openViewer(idx)}
                    className="group relative w-full overflow-hidden rounded-none shadow-none ring-0 outline-none"
                    aria-label={`open image ${idx + 1}`}
                  >
                    <motion.div
                      layoutId={`img-${active}-${idx}`}
                      className="relative aspect-[3/4] w-full"
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    >
                      <Image
                        src={src}
                        alt={`menu-${idx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 320px"
                        className="object-contain bg-transparent select-none pointer-events-none rounded-none shadow-none ring-0 outline-none"
                        priority={idx < 4}
                      />
                    </motion.div>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Popup Viewer（桌機） */}
            <AnimatePresence>
              {viewerOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-[999] bg-black/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setViewerOpen(false)}
                  />
                  <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                  >
                    <motion.div
                      key={`viewer-${active}-${viewerIndex}`}
                      layoutId={`img-${active}-${viewerIndex}`}
                      className="relative w-[92vw] max-w-[1200px] h-[85vh]"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                      drag="x"
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 120) goPrev();
                        if (info.offset.x < -120) goNext();
                      }}
                    >
                      <Image
                        src={imgs[viewerIndex]}
                        alt={`preview-${viewerIndex + 1}`}
                        fill
                        className="object-contain select-none"
                        sizes="90vw"
                        priority
                      />
                      <button
                        onClick={() => setViewerOpen(false)}
                        className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-white backdrop-blur-sm"
                        aria-label="close"
                      >
                        ✕
                      </button>
                      <button
                        onClick={goPrev}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white backdrop-blur-sm"
                        aria-label="previous"
                      >
                        ‹
                      </button>
                      <button
                        onClick={goNext}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white backdrop-blur-sm"
                        aria-label="next"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                        {viewerIndex + 1} / {imgs.length}
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </section>
    </Layout>
  );
}
