"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
const makeHref = (cta = {}) => {
  if (cta.tel) return `tel:${String(cta.tel).replace(/[\s-]/g, "")}`;
  return cta.href || "#";
};
export default function ProductSlider({
  slides = [
    {
      title: "有香 Memory Corner ",
      subtitle: "Crisp & clean flavor profile",
      src: "/images/hotpot-shadow.png",
      ctas: [
        {
          text: "外帶自取",
          tel: "04-1234-5678", // 會自動轉成 tel:0412345678
          iconSrc: "/images/外帶自取01.png",
          className: "mr-3",
        },
        {
          text: "線上訂位",
          href: "https://lin.ee/xxxx", // 一般連結
          iconSrc: "/images/線上訂位.png",
          target: "_blank", // 可選
          rel: "noopener noreferrer", // 可選
        },
      ],
      ctaHref: "#",
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
          logoSrc: "/images/logo-6.png",
          logoAlt: "Logo",
          logoW: 140,
          logoH: 50,
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
      ctaText: "外帶自取",
      ctaText02: "線上訂位",
      ctaHref: "#",
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
          logoSrc: "/images/logo-6.png",
          logoAlt: "Logo",
          logoW: 140,
          logoH: 50,
          tagText: "Beer",
          heading: "Memory Dining Group",
          lead: "讓【有香ㄟ灶腳】成為你家的冰箱後援\n備餐神隊友",
          description:
            "嚴選冷凍美食、經典台灣零食飲料和台味小物，從熟悉的味道，到日常的補給，一次買齊！讓【有香ㄟ灶腳】成為你家的冰箱後援、備餐神隊友：再忙也能快速上桌，再累也吃得到美味。把廚房交給我們，把時間留給最重要的人。",
        },
      },
    },
    {
      title: "有香ㄟ灶腳 Old Memory Kitchen",
      subtitle: "Rich notes of spice & herbs",
      src: "/images/img-3.png",
      ctaText: "外帶自取",
      ctaText02: "線上訂位",
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

  // 不規則發散縮圖自訂
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

  // ✅ 營業時間（加拿大時區）
  businessTimeZone = "America/Toronto", // 需要用溫哥華可改 "America/Vancouver"
  businessOpen = "11:30", // 開始時間（24h）
  businessClose = "23:30", // 結束時間（24h）
}) {
  const itemsRef = useRef([]);
  const [current, setCurrent] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const initedRef = useRef(false);
  const directionForwardRef = useRef(true);
  const activeTLRef = useRef({ in: null, out: null });

  // ⏰ 營業時間狀態
  const [isOpenNow, setIsOpenNow] = useState(true);

  // 左側文字
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const splitRefs = useRef({ title: null, subtitle: null });

  // ===== 工具：時間與角度 =====
  const isEl = (el) =>
    typeof window !== "undefined" &&
    el &&
    el.nodeType === 1 &&
    el instanceof window.HTMLElement;
  const inDoc = (el) =>
    typeof document !== "undefined" && el && document.contains(el);

  const toRad = (deg) => (deg * Math.PI) / 180;
  const rand = (seed) => {
    let x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };

  // ===== 工具：加拿大時區時間判斷 =====
  const parseHM = (s) => {
    const [h, m] = (s || "0:0").split(":").map((n) => parseInt(n, 10));
    return h * 60 + (m || 0);
  };
  const getMinutesInTZ = (tz) => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(now);
    const hh = Number(parts.find((p) => p.type === "hour")?.value || 0);
    const mm = Number(parts.find((p) => p.type === "minute")?.value || 0);
    return hh * 60 + mm;
  };
  const isWithin = (mins, open, close) => {
    // 支援跨越午夜，如 22:00~02:00
    if (open <= close) return mins >= open && mins < close;
    return mins >= open || mins < close;
  };

  // ✅ 每 30s 檢查一次（也會在掛載時立即判斷一次）
  useEffect(() => {
    const openM = parseHM(businessOpen);
    const closeM = parseHM(businessClose);
    const tick = () => {
      const mins = getMinutesInTZ(businessTimeZone);
      setIsOpenNow(isWithin(mins, openM, closeM));
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [businessTimeZone, businessOpen, businessClose]);

  // ===== 左側文字 SplitType 動畫 =====
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
      setCopy(nextIdx);
      requestAnimationFrame(() => playTextAnimation());
      activeTLRef.current.in = animateIn(inEl);
      setCurrent(nextIdx);
    });
  };

  const handleNext = () => go("next");
  const handlePrev = () => go("prev");

  // ===== 初始 =====
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

  // 當前資料
  const idx =
    Number.isInteger(current) && current >= 0 && current < (slides?.length ?? 0)
      ? current
      : 0;
  const slide = slides?.[idx] ?? {
    title: "",
    subtitle: "",
    ctaText: "",
    ctaText02: "",
    ctaHref: "#",
  };
  const currentThumbs =
    slide.thumbs?.slice(0, thumbsMax) ??
    Array.from({ length: Math.min(3, thumbsMax) }, () => ({
      src: slide.src,
      label: "",
    }));

  // ===== 不規則發散縮圖座標 =====
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

      const adjX = x < 0 ? Math.abs(x) * 0.6 : x;
      out.push({ x: adjX, y });
    }
    return out;
  };
  const scatter = computeScatter(currentThumbs.length);

  // 縮圖變體
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

  // ===== CTA 是否可點 =====
  const disableCTA = !isOpenNow;

  return (
    <section
      className="
    grid w-full  bg-white
    
    grid-cols-1 lg:grid-cols-2           /* 行動 1 欄、桌機 2 欄 */
    isolate                              /* 確保 z-index 堆疊不受外層影響 */
  "
    >
      {/* 左半：文案 */}
      <div className="left relative z-30 h-auto lg:h-screen">
        <div className="copy">
          <Link
            href=""
            target="_blank"
            className="flex justify-start items-center"
          >
            <div className="location-icon w-[70px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="60"
                height="60"
                viewBox="0 0 100 100"
              >
                <path
                  fill="#1d1d1b"
                  d="M76.4,14.51c-6.57-6.18-15.12-9.58-24.09-9.58c-0.76,0-1.52,0.03-2.28,0.07 C32.15,6.1,17.65,21.01,17.02,38.94c-0.22,6.24-0.03,12.15,4.45,21.29c0.06,0.14,0.14,0.28,0.23,0.43 c3.4,5.74,6.64,10.02,9.24,13.45c1.3,1.72,2.4,3.17,3.32,4.52c0.36,0.54,0.82,1.19,1.35,1.95c2.37,3.38,7.29,10.4,8.37,14.27 c0.94,3.36,4.12,5.71,7.72,5.71c3.47,0,6.38-1.97,7.42-5.03c1.58-4.64,6.01-10.56,8.94-14.49c0.83-1.1,1.61-2.14,2.19-2.98 c0.92-1.34,2-2.7,3.25-4.29c2.33-2.95,5.2-6.6,8.68-12.07l0.06-0.1l0.06-0.1c4.57-7.97,5.2-14.95,5.2-21.31 C87.5,30.5,83.45,21.14,76.4,14.51z M77.96,59.02c-3.35,5.27-6.14,8.81-8.39,11.65c-1.31,1.66-2.44,3.09-3.44,4.55 c-0.51,0.75-1.23,1.71-2.06,2.82c-2.94,3.93-7.29,9.75-9.33,14.91c-0.13,0.32-0.25,0.65-0.36,0.97c-0.34,1.01-1.37,1.64-2.68,1.64 c-1.37,0-2.56-0.84-2.9-2.05c-1.31-4.7-6.38-11.92-9.1-15.8c-0.51-0.73-0.96-1.37-1.31-1.89c-0.99-1.47-2.14-2.98-3.46-4.73 c-2.53-3.33-5.67-7.49-8.92-12.95c-0.02-0.04-0.03-0.07-0.05-0.11c-3.98-8.11-4.14-13.16-3.94-18.92 C22.55,23.72,35,10.94,50.35,9.99c0.65-0.04,1.31-0.06,1.96-0.06c7.73,0,15,2.89,20.66,8.22c6.06,5.69,9.53,13.73,9.53,22.04 C82.5,45.47,82.15,51.71,77.96,59.02z"
                  opacity=".35"
                ></path>
                <path
                  fill="#de5147"
                  d="M40.75,31.23l-2.67,3.15l-0.84,0.98L23.59,51.44c-0.04-0.09-0.07-0.18-0.1-0.26 c-2.05-5.47-2.13-9.51-1.97-14.02c0.23-6.34,2.55-12.21,6.31-16.9l12.56,10.66L40.75,31.23z"
                ></path>
                <path
                  fill="#2785bd"
                  d="M58.16,10.54L40.73,31.07L40,31L27,20c4.93-6.09,13.18-10,21.44-10.51c3.25-0.2,6.39,0.14,9.34,0.95 C57.91,10.46,58.03,10.5,58.16,10.54z"
                ></path>
                <path
                  fill="#96c362"
                  d="M79,37.19c0,5.57-0.48,11.35-4.34,18.08c-5.16,8.11-8.94,12-11.77,16.1 c-2.37,3.45-9.5,11.96-11.93,19.07c-0.16,0.47-0.76,0.62-1.26,0.62c-0.64,0-1.28-0.34-1.46-0.96c-1.61-5.8-8.27-14.68-10.61-18.12 c-0.03-0.04-0.06-0.09-0.09-0.13c-0.07-0.11-0.14-0.21-0.22-0.32l18.3-21.55l0.84-0.99l20.02-23.58c0.52,2.59,0.05,0.1,0.06,0.15 C78.13,29.11,79,33.05,79,37.19z"
                ></path>
                <path
                  fill="#f9b84f"
                  d="M37,72c-0.07-0.11-12.95-19.33-13.41-20.56c-0.04-0.09-0.07-0.18-0.1-0.26L41,30 c0,0-1.14,7.99-1.14,8.19c0,5.73,4.65,10.39,10.39,10.39c0.78,0,1.53-0.09,2.26-0.25c0.51-0.11,1.01-0.26,1.48-0.45L60,45L37,72z"
                ></path>
                <path
                  fill="#70bfff"
                  d="M77,26L59,47l-6.49,1.33c0.51-0.11,1.01-0.26,1.48-0.45c3.89-1.5,6.65-5.28,6.65-9.69 c0-5.74-4.65-10.39-10.39-10.39c-5.02,0-9.2,3.55-10.17,8.28c-0.11,0.49-0.17,1-0.21,1.52l0.59-6.76l17.32-20.4 c0.13,0.02,0.25,0.06,0.38,0.1C66.35,12.87,71.56,15.34,75,23C75.03,23.05,76.99,25.95,77,26z"
                ></path>
                <path
                  fill="none"
                  d="M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33 c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M75.07,26.85c0-0.01,0-0.01,0-0.01 M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5 c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66 c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38 C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04c-0.04,0.14-0.06,0.33-0.08,0.58 l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02 c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z M50.25,33.5c-2.21,0-4.14,1.57-4.59,3.72v0.05l-0.01,0.04 c-0.04,0.14-0.06,0.33-0.08,0.58l-0.01,0.33c0.02,2.53,2.15,4.66,4.67,4.66c0.35,0,0.7-0.04,1.08-0.12 c0.25-0.06,0.43-0.12,0.53-0.16l0.04-0.01l0.04-0.02c1.81-0.7,3.02-2.46,3.02-4.38C54.94,35.6,52.84,33.5,50.25,33.5z"
                ></path>
                <path
                  fill="#f2f2f2"
                  d="M62,38.19c0,4.819-3.025,9.228-7.519,10.961c-0.503,0.201-1.083,0.379-1.694,0.511 c-0.859,0.186-1.686,0.278-2.537,0.278c-6.482,0-11.75-5.268-11.75-11.75l0.008-0.526c0-0.046,0-0.124,0.008-0.201 c0.054-0.665,0.131-1.207,0.24-1.709c1.106-5.384,5.941-9.313,11.495-9.313C56.732,26.44,62,31.708,62,38.19z"
                ></path>
                <path
                  fill="#40396e"
                  d="M50.249,27.798c5.738,0,10.389,4.651,10.389,10.389s-4.651,10.389-10.389,10.389 c-5.738,0-10.389-4.651-10.389-10.389S44.512,27.798,50.249,27.798 M50.249,24.798c-7.383,0-13.389,6.006-13.389,13.389 s6.006,13.389,13.389,13.389c7.383,0,13.389-6.006,13.389-13.389S57.632,24.798,50.249,24.798L50.249,24.798z"
                ></path>
                <path
                  fill="#40396e"
                  d="M70.97,16.15c-5.66-5.33-12.93-8.22-20.66-8.22c-0.65,0-1.31,0.02-1.96,0.06 C33,8.94,20.55,21.72,20.02,37.11c-0.2,5.76-0.04,10.81,3.94,18.92c0.02,0.04,0.03,0.07,0.05,0.11c3.25,5.46,6.39,9.62,8.92,12.95 c1.32,1.75,2.47,3.26,3.46,4.73c0.35,0.52,0.8,1.16,1.31,1.89c2.72,3.88,7.79,11.1,9.1,15.8c0.34,1.21,1.53,2.05,2.9,2.05 c1.31,0,2.34-0.63,2.68-1.64c0.11-0.32,0.23-0.65,0.36-0.97c2.04-5.16,6.39-10.98,9.33-14.91c0.83-1.11,1.55-2.07,2.06-2.82 c1-1.46,2.13-2.89,3.44-4.55c2.25-2.84,5.04-6.38,8.39-11.65c4.19-7.31,4.54-13.55,4.54-18.83C80.5,29.88,77.03,21.84,70.97,16.15z M73.39,55.47c-3.23,5.08-5.85,8.41-8.17,11.35c-1.34,1.69-2.5,3.16-3.56,4.7c-0.49,0.71-1.18,1.64-2,2.73 c-3.16,4.23-7.9,10.57-9.98,16.31h-0.03c-1.5-5.18-6.49-12.3-9.49-16.58c-0.5-0.71-0.94-1.34-1.28-1.85 c-1.05-1.53-2.27-3.14-3.56-4.85c-2.6-3.43-5.55-7.33-8.7-12.62c-3.64-7.46-3.79-12.12-3.6-17.44 c0.48-13.86,11.69-25.38,25.51-26.23c0.58-0.04,1.16-0.05,1.73-0.05c6.97,0,13.55,2.59,18.66,7.39c5.53,5.21,8.58,12.26,8.58,19.86 C77.5,43.08,77.18,48.86,73.39,55.47z"
                ></path>
                <path
                  fill="#f2f2f2"
                  d="M74.4,12.51c-6.57-6.18-15.12-9.58-24.09-9.58c-0.76,0-1.52,0.03-2.28,0.07 C30.15,4.1,15.65,19.01,15.02,36.94c-0.22,6.24-0.03,12.15,4.45,21.29c0.06,0.14,0.14,0.28,0.23,0.43 c3.4,5.74,6.64,10.02,9.24,13.45c1.3,1.72,2.4,3.17,3.32,4.52c0.36,0.54,0.82,1.19,1.35,1.95c2.37,3.38,7.29,10.4,8.37,14.27 c0.94,3.36,4.12,5.71,7.72,5.71c3.47,0,6.38-1.97,7.42-5.03c1.58-4.64,6.01-10.56,8.94-14.49c0.83-1.1,1.61-2.14,2.19-2.98 c0.92-1.34,2-2.7,3.25-4.29c2.33-2.95,5.2-6.6,8.68-12.07l0.06-0.1l0.06-0.1c4.57-7.97,5.2-14.95,5.2-21.31 C85.5,28.5,81.45,19.14,74.4,12.51z M75.96,57.02c-3.35,5.27-6.14,8.81-8.39,11.65c-1.31,1.66-2.44,3.09-3.44,4.55 c-0.51,0.75-1.23,1.71-2.06,2.82c-2.94,3.93-7.29,9.75-9.33,14.91c-0.13,0.32-0.25,0.65-0.36,0.97c-0.34,1.01-1.37,1.64-2.68,1.64 c-1.37,0-2.56-0.84-2.9-2.05c-1.31-4.7-6.38-11.92-9.1-15.8c-0.51-0.73-0.96-1.37-1.31-1.89c-0.99-1.47-2.14-2.98-3.46-4.73 c-2.53-3.33-5.67-7.49-8.92-12.95c-0.02-0.04-0.03-0.07-0.05-0.11c-3.98-8.11-4.14-13.16-3.94-18.92 C20.55,21.72,33,8.94,48.35,7.99c0.65-0.04,1.31-0.06,1.96-0.06c7.73,0,15,2.89,20.66,8.22c6.06,5.69,9.53,13.73,9.53,22.04 C80.5,43.47,80.15,49.71,75.96,57.02z"
                ></path>
              </svg>
            </div>
            <h2 ref={titleRef} className="title pt-5">
              {slide.title}
            </h2>
          </Link>

          <div className="info bg-slate-50 rounded-2xl p-10 ">
            <p
              ref={subtitleRef}
              className="subtitle !text-gray-800 !font-extralight"
            >
              {slide.subtitle}
            </p>
            <div className="text-gray-800 flex flex-col">
              <span>地址(Adress):</span>
              <span>dsfdsfsdfsdf</span>
            </div>
            <div className="text-gray-800  mt-4 flex flex-col">
              <span> 營業時間(Business Hours):</span>
              <span></span>
            </div>
          </div>

          {/* CTA 區 */}
          <div className="mt-3 flex flex-wrap gap-3">
            <AnimatePresence initial={false} mode="wait">
              {Array.isArray(slide?.ctas) && slide.ctas.length > 0 ? (
                slide.ctas.map((cta, i) => {
                  // 預設：打烊時禁用；若某顆要照常可用，給 cta.disableWhenClosed = false
                  const href = makeHref(cta);
                  const isExternal = String(href).startsWith("http");
                  const isDisabled =
                    (cta.disableWhenClosed ?? true) && !isOpenNow;

                  return (
                    <motion.a
                      key={`${current}-cta-${i}`}
                      href={isDisabled ? undefined : href}
                      className={`btn inline-flex items-center gap-2 ${
                        cta.className || ""
                      } ${isDisabled ? "disabled" : ""}`}
                      aria-label={cta.ariaLabel || cta.text || "cta"}
                      aria-disabled={isDisabled}
                      tabIndex={isDisabled ? -1 : 0}
                      onClick={(e) => {
                        if (isDisabled) e.preventDefault();
                      }}
                      target={
                        isDisabled
                          ? undefined
                          : cta.target || (isExternal ? "_blank" : undefined)
                      }
                      rel={
                        isDisabled
                          ? undefined
                          : cta.rel ||
                            (isExternal ? "noopener noreferrer" : undefined)
                      }
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      title={
                        isDisabled
                          ? `目前為非營業時間（${businessOpen}–${businessClose}，加拿大時間）`
                          : undefined
                      }
                      draggable={false}
                    >
                      {cta.iconSrc && (
                        <Image
                          src={cta.iconSrc}
                          alt=""
                          placeholder="empty"
                          loading="lazy"
                          width={500}
                          height={500}
                          className="max-w-[200px]"
                        />
                      )}
                      {cta.text}
                    </motion.a>
                  );
                })
              ) : (
                // ✅ 相容舊欄位（沒設定 ctas 時照舊顯示）
                <>
                  {(slide?.ctaText ?? "") && (
                    <motion.a
                      key={`${current}-legacy-1`}
                      href={!isOpenNow ? undefined : slide?.ctaHref || "#"}
                      className={`btn inline-flex items-center gap-2 mr-3 ${
                        !isOpenNow ? "disabled" : ""
                      }`}
                      aria-disabled={!isOpenNow}
                      tabIndex={!isOpenNow ? -1 : 0}
                      onClick={(e) => {
                        if (!isOpenNow) e.preventDefault();
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      title={
                        !isOpenNow
                          ? `目前為非營業時間（${businessOpen}–${businessClose}，加拿大時間）`
                          : undefined
                      }
                      draggable={false}
                    >
                      <Image
                        src="/images/外帶自取01.png"
                        alt=""
                        placeholder="empty"
                        loading="lazy"
                        width={500}
                        height={500}
                        className="max-w-[200px]"
                      />
                      {slide.ctaText}
                    </motion.a>
                  )}
                  {(slide?.ctaText02 ?? "") && (
                    <motion.a
                      key={`${current}-legacy-2`}
                      href={!isOpenNow ? undefined : slide?.ctaHref || "#"}
                      className={`btn inline-flex items-center gap-2 ${
                        !isOpenNow ? "disabled" : ""
                      }`}
                      aria-disabled={!isOpenNow}
                      tabIndex={!isOpenNow ? -1 : 0}
                      onClick={(e) => {
                        if (!isOpenNow) e.preventDefault();
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                      title={
                        !isOpenNow
                          ? `目前為非營業時間（${businessOpen}–${businessClose}，加拿大時間）`
                          : undefined
                      }
                      draggable={false}
                    >
                      <Image
                        src="/images/線上訂位.png"
                        alt=""
                        placeholder="empty"
                        loading="lazy"
                        width={500}
                        height={500}
                        className="max-w-[200px]"
                      />
                      {slide.ctaText02}
                    </motion.a>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 非營業提示 */}
          {!isOpenNow && (
            <div className="closed-msg">
              目前為非營業時間（營業時段 {businessOpen}–{businessClose}
              ，加拿大時間）
            </div>
          )}
        </div>
      </div>

      {/* 右半：主圖 + 不規則發散縮圖 */}
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
            {/* Top Banner —— 修正置中 */}
            {slide?.decor?.topBanner && (
              <motion.div
                className={`pointer-events-auto relative  lg:absolute lg:left-[43%] top-0 left-0 lg:top-[7%] lg:-translate-x-1/2 ${
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

            {/* ✅ 補回：左側 infoCard */}
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
                  {/* {slide.decor.infoCard.logoSrc && (
                    <Image
                      src={slide.decor.infoCard.logoSrc}
                      alt={slide.decor.infoCard.logoAlt || "logo"}
                      placeholder="empty"
                      loading="lazy"
                      width={slide.decor.infoCard.logoW || 140}
                      height={slide.decor.infoCard.logoH || 50}
                      className="w-[80px]"
                    />
                  )} */}

                  {slide.decor.infoCard.tagText && (
                    <span className="tag border w-[80px] text-center border-gray-500 px-3 py-1 text-[14px] rounded-[20px] font-bold inline-block mt-2">
                      {slide.decor.infoCard.tagText}
                    </span>
                  )}
                  <br></br>
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
                  {/* 縮圖群：主圖定位後爆開 */}
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
                              onClick={() => handleNext()}
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
      </div>

      {/* Styles */}
      <style jsx>{`
        * {
          box-sizing: border-box;
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
        .cta-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.6rem 0.9rem;
          border-radius: 12px;
          border: 1px solid #ffffff30;
          background: linear-gradient(180deg, #ffffff1a, #ffffff0a);
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: transform 0.2s ease, background 0.3s ease, border 0.3s,
            opacity 0.2s ease, filter 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #ffffff2a, #ffffff12);
          border-color: #ffffff55;
        }
        .btn.disabled {
          opacity: 0.45;
          filter: grayscale(100%) brightness(1.1);
          cursor: not-allowed;
          pointer-events: none;
        }
        .btn.disabled :global(img) {
          filter: grayscale(100%) brightness(1.1);
        }
        .closed-msg {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          color: #fca5a5;
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

        @media (max-width: 1024px) {
          .slider-wrap {
            grid-template-columns: 1fr;
          }
          .right {
            order: -1;
            min-height: 80vh;
          }
          .left {
            min-height: 84vh;
          }
          .nav .prev {
            right: 6rem;
          }
        }
      `}</style>
    </section>
  );
}
