import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-marquee-slider";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useReducedMotion,
} from "framer-motion";

// Components
import Layout from "../pages/Layout";
// 引用你的輪播元件 (請確認這個元件只負責顯示 UI，不包含資料邏輯)
import Carousel from "../components/EmblaCarouselTravel/index";

// Dynamic Imports
const MinimalPushOverlayMenu = dynamic(
  () => import("@/components/MinimalPushOverlayMenu"),
  { ssr: false }
);

/* =================================================================
   1. 翻譯資料庫 (已整合 Beer 系列)
   ================================================================= */
const TRANSLATIONS = {
  "zh-TW": {
    // --- 新增：啤酒系列翻譯 ---
    beer: {
      honey: {
        title: "鮮蜜釀系列",
        description: "珍稀淡雅龍眼花蜜與清爽啤酒完美融合，令人一口就上癮！",
      },
      girl: {
        title: "女孩微醺系列",
        description: "臉先紅，心先甜；微醺讓妳更嬌甜",
      },
      fruit: {
        title: "水果釀造系列",
        description: "果香直擊、滑順爽口；每一口都是果釀的純粹與爽快",
      },
      craft: {
        title: "職人釀造系列",
        description:
          "獲獎無數、越喝越順；從順口到醇厚，喝的就是職人的穩、準、醇",
      },
    },
    // --- 原有翻譯 ---
    variety: {
      title: "VARIETY",
      subtitle: "Traditional grocery shop",
      desc1: "販售各式台灣經典零食、懷舊童玩，以及方便好料理的台灣小吃冷凍包。",
      desc2: "帶你重溫最經典的台灣味。",
      desc3: "喜歡台味的朋友，能線上輕鬆訂購， 也歡迎到店逛逛！",
    },
    about: {
      title: "ABOUT US",
      group_desc:
        "始於1975年台灣高雄，在北美這片 土地上<br/>傳遞家的溫度與歸屬感",
      memory_desc: "傳承三代手路菜<br/>正港的台灣料理",
      sweet_desc:
        "手作甜點與飲品，蒐集生活裡那些 <br/>一點點卻很重要的甜美記憶。",
    },
    app: {
      title: "REWARDS APP",
      subtitle: "Earn Points with Every Purchase",
      marquee: "Join Now — Start Earning Points!",
    },
  },
  en: {
    // --- 新增：啤酒系列翻譯 (英文) ---
    beer: {
      honey: {
        title: "Honey Lager Series",
        description:
          "Rare, elegant longan honey perfectly blended with refreshing beer. Addictive from the first sip!",
      },
      girl: {
        title: "Micro-Drunk Series",
        description:
          "Cheeks blush, heart sweetens; a light buzz brings out your charm.",
      },
      fruit: {
        title: "Fruit Brewing Series",
        description:
          "Direct fruit aroma, smooth and refreshing; every sip is the pure joy of fruit brewing.",
      },
      craft: {
        title: "Artisan Brewing Series",
        description:
          "Award-winning smoothness. From easy-drinking to full-bodied, taste the stability, precision, and richness of the craftsman.",
      },
    },
    // --- 原有翻譯 ---
    variety: {
      title: "VARIETY",
      subtitle: "Traditional Grocery Shop",
      desc1:
        "We sell a variety of classic Taiwanese snacks, nostalgic toys, and convenient frozen Taiwanese street food packs.",
      desc2: "Relive the most classic Taiwanese flavors.",
      desc3:
        "Fans of Taiwanese taste can order online easily, or visit our store!",
    },
    about: {
      title: "ABOUT US",
      group_desc:
        "Started in Kaohsiung, Taiwan in 1975.<br/>Delivering the warmth of home and belonging in North America.",
      memory_desc:
        "Inheriting three generations of culinary skills.<br/>Authentic Taiwanese cuisine.",
      sweet_desc:
        "Handmade desserts and drinks.<br/>Collecting those small but important sweet memories in life.",
    },
    app: {
      title: "REWARDS APP",
      subtitle: "Earn Points with Every Purchase",
      marquee: "Join Now — Start Earning Points!",
    },
  },
};

