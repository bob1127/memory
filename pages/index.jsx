// app/page.jsx
"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import { ReactLenis } from "@studio-freight/react-lenis";
import ParallaxForks from "@/components/ParallaxForks";
import Marquee from "react-marquee-slider";
import Link from "next/link";
import BeerCans from "@/components/BeerCans";
import dynamic from "next/dynamic";
import BottomVideoGallery from "../components/BottomVideoCarousel";
import Carousel from "../components/EmblaCarouselTravel/index";
const MinimalPushOverlayMenu = dynamic(
  () => import("@/components/MinimalPushOverlayMenu"),
  { ssr: false }
);
import Layout from "../pages/Layout";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useReducedMotion,
} from "framer-motion";

/* ========== 共用：滾動進場（大距離、超柔順） ========== */
function FadeUp({
  children,
  className = "",
  delay = 0,
  distance = 96,
  amount = 0.3,
}) {
  const prefersReduced = useReducedMotion?.();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, filter: "blur(6px)" }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        ease: [0.16, 1, 0.3, 1],
        duration: 1.05,
        delay,
      }}
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

function BeerCard({
  image = "/images/0616ala-removebg-preview.png",
  imageAlt = "Beer",
  bg = "",
  bgImage,
  title = "Title",
  desc = "",
  delay = 0,
}) {
  return (
    <FadeUp delay={delay} className="w-full h-full">
      <motion.article
        className="
          relative group flex items-center justify-center 
          overflow-hidden w-full h-[350px] sm:h-[500px] xl:h-full
          py-6 sm:py-10
        "
        style={{
          backgroundColor: bg,
          backgroundImage: bgImage ? `url(${bgImage})` : "",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        initial={{ opacity: 0, y: 36, scale: 0.98, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {/* ===== 浮動文字 ===== */}
        <div
          className="
          pointer-events-none absolute top-6 sm:top-8
          left-1/2 -translate-x-1/2
          w-[80%] text-center z-20
        "
        >
          <div
            className="
              opacity-100 sm:opacity-0
              sm:-translate-y-3
              sm:group-hover:opacity-100 sm:group-hover:translate-y-0
              transition-all duration-700
            "
          >
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2">
              {title}
            </h2>
            <p className="text-black/90 leading-relaxed text-sm sm:text-base">
              {desc}
            </p>
          </div>
        </div>

        {/* ===== 啤酒圖片 ===== */}
        <div
          className="
            relative 
            w-[65%] sm:w-[78%] 
            max-w-[460px] mt-20 sm:mt-0 sm:max-w-[620px]
            z-10
            overflow-visible
            flex justify-center
          "
        >
          <motion.div
            initial={{ y: 0, scale: 1.005 }}
            whileHover={{ y: 40, scale: 1.08 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="origin-top"
          >
            <img
              src={image}
              alt={imageAlt}
              className="
                w-full 
                max-h-[420px] sm:max-h-[500px]
                object-contain mx-auto 
                select-none
              "
              decoding="async"
              loading="eager"
              fetchPriority="high"
              draggable="false"
            />
          </motion.div>
        </div>
      </motion.article>
    </FadeUp>
  );
}

/* ========= SnackDropLoop：掉落動畫 ========= */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
function RotatingMark({ className = "", sizeVW = 10 }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: "linear", duration: 16 }}
      style={{ width: `${sizeVW}vw`, minWidth: 56 }} // 行動裝置保底尺寸
    >
      <Image
        src="/images/index/banner-07-a.png"
        alt="mark"
        width={800}
        height={500}
        loading="lazy"
        placeholder="empty"
        className="w-full h-auto"
        sizes="(max-width: 640px) 64px, 10vw"
      />
    </motion.div>
  );
}
/* ========= AutoSwapImage：兩張 A/B 自動輪播（可選左右進場/無位移、支援旋轉） ========= */
function AutoSwapImage({
  base, // 例如 "/images/index/banner-05"
  alt = "",
  className = "",
  positionClass = "", // 維持絕對定位與位置
  width = 800,
  height = 500,
  interval = 6000, // 輪播間隔
  initialDelay = 0, // 首次切換延遲
  enterFrom = "none", // "left" | "right" | "none"
  offset = 40, // 位移距離（px）
  rotateInfinite = false, // 360 無限旋轉
  rotateDuration = 16, // 旋轉一圈秒數
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

  // 位移方向
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
          filter: dxIn ? "blur(6px)" : "blur(0px)",
        }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{
          opacity: 0,
          x: dxOut,
          filter: dxOut ? "blur(6px)" : "blur(0px)",
        }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        <Image
          src={showB ? srcB : srcA}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          placeholder="empty"
          className={className}
          sizes="(max-width: 1024px) 80vw, 50vw"
        />
      </motion.div>
    </AnimatePresence>
  );

  // 需要無限旋轉時，用外層包一層旋轉容器（不受 key 影響）
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

export default function Home() {
  const rightRef = useRef(null);

  // 中央 hotpot 旋轉
  const baseAngle = useMotionValue(0);
  const hotpotRotate = useSpring(baseAngle, {
    stiffness: 300,
    damping: 18,
    mass: 0.8,
  });
  useEffect(() => {
    const stepPerWheel = 0.25;
    const onWheel = (e) =>
      baseAngle.set(baseAngle.get() + e.deltaY * stepPerWheel);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [baseAngle]);

  const [index, setIndex] = useState(0);
  const images = [
    "https://image.memorycorner8.com/DAV02145.jpg",
    "https://image.memorycorner8.com/DAV02128.jpg",
    "https://image.memorycorner8.com/DAV02175.jpg",
  ];
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((p) => (p + 1) % images.length),
      9000
    );
    return () => clearInterval(timer);
  }, [images.length]);

  // Dinging 區塊（錨點會被零食使用）
  const dingingRef = useRef(null);
  const anchorRef = useRef(null);
  useScroll({ target: dingingRef, offset: ["start 80%", "end 25%"] });

  const cards = [
    {
      image: "/images/beer/4.金牌ONE-Photoroom.png",
      bgImage: "/images/index/beer/beer-bg-green.png", // ✅ 綠色背景
      title: "金牌啤酒",
      desc: "嚴選麥芽香與清爽氣泡，回味無窮的在地經典。",
      delay: 0,
    },
    {
      image: "/images/beer/6.荔枝-Photoroom.png",
      bgImage: "/images/index/beer/beer-bg-peach.png", // ✅ 桃色背景
      title: "果香調性",
      desc: "淡淡果香與細緻泡沫，微醺剛剛好。",
      delay: 0.15,
    },
    {
      image: "/images/beer/9.蜂蜜-Photoroom.png",
      bgImage: "/images/index/beer/beer-bg-yellow.png", // ✅ 黃色背景
      title: "濃厚黑麥",
      desc: "焦糖與可可的尾韻，征服重口味愛好者。",
      delay: 0.3,
    },
    {
      image: "/images/beer/12.葡萄-Photoroom.png",
      bgImage: "/images/index/beer/beer-bg-pink.png", // ✅ 粉色背景
      title: "清爽拉格",
      desc: "超順口、耐喝不膩，百搭各式台式料理。",
      delay: 0.45,
    },
  ];

  return (
    <ReactLenis root>
      <Layout>
        <section className="section-hero z-[9] pt-[0px] relative  md:mt-0 aspect-[16/16] md:aspect-[16/12]  xl:aspect-[16/7.6] overflow-hidden">
          <div className="relative h-full w-full">
            {/* 中央主標（只替換，不位移） */}
            <AutoSwapImage
              base="/images/index/banner-06"
              alt="background"
              positionClass="z-10 right-[-3%] top-[10%] md:top-[-10%]"
              className="w-[80vw]"
              width={800}
              height={500}
              interval={7000}
              enterFrom="none" // ✅ 不做位移
            />

            {/* 角色（右側 → 從右邊進入） */}
            <AutoSwapImage
              base="/images/index/banner-05"
              alt="charactor"
              positionClass="z-20 right-[0%]  bottom-[-2%]   "
              className="w-[70vw] sm:w-[55vw]  lg:w-[50vw] xl:w-[52vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={1200}
              enterFrom="right" // ✅ 從右邊進來
              offset={36}
            />

            {/* 筷子（左側 → 從左邊進入，過度「稍晚」） */}
            <AutoSwapImage
              base="/images/index/banner-02"
              alt="chopsticks"
              positionClass="z-50 left-[-10%] top-[15%] rotate-[25deg] md:rotate-0 md:top-[24%]"
              className="w-[45vw] md:w-[30vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={2400} // ✅ 再晚一點
              enterFrom="left" // ✅ 從左邊進來
              offset={28}
            />

            {/* 轉動標誌（左側 → 持續 360° 旋轉 + A/B 替換 + 左邊進入） */}
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
              rotateInfinite // ✅ 無限旋轉
              rotateDuration={16} // 一圈 16 秒
            />

            {/* 火鍋（左側 → 從左邊進入） */}
            <AutoSwapImage
              base="/images/index/banner-01"
              alt="hotpot"
              positionClass="z-10 left-[4%] md:left-[2%] top-[44%] sm:top-[25%] md:top-[50%] 2xl:top-[55%] -translate-y-1/2"
              className="w-[75vw] md:w-[60vw]"
              width={800}
              height={500}
              interval={7000}
              initialDelay={4800}
              enterFrom="left" // ✅ 從左邊進來
              offset={32}
            />
          </div>
        </section>

        {/* ===== 四等份卡片：改為不同圖片＋文案 ===== */}
        <section className=" ">
          {/* ✅ auto-rows-fr 讓每列高度一致，子項可 h-full 撐滿 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-fr h-auto xl:h-[700px] w-full mx-auto">
            {cards.map((c, i) => (
              <Link key={i} href="/beer" className="flex w-full">
                <BeerCard
                  image={c.image}
                  imageAlt={c.title}
                  bgImage={c.bgImage} // ✅ 新增這行
                  title={c.title}
                  desc={c.desc}
                  delay={c.delay}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* ======= 零食：各自落入袋口（原樣保留） ======= */}
        <section
          ref={dingingRef}
          className="section_Dinging relative  overflow-x-hidden"
        >
          <div className="mx-auto  py-3 sm:py-20 max-w-[1920px] px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-center">
              {/* 左側：動畫區 */}
              <div className="left w-full lg:w-1/2 overflow-hidden aspect-[3/4] sm:aspect-[4/4] relative">
                <div className="flex justify-center">
                  <FadeUp delay={0.05} amount={0.25} className="absolute ">
                    <Image
                      src="/images/snack/buynow.png"
                      width={500}
                      height={300}
                      className="w-[260px] sm:w-[320px] h-auto"
                      alt="buy now"
                    />
                  </FadeUp>
                </div>

                <div
                  ref={anchorRef}
                  className="absolute left-[34%] -translate-x-1/2 bottom-[18%] w-2 h-2"
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%]  bottom-[10%] sm:bottom-[30%] -translate-x-1/2 left-[-5%] sm:left-[40%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05055.png"
                  imgClassName="w-[180px] sm:w-[220px]"
                  spawn={260}
                  sway={90}
                  spin={18}
                  alt="藍色作業本"
                  scaleStart={1.0}
                  scaleEnd={0.7}
                  duration={2.2}
                  delay={0.0}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%]  bottom-[7%] sm:bottom-[40%] -translate-x-1/2 left-[10%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05082.png"
                  imgClassName="w-[270px] sm:w-[320px]"
                  spawn={260}
                  sway={90}
                  spin={18}
                  alt="義美小泡芙"
                  scaleStart={1.0}
                  scaleEnd={0.7}
                  duration={2.2}
                  delay={0.0}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%]  bottom-[15%] sm:bottom-[30%] -translate-x-1/2 left-[35%] sm:left-[50%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05035.png"
                  imgClassName="w-[200px] sm:w-[220px]"
                  spawn={260}
                  sway={90}
                  spin={18}
                  alt="Q果酥"
                  scaleStart={1.0}
                  scaleEnd={0.7}
                  duration={2.2}
                  delay={0.0}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%]  bottom-0 sm:bottom-[20%] -translate-x-1/2 left-[30%] sm:left-[60%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05051.png"
                  imgClassName="w-[220px] sm:w-[220px]"
                  spawn={260}
                  sway={90}
                  spin={18}
                  alt="花色作業本"
                  scaleStart={1.0}
                  scaleEnd={0.7}
                  duration={2.2}
                  delay={0.0}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%]  bottom-[-10%] sm:bottom-[12%] -translate-x-1/2 left-[30%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05021.png"
                  imgClassName="w-[160px] sm:w-[220px]"
                  spawn={460}
                  sway={-90}
                  spin={18}
                  alt="牛奶糖"
                  scaleStart={1.0}
                  scaleEnd={0.7}
                  duration={2.2}
                  delay={0.0}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%] bottom-[0%] -translate-x-1/2 left-[15%] sm:left-[35%] z-[9]"
                  imgSrc="/images/灶腳商品圖/葡萄維他命.png"
                  imgClassName="w-[70px] sm:w-[120px]"
                  spawn={480}
                  sway={-120}
                  spin={-14}
                  alt="葡萄維他命"
                  scaleStart={1.0}
                  scaleEnd={0.68}
                  duration={2.35}
                  delay={0.35}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%] bottom-[2%] -translate-x-1/2 left-[30%] sm:left-[25%] z-[60]"
                  imgSrc="/images/灶腳商品圖/DSC05007-3.png"
                  imgClassName="w-[300px] sm:w-[350px]"
                  spawn={520}
                  sway={0}
                  alt="黑色巧克力"
                  spin={10}
                  scaleStart={1.0}
                  scaleEnd={0.66}
                  duration={2.3}
                  delay={0.7}
                  lockXToMouth
                  xOffset={-240}
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%] bottom-[10%] -translate-x-1/2 left-[18%] z-[60]"
                  imgSrc="/images/灶腳商品圖/DSC05033.png"
                  imgClassName="w-[170px] sm:w-[220px]"
                  spawn={500}
                  sway={0}
                  alt="風味糖"
                  spin={-16}
                  scaleStart={1.0}
                  scaleEnd={0.64}
                  duration={2.4}
                  delay={1.05}
                  lockXToMouth
                  xOffset={-280}
                />

                <FadeUp
                  delay={0.1}
                  amount={0.2}
                  className="absolute w-full bottom-[-5%] sm:bottom-[-40%] xl:bottom-[-30%] 2xl:bottom-[-20%] md:bottom-[-35%] z-[99] left-0 -translate-x-1/2"
                >
                  <Image
                    src="/images/灶腳商品圖/DSC05114.png"
                    alt="包包"
                    placeholder="empty"
                    loading="lazy"
                    width={1300}
                    height={1000}
                    className="max-w-[1000px] w-full xl:scale-[1] scale-[1.05] h-auto"
                  />
                </FadeUp>
              </div>

              {/* 右側：文案區 */}
              <div className="right p-7 md:p-20 w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                <FadeUp amount={0.35} className="w-full max-w-[680px]">
                  <div className="flex flex-col">
                    {/* 大標：VARIETY */}
                    <FadeUp>
                      <h2 className="title-large font-bold m-0 p-0 leading-none">
                        VARIETY
                      </h2>
                    </FadeUp>

                    {/* 英文小標：Traditional grocery shop */}
                    <div className="">
                      <FadeUp delay={0.06}>
                        <p className="sub_title m-0 p-0">
                          Traditional grocery shop
                        </p>
                      </FadeUp>
                    </div>

                    {/* 中文說明文字 */}
                    <div className="mt-3 sm:mt-4">
                      <FadeUp delay={0.08}>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          販售各式台灣經典零食、懷舊童玩，
                          以及方便好料理的台灣小吃冷凍包。
                        </p>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          帶你重溫最經典的台灣味。
                        </p>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          喜歡台味的朋友，能線上輕鬆訂購， 也歡迎到店逛逛！
                        </p>
                      </FadeUp>
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        <section className="section_brand_story relative ">
          <div className="pointer-events-none absolute top-[7%] sm:top-[15%] left-[10%]  md:translate-x-0 z-20">
            <FadeUp>
              <h2
                className="
        font-extrabold tracking-[0.18em]
        text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]
        text-[clamp(2.4rem,7vw,8.5rem)]
        leading-none
      "
              >
                ABOUT&nbsp;US
              </h2>
            </FadeUp>
          </div>

          <div className=" mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-0">
            <FadeUp delay={0.02} amount={0.25} className="relative">
              <div className="group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]">
                <Image
                  src="/images/index/about/DAV01968.jpg"
                  alt="有香集團"
                  fill
                  priority={false}
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-black/35" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div
                    className="
              transform transition-transform duration-500 ease-out
              group-hover:-translate-y-2
            "
                  >
                    <Image
                      src="/images/index/about/有香集團-logo.png"
                      alt="有香集團 logo"
                      width={260}
                      height={120}
                      className="w-[160px] md:w-[190px] lg:w-[210px] h-auto"
                    />
                  </div>

                  <div
                    className="
              mt-3 opacity-0 translate-y-3
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-500 ease-out delay-75
            "
                  >
                    <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                      集結台灣經典風味與回憶，開發多元餐飲品牌，<br></br>
                      把「有香」的味道帶進每一個日常。
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.06} amount={0.25} className="relative">
              <div className="group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]">
                <Image
                  src="/images/index/about/DAV01683.jpg"
                  alt="有香 Memory Corner"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div
                    className="
              transform transition-transform duration-500 ease-out
              group-hover:-translate-y-2
            "
                  >
                    <Image
                      src="/images/index/about/有香-logo.png"
                      alt="有香 logo"
                      width={260}
                      height={120}
                      className="w-[150px] md:w-[180px] lg:w-[200px] h-auto"
                    />
                  </div>
                  <div
                    className="
              mt-3 opacity-0 translate-y-3
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-500 ease-out delay-75
            "
                  >
                    <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                      一碗熱騰騰的牛肉麵、一桌家常菜，<br></br>
                      把巷口記憶與人情味一起端上桌。
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1} amount={0.25} className="relative">
              <div className="group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]">
                <Image
                  src="/images/index/about/DAV01773 (1).jpg"
                  alt="億點點 Sweet Memory"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div
                    className="
              transform transition-transform duration-500 ease-out
              group-hover:-translate-y-2
            "
                  >
                    <Image
                      src="/images/index/about/億點點-logo.png"
                      alt="億點點 logo"
                      width={260}
                      height={120}
                      className="w-[150px] md:w-[180px] lg:w-[200px] h-auto"
                    />
                  </div>
                  <div
                    className="
              mt-3 opacity-0 translate-y-3
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-500 ease-out delay-75
            "
                  >
                    <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                      手作甜點與飲品，蒐集生活裡那些 <br></br>
                      一點點卻很重要的甜美記憶。
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ✅ SEO 友善影片載入（自動播放 / 靜音 / 無限重複 / playsInline） */}
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
        {/* 
        <section className="section_video p-10">
          ...
        </section> */}
        <section className="section_app_operation bg-[url('/images/index/app/bg.png')]   bg-cover bg-no-repeat relative py-16 sm:py-20 px-6 sm:px-10">
          <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-10 md:gap-16">
            {/* 左側文字區 */}
            <div className="w-full md:w-[50%] flex items-center">
              <FadeUp amount={0.35} className="w-full">
                <div className="flex flex-col">
                  {/* 大標：REWARDS APP */}
                  <FadeUp>
                    <h2
                      className="
            title-large 
            font-bold
                text-[#3b2619]
              
                leading-none
              "
                    >
                      REWARDS APP
                    </h2>
                  </FadeUp>

                  {/* 英文小標：Earn Points with Every Purchase */}
                  <div className="mt-4">
                    <FadeUp delay={0.06}>
                      <p
                        className="
                  text-[#3b2619]
                  font-normal
                   sub_title
                  leading-relaxed
                "
                      >
                        Earn Points with Every Purchase
                      </p>
                    </FadeUp>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* 右側 APP 示意圖 */}
            <div className="w-full md:w-[50%] flex justify-center md:justify-end">
              <FadeUp delay={0.1} amount={0.3} className="w-full max-w-[820px]">
                <Link href="/app" className="relative flex justify-center">
                  <Image
                    src="/images/index/app/hand.png"
                    alt="Rewards App Mockup"
                    width={1700}
                    height={1700}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </Link>
              </FadeUp>
            </div>
          </div>
        </section>
      </Layout>
    </ReactLenis>
  );
}
