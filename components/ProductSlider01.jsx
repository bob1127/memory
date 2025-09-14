"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductSlider({
  slides = [
    {
      title: "有香 Memory Corner ",
      subtitle: "Crisp & clean flavor profile",
      src: "/images/hotpot-shadow.png",
      thumbs: [
        { src: "/images/vg07.png", label: "抹茶" },
        { src: "/images/vg08.png", label: "草莓" },
        { src: "/images/vg04.png", label: "可可" },
      ],
      decor: {
        topBanner: {
          title: "BUY NOW",
          subtitle: "『 歡迎詢問訂購 』",
          className: "left-1/2 -translate-x-1/2 top-[3%]",
        },
        images: [
          {
            src: "/images/ed20658c0f18d9c0addf9381d5a80e42.jpg",
            alt: "sticker",
            width: 140,
            height: 50,
            className: "right-[5%] top-[10%] w-[110px] rotate-[-30deg]",
          },
          {
            src: "/images/text01.png",
            alt: "slogan",
            width: 140,
            height: 50,
            className: "right-[25%] bottom-[12%] w-[170px] rotate-[-10deg]",
          },
        ],
        infoCard: {
          className: "left-[5%] top-[20%]",
          tagText: "Beer",
          heading: "Memory Dining Group",
          lead: "讓【有香ㄟ灶腳】成為你家的冰箱後援\n備餐神隊友",
          description:
            "嚴選冷凍美食、經典台灣零食飲料和台味小物，從熟悉的味道，到日常的補給，一次買齊！讓【有香ㄟ灶腳】成為你家的冰箱後援、備餐神隊友：再忙也能快速上桌，再累也吃得到美味。把廚房交給我們，把時間留給最重要的人。",
        },
      },
    },
    {
      title: "有香 Memory Corner ",
      subtitle: "Crisp & clean flavor profile",
      src: "/images/beer01.png",
      thumbs: [
        { src: "/images/beer04.png", label: "啤酒" },
        { src: "/images/beer05.png", label: "啤酒" },
        { src: "/images/beer06.png", label: "啤酒" },
      ],
      decor: {
        topBanner: {
          title: "BUY NOW",
          subtitle: "『 歡迎詢問訂購 』",
          className: "left-1/2 -translate-x-1/2 top-[3%]",
        },
        images: [
          {
            src: "/images/ed20658c0f18d9c0addf9381d5a80e42.jpg",
            alt: "sticker",
            width: 140,
            height: 50,
            className: "right-[5%] top-[10%] w-[110px] rotate-[-30deg]",
          },
          {
            src: "/images/text01.png",
            alt: "slogan",
            width: 140,
            height: 50,
            className: "right-[25%] bottom-[12%] w-[170px] rotate-[-10deg]",
          },
        ],
        infoCard: {
          className: "left-[5%] top-[20%]",
          tagText: "Beer",
          heading: "Memory Dining Group",
          lead: "讓【有香ㄟ灶腳】成為你家的冰箱後援\n備餐神隊友",
          description:
            "嚴選冷凍美食、經典台灣零食飲料和台味小物，從熟悉的味道，到日常的補給，一次買齊！",
        },
      },
    },
    {
      title: "有香ㄟ灶腳 Old Memory Kitchen",
      subtitle: "Rich notes of spice & herbs",
      src: "/images/img-3.png",
      thumbs: [
        { src: "/images/desert.png", label: "青花椒" },
        { src: "/images/desert.png", label: "番茄鍋" },
        { src: "/images/desert.png", label: "牛奶鍋" },
      ],
    },
  ],

  /** ✅ 右下產品輪播：可自訂對應到哪個 slide（toIndex），未指定則預設 go next */
  productItems = [
    { src: "/images/beer04.png", label: "精釀 01", toIndex: 1 },
    { src: "/images/beer05.png", label: "精釀 02", toIndex: 1 },
    { src: "/images/beer06.png", label: "精釀 03", toIndex: 1 },
    { src: "/images/vg07.png", label: "小料 01", toIndex: 0 },
    { src: "/images/vg08.png", label: "小料 02", toIndex: 0 },
    { src: "/images/vg04.png", label: "小料 03", toIndex: 0 },
    { src: "/images/desert.png", label: "甜點", toIndex: 2 },
  ],

  // 主圖進出動畫
  switchDelay = 0.5,
  dur = 1.0,

  // 不規則發散縮圖自訂（主圖周圍那群）
  thumbsMax = 6,
  thumbSize = 88,
  baseRadius = 40,
  radiusStep = 84,
  jitter = 18,
  angleStartDeg = -45,
  angleEndDeg = 85,
  spiralSkew = 0.45,

  thumbBorderRadius = 16,
  thumbStagger = 0.06,
  springEnter = { type: "spring", stiffness: 520, damping: 30, mass: 0.7 },
  springExit = { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
}) {
  const itemsRef = useRef([]);
  const [current, setCurrent] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const initedRef = useRef(false);
  const directionForwardRef = useRef(true);
  const activeTLRef = useRef({ in: null, out: null });

  // ===== 工具：角度亂數 =====
  const toRad = (deg) => (deg * Math.PI) / 180;
  const rand = (seed) => {
    let x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };

  // ===== 主圖進退場 =====
  const setInitial = () => {
    const items = itemsRef.current.filter(Boolean);
    items.forEach((item, idx) => {
      const card = item.querySelector(".card");
      if (idx === current) {
        gsap.set(item, { opacity: 1 });
        gsap.set(card, { x: 0, rotate: 0 });
      } else {
        gsap.set(item, { opacity: 1 });
        gsap.set(card, { x: "100vw", rotate: 40 });
      }
    });
  };

  const animateIn = (item) => {
    if (!item) return null;
    const forward = directionForwardRef.current;
    const card = item.querySelector(".card");
    return gsap
      .timeline({
        defaults: { duration: dur, ease: "expo.out" },
        onComplete: () => setIsSettled(true),
      })
      .fromTo(
        card,
        { x: forward ? "100vw" : "-100vw", rotate: 40 },
        { x: 0, rotate: 0 },
        0
      );
  };

  const animateOut = (item) => {
    if (!item) return null;
    const forward = directionForwardRef.current;
    const card = item.querySelector(".card");
    return gsap
      .timeline({
        defaults: { duration: dur, ease: "power3.inOut" },
        onStart: () => setIsSettled(false),
      })
      .to(card, { x: forward ? "-100vw" : "100vw", rotate: -40 }, 0);
  };

  const go = (dir) => {
    if (!initedRef.current) return;
    const items = itemsRef.current.filter(Boolean);
    if (!items.length) return;
    directionForwardRef.current = dir === "next";
    activeTLRef.current.in?.kill();
    activeTLRef.current.out?.kill();
    const outEl = items[current];
    activeTLRef.current.out = animateOut(outEl);
    const nextIdx =
      dir === "next"
        ? (current + 1) % items.length
        : (current - 1 + items.length) % items.length;

    gsap.delayedCall(switchDelay, () => {
      const inEl = items[nextIdx];
      const forward = directionForwardRef.current;
      gsap.set(inEl.querySelector(".card"), {
        x: forward ? "100vw" : "-100vw",
        rotate: 40,
      });
      activeTLRef.current.in = animateIn(inEl);
      setCurrent(nextIdx);
    });
  };

  /** ✅ 直接切換到指定 index（給底部輪播用） */
  const goTo = (targetIdx) => {
    const items = itemsRef.current.filter(Boolean);
    if (!initedRef.current || !items.length) return;
    if (
      !Number.isInteger(targetIdx) ||
      targetIdx < 0 ||
      targetIdx >= items.length ||
      targetIdx === current
    ) {
      // 不合法或相同 index → 當作 next
      return go("next");
    }

    // 估算方向（簡單版）
    directionForwardRef.current = targetIdx > current;

    activeTLRef.current.in?.kill();
    activeTLRef.current.out?.kill();

    const outEl = items[current];
    activeTLRef.current.out = animateOut(outEl);

    gsap.delayedCall(switchDelay, () => {
      const inEl = items[targetIdx];
      const forward = directionForwardRef.current;
      gsap.set(inEl.querySelector(".card"), {
        x: forward ? "100vw" : "-100vw",
        rotate: 40,
      });
      activeTLRef.current.in = animateIn(inEl);
      setCurrent(targetIdx);
    });
  };

  const handleNext = () => go("next");
  const handlePrev = () => go("prev");

  // ===== 初始 =====
  useLayoutEffect(() => {
    if (initedRef.current) return;
    setInitial();
    initedRef.current = true;
    return () => {
      activeTLRef.current.in?.kill();
      activeTLRef.current.out?.kill();
      gsap.globalTimeline.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 當前資料
  const idx =
    Number.isInteger(current) && current >= 0 && current < (slides?.length ?? 0)
      ? current
      : 0;
  const slide = slides?.[idx] ?? { title: "", subtitle: "", ctaHref: "#" };
  const currentThumbs =
    slide.thumbs?.slice(0, thumbsMax) ??
    Array.from({ length: Math.min(3, thumbsMax) }, () => ({
      src: slide.src,
      label: "",
    }));

  // ===== 不規則發散縮圖座標（主圖周圍） =====
  const computeScatter = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const t = i / Math.max(1, count - 1);
      const ang =
        angleStartDeg + (angleEndDeg - angleStartDeg) * t ** (1 - spiralSkew);
      const r =
        baseRadius + i * radiusStep + (rand(current * 10 + i) * 2 - 1) * jitter;

      const x =
        Math.cos(toRad(ang)) * r +
        (rand(current * 20 + i) * 2 - 1) * (jitter * 0.35);
      const y =
        Math.sin(toRad(ang)) * r +
        (rand(current * 30 + i) * 2 - 1) * (jitter * 0.35);

      const adjX = x < 0 ? Math.abs(x) * 0.6 : x; // 稍微右偏，避免壓到主圖
      out.push({ x: adjX, y });
    }
    return out;
  };
  const scatter = computeScatter(currentThumbs.length);

  // 縮圖變體（主圖周圍那群）
  const itemVariants = {
    initial: () => ({ opacity: 0, scale: 0.65, x: 0, y: 0 }),
    enter: (i) => ({
      opacity: 1,
      scale: 1,
      x: scatter[i]?.x ?? 0,
      y: scatter[i]?.y ?? 0,
      transition: { ...springEnter, delay: i * thumbStagger },
    }),
    exit: (i) => ({
      opacity: 0,
      scale: 0.8,
      x: 0,
      y: 0,
      transition: {
        ...springExit,
        delay: (currentThumbs.length - 1 - i) * 0.02,
      },
    }),
  };

  // ====== 底部產品輪播 ======
  const railRef = useRef(null);
  const scrollByAmt = 280;
  const scrollLeft = () =>
    railRef.current?.scrollBy({ left: -scrollByAmt, behavior: "smooth" });
  const scrollRight = () =>
    railRef.current?.scrollBy({ left: scrollByAmt, behavior: "smooth" });

  return (
    <section
      className="
        grid w-full bg-white
        grid-cols-1 lg:grid-cols-2
        isolate
      "
    >
      {/* 左半：純背景圖 */}
      <div
        className="left relative z-10 min-h-[100vh]"
        style={{
          backgroundImage:
            "url('https://image.memorycorner8.com/DAV02145.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 右半：主圖 + 不規則發散縮圖 + 底部產品輪播 */}
      <div className="right !bg-[#f0f1ec] flex-col flex relative">
        {/* 裝飾群組 */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`decor-${current}`}
            className="relative lg:absolute inset-0 z-40 pointer-events-none"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  duration: 0.4,
                  when: "beforeChildren",
                  staggerChildren: 0.06,
                },
              },
              exit: { opacity: 0, transition: { duration: 0.25 } },
            }}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Top Banner */}
            {slide?.decor?.topBanner && (
              <motion.div
                className={`pointer-events-auto relative lg:absolute lg:left-[43%] top-0 left-0 lg:top-[7%] lg:-translate-x-1/2 ${
                  slide.decor.topBanner.className || "top-[7%]"
                }`}
                variants={{
                  initial: { opacity: 0, y: -8 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
                }}
              >
                <div className="flex flex-col justify-center items-center text-center">
                  <span className="font-extrabold text-[20px]">
                    {slide.decor.topBanner.title}
                  </span>
                  <div>{slide.decor.topBanner.subtitle}</div>
                  <div className="line h-[.5px] bg-black w-full"></div>
                </div>
              </motion.div>
            )}

            {/* 漂浮圖片 */}
            {Array.isArray(slide?.decor?.images) &&
              slide.decor.images.length > 0 && (
                <motion.div
                  className="absolute inset-0"
                  variants={{
                    initial: {},
                    animate: { transition: { staggerChildren: 0.06 } },
                    exit: {},
                  }}
                >
                  {slide.decor.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      className={`pointer-events-none absolute ${
                        img.className || ""
                      }`}
                      variants={{
                        initial: { opacity: 0, scale: 0.94, y: 6 },
                        animate: {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: { duration: 0.35 },
                        },
                        exit: {
                          opacity: 0,
                          scale: 0.96,
                          y: -6,
                          transition: { duration: 0.2 },
                        },
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt || `decor-${idx + 1}`}
                        placeholder="empty"
                        loading="lazy"
                        width={img.width || 140}
                        height={img.height || 50}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

            {/* infoCard（若有定義就顯示） */}
            {slide?.decor?.infoCard && (
              <motion.div
                className={`pointer-events-auto relative lg:absolute ${
                  slide.decor.infoCard.className || "left-[5%] top-[20%]"
                }`}
                variants={{
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
                }}
                style={{ overflow: "visible" }}
              >
                <div>
                  {slide.decor.infoCard.tagText && (
                    <span className="tag border w-[80px] text-center border-gray-500 px-3 py-1 text-[14px] rounded-[20px] font-bold inline-block mt-2">
                      {slide.decor.infoCard.tagText}
                    </span>
                  )}
                  <br />
                  {slide.decor.infoCard.heading && (
                    <h3 className="border-b-1 text-2xl my-4 text-[#2f2f2f] inline-block border-[#313131]">
                      {slide.decor.infoCard.heading}
                    </h3>
                  )}
                  {slide.decor.infoCard.lead && (
                    <p className=" max-w-full lg:max-w-[20vw] text-[#2f2f2f] whitespace-pre-line">
                      {slide.decor.infoCard.lead}
                    </p>
                  )}
                  {slide.decor.infoCard.description && (
                    <div className="max-w-full lg:max-w-[14vw] mt-5 whitespace-pre-line leading-loose tracking-widest text-[14px]">
                      {slide.decor.infoCard.description}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ===== 主圖卡片區 ===== */}
        <div className="card-slider pb-[140px]">
          {" "}
          {/* 預留底部輪播高度 */}
          <div className="nav">
            <button className="prev" onClick={handlePrev} aria-label="Previous">
              <svg viewBox="0 0 50 9">
                <path d="m0 4.5 5-3m-5 3 5 3m45-3h-77"></path>
              </svg>
            </button>
            <button className="next" onClick={handleNext} aria-label="Next">
              <svg viewBox="0 0 50 9">
                <path d="m0 4.5 5-3m-5 3 5 3m45-3h-77"></path>
              </svg>
            </button>
          </div>
          <div className="items">
            {slides.map((s, i) => (
              <div
                key={i}
                className={`item ${i === current ? "is-active" : ""}`}
                ref={(el) => {
                  if (el) itemsRef.current[i] = el;
                }}
              >
                <div className="card">
                  {/* 主圖周圍縮圖群：主圖定位後爆開 */}
                  {i === current && (
                    <AnimatePresence initial={false}>
                      {isSettled && (
                        <motion.div
                          key={`thumbs-${i}-${current}`}
                          className="thumbs-radial ml-[25%]"
                          style={{
                            position: "absolute",
                            left: "40%",
                            top: "10%",
                            width: 0,
                            height: 0,
                            zIndex: 2,
                            pointerEvents: "auto",
                          }}
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        >
                          {currentThumbs.map((t, ti) => (
                            <motion.button
                              key={ti}
                              className="thumb"
                              custom={ti}
                              initial="initial"
                              animate="enter"
                              exit="exit"
                              variants={itemVariants}
                              whileHover={{
                                scale: 1.06,
                                transition: {
                                  type: "spring",
                                  stiffness: 420,
                                  damping: 24,
                                },
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleNext()} // 與你原本 /images/beer04.png 行為一致：下一張
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                transform: "translate(-50%, -50%)",
                                width: thumbSize,
                                height: thumbSize,
                                borderRadius: thumbBorderRadius,
                                background: "transparent",
                                border: "none",
                                overflow: "hidden",
                                display: "grid",
                                placeItems: "center",
                                zIndex: 99999,
                              }}
                              aria-label={t.label || `thumb-${ti + 1}`}
                            >
                              <img
                                src={t.src}
                                alt={t.label || `thumb-${ti + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* 主圖 */}
                  <img className="card-bg" src={s.src} alt={s.title} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====== 右半底部：產品輪播（左右切換 + 點擊觸發轉場） ====== */}
        <div className="product-carousel">
          <button
            className="pnav prev"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>

          <div className="rail" ref={railRef}>
            {productItems.map((p, i) => (
              <button
                key={`${p.src}-${i}`}
                className="pitem"
                onClick={() =>
                  Number.isInteger(p.toIndex) ? goTo(p.toIndex) : handleNext()
                }
                title={p.label || "product"}
              >
                <img src={p.src} alt={p.label || `product-${i + 1}`} />
                {p.label && <span className="plabel">{p.label}</span>}
              </button>
            ))}
          </div>

          <button
            className="pnav next"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .right {
          position: relative;
          background: #f6f7f9;
          min-height: 100vh;
        }
        .card-slider {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .items {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .item {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          overflow: visible;
          pointer-events: none;
        }
        .item.is-active {
          pointer-events: auto;
        }
        .card {
          width: min(58vh, 48vw);
          height: min(58vh, 48vw);
          position: relative;
          overflow: visible;
        }
        .card img.card-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.1);
          transition: transform 2s cubic-bezier(0.86, 0, 0.07, 1);
          will-change: transform;
          z-index: 3;
          pointer-events: none;
        }
        .item.is-active .card img.card-bg {
          transform: scale(1);
        }

        .nav .next,
        .nav .prev {
          position: absolute;
          height: 2.25rem;
          width: 2.25rem;
          stroke: #111;
          cursor: pointer;
          z-index: 10;
          pointer-events: auto;
          background: #fff;
          border-radius: 999px;
          border: 1px solid #00000010;
          display: grid;
          place-items: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
          transition: transform 0.15s ease, box-shadow 0.25s ease;
        }
        .nav .next:hover,
        .nav .prev:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
        }
        .nav .next {
          bottom: 2.5rem;
          right: 2.5rem;
          transform: rotate(180deg);
        }
        .nav .prev {
          bottom: 2.5rem;
          right: 6rem;
        }
        .nav svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke-width: 1.5px;
        }

        /* ===== 右下產品輪播 ===== */
        .product-carousel {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 14px 64px; /* 留空間給左右箭頭 */
          background: linear-gradient(
            180deg,
            rgba(240, 241, 236, 0) 0%,
            rgba(240, 241, 236, 0.75) 40%,
            rgba(240, 241, 236, 0.96) 100%
          );
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 50;
          backdrop-filter: blur(2px);
        }
        .product-carousel .rail {
          overflow-x: auto;
          display: flex;
          gap: 12px;
          padding: 6px 2px;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }
        .product-carousel .rail::-webkit-scrollbar {
          display: none;
        }

        .product-carousel .pitem {
          flex: 0 0 auto;
          width: 110px;
          height: 110px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #00000010;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          display: grid;
          place-items: center;
          overflow: hidden;
          scroll-snap-align: start;
          transition: transform 0.15s ease, box-shadow 0.25s ease,
            border-color 0.25s ease;
        }
        .product-carousel .pitem:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
          border-color: #00000022;
        }
        .product-carousel .pitem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-carousel .plabel {
          position: absolute;
          bottom: 6px;
          left: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 11px;
          line-height: 1;
          padding: 6px 8px;
          border-radius: 10px;
          text-align: center;
          pointer-events: none;
        }

        .product-carousel .pnav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid #00000014;
          background: #fff;
          display: grid;
          place-items: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          z-index: 60;
        }
        .product-carousel .pnav.prev {
          left: 14px;
        }
        .product-carousel .pnav.next {
          right: 14px;
        }
        .product-carousel .pnav svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #111;
          stroke-width: 2;
        }

        @media (max-width: 1024px) {
          .right {
            order: -1;
            min-height: 80vh;
          }
          .card {
            width: min(48vh, 86vw);
            height: min(48vh, 86vw);
          }
          .product-carousel {
            padding: 10px 52px;
          }
          .product-carousel .pitem {
            width: 96px;
            height: 96px;
          }
        }
      `}</style>
    </section>
  );
}
