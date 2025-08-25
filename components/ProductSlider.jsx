"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductSlider({
  slides = [
    {
      title: "有香 Memory Corner ",
      subtitle: "Crisp & clean flavor profile",
      src: "/images/hotpot-shadow.png",
      ctaText: "外帶自取",
      ctaHref: "#",
      thumbs: [
        { src: "/images/vg07.png", label: "抹茶" },
        { src: "/images/vg08.png", label: "草莓" },
        { src: "/images/vg04.png", label: "可可" },
        { src: "/images/vg08.png", label: "草莓" },
        { src: "/images/vg04.png", label: "可可" },
      ],
    },
    {
      title: "憶點點 Sweet Memory ",
      subtitle: "Bold taste with a smooth finish",
      src: "/images/beer01.png",
      ctaText: "外帶自取",
      ctaHref: "#",
      thumbs: [
        { src: "/images/order_now.png", label: "拿鐵" },
        { src: "/images/beer05.png", label: "美式" },
        { src: "/images/beer04.png", label: "卡布" },
        { src: "/images/beer06.png", label: "摩卡" },
      ],
    },
    {
      title: "有香ㄟ灶腳 Old Memory Kitchen",
      subtitle: "Rich notes of spice & herbs",
      src: "/images/img-3.png",
      ctaText: "外帶自取",
      ctaHref: "#",
      thumbs: [
        { src: "/images/desert.png", label: "青花椒" },
        { src: "/images/desert.png", label: "番茄鍋" },
        { src: "/images/desert.png", label: "牛奶鍋" },
      ],
    },
  ],

  // 主圖進出動畫
  switchDelay = 0.5,
  dur = 1.0,
  letterStagger = 0.03,

  // —— 不規則發散縮圖自訂 —— //
  thumbsMax = 6, // 顯示幾張
  thumbSize = 88, // 縮圖大小
  baseRadius = 40, // 第一張距中心半徑
  radiusStep = 84, // 後續每張往外疊加的半徑
  jitter = 18, // 位置隨機抖動幅度（px）
  angleStartDeg = -45, // 右半邊扇區起始角（-90=正上、0=正右、+90=正下）
  angleEndDeg = 85, // 右半邊扇區結束角
  spiralSkew = 0.45, // 角度遞增量（讓分佈更自然）

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

  // 左側文字
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const splitRefs = useRef({ title: null, subtitle: null });

  // Utils
  const isEl = (el) =>
    typeof window !== "undefined" &&
    el &&
    el.nodeType === 1 &&
    el instanceof window.HTMLElement;
  const inDoc = (el) =>
    typeof document !== "undefined" && el && document.contains(el);

  const setCopy = (idx) => {
    const tEl = titleRef.current;
    const sEl = subtitleRef.current;
    if (!isEl(tEl) || !isEl(sEl)) return;
    const next = slides?.[idx] ?? { title: "", subtitle: "" };
    try {
      splitRefs.current.title?.revert?.();
      splitRefs.current.subtitle?.revert?.();
    } catch {}
    tEl.innerHTML = "";
    sEl.innerHTML = "";
    tEl.textContent = next.title || "\u00A0";
    sEl.textContent = next.subtitle || "\u00A0";
  };

  const playTextAnimation = () => {
    const tEl = titleRef.current;
    const sEl = subtitleRef.current;
    if (!isEl(tEl) || !isEl(sEl) || !inDoc(tEl) || !inDoc(sEl)) return;
    const splitTitle = new SplitType(tEl, { types: "chars" });
    const splitSub = new SplitType(sEl, { types: "chars" });
    splitRefs.current.title = splitTitle;
    splitRefs.current.subtitle = splitSub;
    gsap.set(splitTitle.chars, { y: 150 });
    gsap.set(splitSub.chars, { y: 150 });
    gsap
      .timeline()
      .to(splitTitle.chars, {
        y: 0,
        stagger: letterStagger,
        duration: 1.2,
        ease: "power3.out",
      })
      .to(
        splitSub.chars,
        { y: 0, stagger: letterStagger, duration: 1.2, ease: "power3.out" },
        "-=0.6"
      );
  };

  // 主圖初始
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

  // 主圖進退場
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
      setCopy(nextIdx);
      requestAnimationFrame(() => playTextAnimation());
      activeTLRef.current.in = animateIn(inEl);
      setCurrent(nextIdx);
    });
  };

  const handleNext = () => go("next");
  const handlePrev = () => go("prev");

  useLayoutEffect(() => {
    if (initedRef.current) return;
    setInitial();
    setCopy(0);
    requestAnimationFrame(() => playTextAnimation());
    initedRef.current = true;
    return () => {
      activeTLRef.current.in?.kill();
      activeTLRef.current.out?.kill();
      gsap.globalTimeline.clear();
      try {
        splitRefs.current.title?.revert?.();
        splitRefs.current.subtitle?.revert?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 取得當前 slide
  const idx =
    Number.isInteger(current) && current >= 0 && current < (slides?.length ?? 0)
      ? current
      : 0;
  const slide = slides?.[idx] ?? {
    title: "",
    subtitle: "",
    ctaText: "",
    ctaHref: "#",
  };
  const currentThumbs =
    slide.thumbs?.slice(0, thumbsMax) ??
    Array.from({ length: Math.min(3, thumbsMax) }, () => ({
      src: slide.src,
      label: "",
    }));

  // —————— 產生「不規則發散」座標（以主圖中心為原點，單位 px） ——————
  const toRad = (deg) => (deg * Math.PI) / 180;
  const rand = (seed) => {
    // 簡單可重現亂數（依 current + 索引），避免每次重算不同
    let x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };
  const computeScatter = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const t = i / Math.max(1, count - 1);
      // 在 angleStart~angleEnd 之間分佈，加入 spiralSkew 讓角度不均勻
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

      // 只保留右半（x 正向為主），若角度太偏左，拉回一點
      const adjX = x < 0 ? Math.abs(x) * 0.6 : x;

      out.push({ x: adjX, y });
    }
    return out;
  };
  const scatter = computeScatter(currentThumbs.length);

  // 縮圖 variants：從中心點「爆開」
  const itemVariants = {
    initial: () => ({
      opacity: 0,
      scale: 0.65,
      x: 0,
      y: 0,
    }),
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

  return (
    <section className="slider-wrap">
      {/* 左半：文案 */}
      <div className="left relative z-30">
        <div className="copy">
          <h2 ref={titleRef} className="title">
            {slide.title}
          </h2>
          <p ref={subtitleRef} className="subtitle !font-extralight">
            {slide.subtitle}
          </p>
          {(slide?.ctaText ?? "") && (
            <a className="btn" href={slide?.ctaHref || "#"}>
              {slide.ctaText}
            </a>
          )}
        </div>
      </div>

      {/* 右半：主圖 + 不規則發散縮圖（主圖層級在上） */}
      <div className="right !bg-[#f0f1ec] relative">
        <div className="txt absolute z-40 left-[50%] -translate-x-1/2  top-[3%]">
          <div className="flex flex-col justify-center items-center ">
            {" "}
            <span className="font-extrabold text-[20px]">BUY NOW</span>
            <div className="flex flex-col">『 歡迎詢問訂購 』</div>
            <div className="line h-[.5px] bg-black w-full"></div>
          </div>
        </div>
        <div className="img01 absolute z-40 right-[5%]  top-[10%]">
          {" "}
          <Image
            src="/images/ed20658c0f18d9c0addf9381d5a80e42.jpg"
            placeholder="empty"
            loading="lazy"
            width={140}
            height={50}
            className="w-[110px] rotate-[-30deg]"
          ></Image>
        </div>
        {/* <div className="img03 absolute z-10 right-[-35%]  top-[10%]">
          {" "}
          <Image
            src="/images/印章.png"
            placeholder="empty"
            loading="lazy"
            width={140}
            height={50}
            className="w-[910px] rotate-[-30deg] opacity-20"
          ></Image>
        </div> */}
        <div className="img01 absolute z-40 right-[25%]  bottom-[12%]">
          {" "}
          <Image
            src="/images/text01.png"
            placeholder="empty"
            loading="lazy"
            width={140}
            height={50}
            className="w-[170px] rotate-[-10deg]"
          ></Image>
        </div>
        <div className="txt absolute z-40 left-[5%]  top-[20%]">
          <div className="">
            <Image
              src="/images/logo-6.png"
              placeholder="empty"
              loading="lazy"
              width={140}
              height={50}
              className="w-[80px]"
            ></Image>
            <span className="tag border w-[80px]  text-center border-gray-500 px-3 py-1 text-[14px] rounded-[20px] font-bold">
              Beer
            </span>
            <br></br>
            <h3 className="border-b-1 text-2xl my-4 text-[#2f2f2f] inline-block border-[#313131]">
              Memory Dining Group
            </h3>
            <p className=" max-w-[20vw] text-[#2f2f2f]">
              讓【有香ㄟ灶腳】成為你家的冰箱後援<br></br>備餐神隊友
            </p>
            <div className=" max-w-[14vw] mt-5 leading-loose tracking-widest text-[14px]">
              嚴選冷凍美食、經典台灣零食飲料和台味小物，
              從熟悉的味道，到日常的補給，一次買齊！ 讓【有香ㄟ灶腳】
              成為你家的冰箱後援、備餐神隊友：
              再忙也能快速上桌，再累也吃得到美味。
              把廚房交給我們，把時間留給最重要的人。
            </div>
          </div>
        </div>
        <div className="card-slider">
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
                  {/* 縮圖群：放在卡片裡、以中心點為基準；z-index < 主圖 */}
                  {i === current && (
                    <AnimatePresence initial={false}>
                      {isSettled && (
                        <motion.div
                          key={`thumbs-${i}-${current}`}
                          className="thumbs-radial ml-[25%]"
                          // 放在中心點（transform-origin: center）
                          style={{
                            position: "absolute",
                            left: "40%",
                            top: "10%",
                            width: 0,
                            height: 0,
                            zIndex: 2, // 小圖層級
                            pointerEvents: "auto",
                          }}
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        >
                          {currentThumbs.map((t, ti) => (
                            <motion.button
                              key={ti}
                              className="thumb "
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
                              onClick={() => {
                                // 這裡自訂點擊行為（示範：下一張）
                                handleNext();
                              }}
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

                  {/* 主圖：層級最高，覆蓋在縮圖之上 */}
                  <img className="card-bg" src={s.src} alt={s.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .slider-wrap {
          width: 100vw;
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #ffffff;
          overflow: hidden;
        }
        .left {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: min(6vw, 80px);
          background: #0f0f10;
          color: #fff;
        }
        .copy {
          max-width: 640px;
          width: 100%;
        }
        .title {
          font-family: "Melodrama", serif;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.05;
          margin: 0 0 1rem;
          letter-spacing: 0.02em;
          overflow: hidden;
        }
        .subtitle {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          line-height: 1.6;
          color: #d6d6d6;

          margin: 0 0 1.75rem;
          overflow: hidden;
        }
        .btn {
          display: inline-block;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          border: 1px solid #ffffff30;
          background: linear-gradient(180deg, #ffffff1a, #ffffff0a);
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: transform 0.2s ease, background 0.3s ease, border 0.3s;
        }
        .btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #ffffff2a, #ffffff12);
          border-color: #ffffff55;
        }

        .right {
          position: relative;
          background: #f6f7f9;
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
          overflow: visible; /* 允許縮圖超出卡片 */
          pointer-events: none;
        }
        .item.is-active {
          pointer-events: auto;
        }
        .card {
          width: min(58vh, 48vw);
          height: min(58vh, 48vw);
          position: relative;
          overflow: visible; /* 允許縮圖發散 */
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
          z-index: 3; /* 主圖最上層 */
          pointer-events: none; /* 讓縮圖可點擊 */
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

        @media (max-width: 1024px) {
          .slider-wrap {
            grid-template-columns: 1fr;
          }
          .right {
            order: -1;
            min-height: 56vh;
          }
          .left {
            min-height: 44vh;
          }
          .nav .prev {
            right: 6rem;
          }
        }
      `}</style>
    </section>
  );
}
