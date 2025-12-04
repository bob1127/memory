import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-marquee-slider";
import dynamic from "next/dynamic";
import { useRouter } from "next/router"; // 用來獲取當前語言狀態
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useReducedMotion,
} from "framer-motion";

// Components
import Layout from "../pages/Layout"; // 確認您的 Layout 路徑是否正確
import Carousel from "../components/EmblaCarouselTravel/index";

// Dynamic Imports
const MinimalPushOverlayMenu = dynamic(
  () => import("@/components/MinimalPushOverlayMenu"),
  { ssr: false }
);

/* =================================================================
   1. 翻譯資料庫 (實際專案通常會放在 locales/zh-TW.json 檔案中)
   ================================================================= */
const TRANSLATIONS = {
  "zh-TW": {
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
   2. SSG 資料獲取 (Server Side Build Time)
   ================================================================= */
export async function getStaticProps({ locale }) {
  // 根據網址 (例如 /en 或 /zh-TW) 決定要拿哪一份資料
  // 如果找不到對應語言，預設回傳 zh-TW
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];

  return {
    props: {
      t, // 翻譯資料
      locale, // 當前語系代碼
    },
  };
}

/* =================================================================
   3. 動畫與功能元件 (保持不變)
   ================================================================= */

/* 優化版：滾動進場 */
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

/* SnackDropLoop */
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
        willChange: "transform, opacity", // ✅ 關鍵優化
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

/* AutoSwapImage */
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
   4. 主頁面元件 (接收 props.t)
   ================================================================= */
export default function Home({ t, locale }) {
  // 如果需要做語言切換按鈕，可以用 useRouter
  // const router = useRouter();
  // const switchLang = () => router.push('/', '/', { locale: locale === 'en' ? 'zh-TW' : 'en' })

  const rightRef = useRef(null);

  // 中央 hotpot 旋轉邏輯
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

  // Dinging 區塊
  const dingingRef = useRef(null);
  const anchorRef = useRef(null);
  useScroll({ target: dingingRef, offset: ["start 80%", "end 25%"] });

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

        <section className="section_beer overflow-hidden">
          <Carousel />
        </section>

        {/* ======= 零食區塊 ======= */}
        <section
          ref={dingingRef}
          className="section_Dinging mx-auto bg-[#efefef] max-w-[1920px] relative overflow-x-hidden"
        >
          <div className="mx-auto py-3 sm:py-20 max-w-[1920px] px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-center">
              {/* 左側：動畫區 (保持原樣) */}
              <div className="left w-full lg:w-1/2 overflow-hidden aspect-[3/4] sm:aspect-[4/4] relative">
                <div className="flex justify-center">
                  <FadeUp delay={0.05} amount={0.25} className="absolute">
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

                {/* SnackDropLoops (保持不變) */}
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%] bottom-[10%] sm:bottom-[30%] -translate-x-1/2 left-[-5%] sm:left-[40%] z-[9]"
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
                {/* ... 其他 SnackDropLoop 省略 (內容保持不變) ... */}
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%] bottom-[7%] sm:bottom-[40%] -translate-x-1/2 left-[10%] z-[9]"
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
                  className="w-[80%] bottom-[15%] sm:bottom-[30%] -translate-x-1/2 left-[35%] sm:left-[50%] z-[9]"
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
                  className="w-[80%] bottom-0 sm:bottom-[20%] -translate-x-1/2 left-[30%] sm:left-[60%] z-[9]"
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
                  className="w-[80%] bottom-[-10%] sm:bottom-[12%] -translate-x-1/2 left-[30%] z-[9]"
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

              {/* 右側：文案區 (使用 t 變數替換文字) */}
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
                  src="/images/index/about/DAV01968.jpg"
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
                    {/* 使用 dangerouslySetInnerHTML 支援 <br/> 標籤 */}
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
                  src="/images/index/about/DAV01683.jpg"
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
                  src="/images/index/about/DAV01773 (1).jpg"
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

        {/* Video Section (保持不變) */}
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