/* =================================================================
   2. SSG 資料獲取
   ================================================================= */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: {
      t,
      locale,
    },
  };
}

/* =================================================================
   3. 動畫與輔助元件
   ================================================================= */

function FadeUp({
  children,
  className = "",
  delay = 0,
  distance = 60,
  amount = 0.3,
}) {
  const prefersReduced = useReducedMotion?.();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        ease: [0.16, 1, 0.3, 1],
        duration: 0.8,
        delay,
      }}
      viewport={{ once: true, amount, margin: "0px 0px -5% 0px" }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

function SnackDropLoop({
  anchorRef,
  className,
  imgSrc,
  imgClassName = "w-[400px]",
  width = 1000,
  height = 1000,
  spawn = 420,
  sway = 80,
  spin = 10,
  scaleStart = 1.0,
  scaleEnd = 0.7,
  duration = 2.2,
  loopDelay = 0.7,
  delay = 0.0,
  startRot = 0,
  z = 60,
  lockXToMouth = true,
  xOffset = 0,
}) {
  const itemRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const measure = () => {
    const el = itemRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const r = el.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const elCX = r.left + r.width / 2;
    const elCY = r.top + r.height / 2;
    const aCX = a.left + a.width / 2;
    const aCY = a.top + a.height / 2;
    setDelta({ x: aCX - elCX, y: aCY - elCY });
    setReady(true);
  };

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (anchorRef.current) ro.observe(anchorRef.current);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    const raf = requestAnimationFrame(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (imgLoaded) requestAnimationFrame(measure);
  }, [imgLoaded]);

  const canRun = ready && imgLoaded;
  const startY = canRun ? delta.y - Math.abs(spawn) : -Math.abs(spawn);
  const endY = canRun ? delta.y : 0;
  const mouthX = canRun ? delta.x + xOffset : 0;
  const startX = lockXToMouth ? mouthX : 0;

  const xKF = canRun
    ? [startX, mouthX + sway * 0.25, mouthX - sway * 0.15, mouthX, mouthX]
    : [startX];

  const yKF = canRun
    ? [
        startY,
        startY + Math.abs(spawn) * 0.66,
        startY + Math.abs(spawn) * 0.92,
        endY + 10,
        endY,
      ]
    : [startY];

  const rKF = canRun
    ? [
        startRot,
        startRot + spin * 0.5,
        startRot + spin * 0.85,
        startRot + spin,
        startRot + spin,
      ]
    : [startRot];

  const sKF = canRun
    ? [
        scaleStart,
        (scaleStart + scaleEnd) / 2,
        scaleEnd * 0.95,
        scaleEnd,
        scaleEnd,
      ]
    : [scaleStart];

  const oKF = canRun ? [0, 1, 1, 1, 0] : [1];

  const transition = canRun
    ? {
        duration,
        ease: "easeInOut",
        times: [0, 0.6, 0.85, 0.96, 1],
        repeat: Infinity,
        repeatDelay: loopDelay,
        delay,
      }
    : { duration: 0 };

  const loopKey = canRun
    ? `run-${Math.round(mouthX)}-${Math.round(endY)}`
    : "wait";

  return (
    <motion.div
      key={loopKey}
      ref={itemRef}
      className={`absolute pointer-events-none ${className}`}
      initial={{
        x: startX,
        y: startY,
        rotate: startRot,
        scale: scaleStart,
        opacity: 1,
      }}
      animate={{ x: xKF, y: yKF, rotate: rKF, scale: sKF, opacity: oKF }}
      transition={transition}
      style={{
        zIndex: z,
        willChange: "transform, opacity",
        transformOrigin: "50% 50%",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitTransformStyle: "preserve-3d",
      }}
    >
      <Image
        src={imgSrc}
        alt="snack"
        width={width}
        height={height}
        loading="lazy"
        onLoadingComplete={() => setImgLoaded(true)}
        className={imgClassName}
        draggable={false}
      />
    </motion.div>
  );
}

function AutoSwapImage({
  base,
  alt = "",
  className = "",
  positionClass = "",
  width = 800,
  height = 500,
  interval = 6000,
  initialDelay = 0,
  enterFrom = "none",
  offset = 40,
  rotateInfinite = false,
  rotateDuration = 16,
  priority = false,
}) {
  const prefersReduced = useReducedMotion?.();
  const [showB, setShowB] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;
    const first = setTimeout(
      () => setShowB((v) => !v),
      initialDelay || interval
    );
    const timer = setInterval(() => setShowB((v) => !v), interval);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [interval, initialDelay, prefersReduced]);

  const srcA = `${base}-a.png`;
  const srcB = `${base}-b.png`;

  const dxIn =
    enterFrom === "left" ? -offset : enterFrom === "right" ? offset : 0;
  const dxOut =
    enterFrom === "left" ? offset : enterFrom === "right" ? -offset : 0;

  const content = (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={showB ? "B" : "A"}
        initial={{
          opacity: 0,
          x: dxIn,
        }}
        animate={{ opacity: 1, x: 0 }}
        exit={{
          opacity: 0,
          x: dxOut,
        }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          src={showB ? srcB : srcA}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          placeholder="empty"
          className={className}
          sizes="(max-width: 1024px) 80vw, 50vw"
        />
      </motion.div>
    </AnimatePresence>
  );

  if (rotateInfinite) {
    return (
      <motion.div
        className={`absolute ${positionClass}`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: rotateDuration,
        }}
        style={{ willChange: "transform", transformOrigin: "50% 50%" }}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={`absolute ${positionClass}`}>{content}</div>;
}

/* =================================================================
   4. 主頁面元件
   ================================================================= */
export default function Home({ t, locale }) {
  const rightRef = useRef(null);

  // --- 輪播設定 ---
  const OPTIONS = { dragFree: true, loop: true };

  // --- 定義輪播資料 (讀取 t.beer) ---
  const SLIDES = t
    ? [
        {
          image: "/images/beer/台啤-蜂蜜.webp",
          title: t.beer.honey.title,
          description: t.beer.honey.description,
        },
        {
          image: "/images/beer/微果醺.webp",
          title: t.beer.girl.title,
          description: t.beer.girl.description,
        },
        {
          image: "/images/beer/245A4057-已增強-雜訊減少 (1).webp",
          title: t.beer.fruit.title,
          description: t.beer.fruit.description,
        },
        {
          image: "/images/beer/245A3705-已增強-雜訊減少.webp",
          title: t.beer.craft.title,
          description: t.beer.craft.description,
        },
        // 重複的 Slide (維持無縫輪播效果)
        {
          image: "/images/beer/台啤-蜂蜜.webp",
          title: t.beer.honey.title,
          description: t.beer.honey.description,
        },
        {
          image: "/images/beer/微果醺.webp",
          title: t.beer.girl.title,
          description: t.beer.girl.description,
        },
        {
          image: "/images/beer/245A4057-已增強-雜訊減少 (1).webp",
          title: t.beer.fruit.title,
          description: t.beer.fruit.description,
        },
        {
          image: "/images/beer/245A3705-已增強-雜訊減少.webp",
          title: t.beer.craft.title,
          description: t.beer.craft.description,
        },
      ]
    : [];

  // 中央 hotpot 旋轉邏輯
  const baseAngle = useMotionValue(0);
  useEffect(() => {
    const stepPerWheel = 0.25;
    const onWheel = (e) =>
      baseAngle.set(baseAngle.get() + e.deltaY * stepPerWheel);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [baseAngle]);

  // Dinging 區塊
  const dingingRef = useRef(null);
  const anchorRef = useRef(null);
  useScroll({ target: dingingRef, offset: ["start 80%", "end 25%"] });

  // 如果 t 不存在，回傳 null 避免錯誤
  if (!t) return null;

  return (
    <>
      <Layout>
        {/* Section Hero */}
        <section className="section-hero z-[9] pt-[0px] relative md:mt-0 aspect-[16/16] md:aspect-[16/12] xl:aspect-[16/7.6] overflow-hidden">
          <div className="relative h-full w-full">
            {/* 中央主標 */}
            <AutoSwapImage
              base="/images/index/banner-06"
              alt="background"
              positionClass="z-10 right-[-3%] top-[10%] md:top-[-10%]"
              className="w-[80vw]"
              width={1200}
              height={800}
              interval={7000}
              enterFrom="none"
              priority={true}
            />

            {/* 角色 */}
            <AutoSwapImage
              base="/images/index/banner-05"
              alt="charactor"
              positionClass="z-20 right-[0%] bottom-[-2%]"
              className="w-[70vw] sm:w-[55vw] lg:w-[50vw] xl:w-[52vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={1200}
              enterFrom="right"
              offset={36}
            />

            {/* 筷子 */}
            <AutoSwapImage
              base="/images/index/banner-02"
              alt="chopsticks"
              positionClass="z-50 left-[-10%] top-[15%] rotate-[25deg] md:rotate-0 md:top-[24%]"
              className="w-[45vw] md:w-[30vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={2400}
              enterFrom="left"
              offset={28}
            />

            {/* 轉動標誌 */}
            <AutoSwapImage
              base="/images/index/banner-07"
              alt="mark"
              positionClass="z-30 left-[10%] md:left-[20%] bottom-[43%] md:bottom-[20%] xl:bottom-[17%]"
              className="w-[10vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={3600}
              enterFrom="left"
              offset={24}
              rotateInfinite
              rotateDuration={16}
            />

            {/* 火鍋 */}
            <AutoSwapImage
              base="/images/index/banner-01"
              alt="hotpot"
              positionClass="z-10 left-[4%] md:left-[2%] top-[44%] sm:top-[25%] md:top-[50%] 2xl:top-[55%] -translate-y-1/2"
              className="w-[75vw] md:w-[60vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={4800}
              enterFrom="left"
              offset={32}
              priority={true}
            />
          </div>
        </section>

        {/* ======= 啤酒輪播區塊 (Beer Carousel) ======= */}
        <section className="section_beer overflow-hidden">
          <Carousel slides={SLIDES} options={OPTIONS} />
        </section>

        {/* ======= 零食區塊 (Variety) ======= */}
        <section
          ref={dingingRef}
          className="section_Dinging mx-auto bg-[#efefef] max-w-[1920px] relative overflow-x-hidden"
        >
          <div className="mx-auto py-3 sm:py-20 max-w-[1920px] px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-center">
              {/* 左側：影片區 */}
              <div className="left w-full lg:w-1/2 overflow-hidden aspect-[3/4] sm:aspect-[4/4] relative">
                <video
                  className="w-full h-full scale-[1.5] object-cover"
                  src="/video/灶腳.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              {/* 右側：文案區 (使用 t.variety) */}
              <div className="right p-7 md:p-20 w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                <FadeUp amount={0.35} className="w-full max-w-[680px]">
                  <div className="flex flex-col">
                    <FadeUp>
                      <h2 className="title-large font-bold m-0 p-0 leading-none">
                        {t.variety.title}
                      </h2>
                    </FadeUp>

                    <div className="">
                      <FadeUp delay={0.06}>
                        <p className="sub_title m-0 p-0">
                          {t.variety.subtitle}
                        </p>
                      </FadeUp>
                    </div>

                    <div className="mt-3 sm:mt-4">
                      <FadeUp delay={0.08}>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc1}
                        </p>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc2}
                        </p>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc3}
                        </p>
                      </FadeUp>
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="section_brand_story relative">
          <div className="pointer-events-none absolute top-[7%] sm:top-[15%] left-[10%] md:translate-x-0 z-20">
            <FadeUp>
              <h2 className="font-extrabold tracking-[0.18em] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] text-[clamp(2.4rem,7vw,8.5rem)] leading-none">
                {t.about.title}
              </h2>
            </FadeUp>
          </div>

          <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* 區塊 1 */}
            <FadeUp delay={0.02} amount={0.25} className="relative">
              <div className="group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]">
                <Image
                  src="/images/index/about/DAV01968.webp"
                  alt="有香集團"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <Image
                      src="/images/index/about/有香集團-logo.png"
                      alt="有香集團 logo"
                      width={260}
                      height={120}
                      className="w-[180px] md:w-[200px] lg:w-[240px] xl:w-[300px] h-auto"
                    />
                  </div>
                  <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                    <p
                      className="text-white text-[16px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: t.about.group_desc }}
                    />
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* 區塊 2 */}
            <FadeUp delay={0.06} amount={0.25} className="relative">
              <div className="group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]">
                <Image
                  src="/images/index/about/DAV01683.webp"
                  alt="有香 Memory Corner"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <Image
                      src="/images/index/about/有香-logo.png"
                      alt="有香 logo"
                      width={260}
                      height={120}
                      className="w-[180px] md:w-[200px] lg:w-[240px] xl:w-[300px] h-auto"
                    />
                  </div>
                  <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                    <p
                      className="text-white text-[16px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: t.about.memory_desc }}
                    />
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* 區塊 3 */}
            <FadeUp delay={0.1} amount={0.25} className="relative">
              <div className="group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]">
                <Image
                  src="/images/index/about/DAV01773 (1).webp"
                  alt="億點點 Sweet Memory"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <Image
                      src="/images/index/about/億點點-logo.png"
                      alt="億點點 logo"
                      width={260}
                      height={120}
                      className="w-[180px] md:w-[200px] lg:w-[240px] xl:w-[300px] h-auto"
                    />
                  </div>
                  <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                    <p
                      className="text-white text-[16px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: t.about.sweet_desc }}
                    />
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* Video Section */}
        <section className="h-full w-full section-video relative">
          <video
            className="w-full h-full object-cover"
            src="/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/index/video/b4c86b1e81f93dc869c7923db929e811.jpg"
            aria-label="Memory Corner promotion video"
          >
            <source
              src="/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4"
              type="video/mp4"
            />
          </video>
        </section>

        <section></section>

        {/* APP Operation Section */}
        <section className="section_app_operation bg-[#f7f7f7] relative overflow-hidden">
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center md:px-10 px-5 xl:px-20 md:items-stretch gap-10 md:gap-16">
            <div className="w-full md:w-[50%] flex sm:p-10 p-8 md:p-20 items-center">
              <FadeUp amount={0.35} className="w-full">
                <div className="flex flex-col justify-center items-center">
                  <FadeUp>
                    <h2 className="title-large font-bold text-[#3b2619] leading-none text-wrap">
                      {t.app.title}
                    </h2>
                  </FadeUp>

                  <div className="mt-4">
                    <FadeUp delay={0.06}>
                      <p className="text-[#3b2619] font-normal sub_title leading-relaxed">
                        {t.app.subtitle}
                      </p>
                    </FadeUp>
                    <FadeUp delay={0.04}>
                      <Link href="/app" className="group">
                        <Image
                          src="/images/more-btn.png"
                          width={400}
                          alt="more-btn"
                          height={400}
                          loading="lazy"
                          className="w-[200px] mx-auto sm:mx-0 group-hover:scale-105 scale-100 duration-300 h-auto"
                        />
                      </Link>
                    </FadeUp>
                  </div>
                </div>
              </FadeUp>
            </div>

            <div className="w-full overflow-hidden md:w-[50%] flex relative justify-center md:justify-end">
              <FadeUp delay={0.1} amount={0.3} className="w-full">
                <Link
                  href="/app"
                  className="relative flex justify-center scale-100 xl:scale-125 absolute left-0 lg:left-[10%] bottom-[0%] lg:bottom-[-25%]"
                >
                  <Image
                    src="/images/app/app.png"
                    alt="Rewards App Mockup"
                    width={1700}
                    height={1700}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </Link>
              </FadeUp>
            </div>
            <div className="absolute bottom-6 w-full overflow-hidden">
              <Marquee velocity={11}>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span
                      key={i}
                      className="mx-10 text-8xl font-bold text-[#ebe9ea]"
                    >
                      {t.app.marquee}
                    </span>
                  ))}
              </Marquee>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
