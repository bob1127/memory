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

/* ========= 小卡片（四等份）— 支援不同圖片與文案 ========= */
function BeerCard({
  image = "/images/0616ala-removebg-preview.png",
  imageAlt = "Beer",
  bg = "",
  title = "Title",
  desc = "",
  delay = 0,
}) {
  return (
    // ✅ 讓外層也撐滿
    <FadeUp delay={delay} className="w-full ">
      <motion.article
        // ✅ 卡片本體撐滿父層
        className="relative group flex items-center justify-center overflow-hidden  py-0 lg:py-10 w-full"
        style={{ backgroundColor: bg }}
        initial={{ opacity: 0, y: 36, scale: 0.98, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.35, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {/* 浮動文字（桌機 hover 顯示；手機常顯示） */}
        <div className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 w-[72%] text-center z-20">
          <div className="opacity-100 sm:opacity-0 sm:-translate-y-3 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-700">
            <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
            <p className="text-black/90 leading-relaxed  text-[14px] sm:text-base">
              {desc}
            </p>
          </div>
        </div>

        {/* 大圖：hover 後下移＋放大 */}
        <div className="relative w-[78%] max-w-[620px] z-10 overflow-hidden sm:group-hover:overflow-visible">
          <motion.div
            initial={{ y: 0, scale: 1.005 }}
            whileHover={{ y: 40, scale: 1.1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="origin-top"
          >
            {/* 外部圖用 <img>，內部圖可改成 <Image> */}
            <img
              src={image}
              alt={imageAlt}
              className="w-[180%] mx-auto mt-8 h-[390px] sm:h-[500px] block object-contain select-none"
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

  /* ===== 這裡定義四張卡片的圖片與文案 ===== */
  const cards = [
    {
      image: "/images/beer/4.金牌ONE-Photoroom.png",
      bg: "",
      title: "金牌啤酒",
      desc: "嚴選麥芽香與清爽氣泡，回味無窮的在地經典。",
      delay: 0,
    },
    {
      image: "/images/beer/6.荔枝-Photoroom.png",
      bg: "",
      title: "果香調性",
      desc: "淡淡果香與細緻泡沫，微醺剛剛好。",
      delay: 0.15,
    },
    {
      image: "/images/beer/9.蜂蜜-Photoroom.png",
      bg: "",
      title: "濃厚黑麥",
      desc: "焦糖與可可的尾韻，征服重口味愛好者。",
      delay: 0.3,
    },
    {
      image: "/images/beer/12.葡萄-Photoroom.png",
      bg: "",
      title: "清爽拉格",
      desc: "超順口、耐喝不膩，百搭各式台式料理。",
      delay: 0.45,
    },
  ];

  return (
    <ReactLenis root>
      <Layout>
        <div className="mt-[-20px]  z-10">
          {/* <MinimalPushOverlayMenu /> */}
        </div>

        {/* ===== HERO（自適應優化） ===== */}
        <section className="section-hero z-[9] relative  mt-[65px] md:mt-0  aspect-[16/18] md:aspect-[16/11] xl:aspect-[16/7.6] overflow-hidden">
          <div className="relative h-full w-full">
            {/* 中央主標（文字） */}
            <div className="absolute z-10 right-[-3%] top-[10%] md:top-[-10%]">
              <Image
                src="/images/index/banner-06-a.png"
                alt="background"
                placeholder="empty"
                loading="lazy"
                width={800}
                height={500}
                className="w-[80vw] "
              />
            </div>
            <div className="absolute z-20 right-[0%] bottom-0">
              <Image
                src="/images/index/banner-05-a.png"
                alt="charactor"
                placeholder="empty"
                loading="lazy"
                width={800}
                height={500}
                className=" w-[80vw] md:w-[60vw] "
              />
            </div>
            <div className="absolute z-10 left-[-10%] top-[5%] rotate-[25deg] md:rotate-0 md:top-[14%]">
              <Image
                src="/images/index/banner-02-a.png"
                alt="chopsticks"
                placeholder="empty"
                loading="lazy"
                width={800}
                height={500}
                className=" w-[45vw] md:w-[30vw] "
              />
            </div>
            <div className="absolute z-30  left-[10%] md:left-[20%] bottom-[43%] md:bottom-[20%] xl:bottom-[7%]">
              <Image
                src="/images/index/banner-07-a.png"
                alt="mark"
                placeholder="empty"
                loading="lazy"
                width={800}
                height={500}
                className="w-[10vw] "
              />
            </div>
            <div className="absolute z-10 left-[4%] md:left-[2%]  top-[34%] md:top-1/2 -translate-y-1/2">
              <Image
                src="/images/index/banner-01-a.png"
                alt="hotpot"
                placeholder="empty"
                loading="lazy"
                width={800}
                height={500}
                className=" w-[75vw] md:w-[57vw] "
              />
            </div>
          </div>
        </section>

        {/* ===== 四等份卡片：改為不同圖片＋文案 ===== */}
        <section className="py-10 lg:py-20 bg-[#f9f3e0]">
          <div className="title">
            <h2 className="text-5xl text-center">BEER STORE</h2>
          </div>
          {/* ✅ auto-rows-fr 讓每列高度一致，子項可 h-full 撐滿 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-fr h-auto ">
            {cards.map((c, i) => (
              // ✅ Link 也撐滿，避免預設 inline 造成寬度不滿
              <Link key={i} href="/beer" className="flex w-full">
                <BeerCard
                  image={c.image}
                  imageAlt={c.title}
                  bg={c.bg}
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
          <div className="mx-auto max-w-[1920px] px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-center">
              {/* 左側：動畫區 */}
              <div className="left w-full lg:w-1/2 overflow-hidden h-[85vh] xl:h-[70vh] md:min-h-screen relative">
                <FadeUp
                  delay={0.05}
                  amount={0.25}
                  className="absolute left-[30%] -translate-x-1/2 top-[5%]"
                >
                  <Image
                    src="/images/snack/buynow.png"
                    width={500}
                    height={300}
                    className="w-[260px] sm:w-[320px] h-auto"
                    alt="buy now"
                  />
                </FadeUp>

                <div
                  ref={anchorRef}
                  className="absolute left-[34%] -translate-x-1/2 bottom-[18%] w-2 h-2"
                />
                <SnackDropLoop
                  anchorRef={anchorRef}
                  className="w-[80%]  bottom-[30%] -translate-x-1/2 left-[40%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05055.png"
                  imgClassName="w-[320px] sm:w-[220px]"
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
                  className="w-[80%]  bottom-[40%] -translate-x-1/2 left-[10%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05082.png"
                  imgClassName="w-[300px] sm:w-[320px]"
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
                  className="w-[80%]  bottom-[30%] -translate-x-1/2 left-[50%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05035.png"
                  imgClassName="w-[320px] sm:w-[220px]"
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
                  className="w-[80%]  bottom-[20%] -translate-x-1/2 left-[60%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05051.png"
                  imgClassName="w-[320px] sm:w-[220px]"
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
                  className="w-[80%]  bottom-[12%] -translate-x-1/2 left-[30%] z-[9]"
                  imgSrc="/images/灶腳商品圖/DSC05021.png"
                  imgClassName="w-[320px] sm:w-[220px]"
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
                  className="w-[80%] bottom-[0%] -translate-x-1/2 left-[35%] z-[9]"
                  imgSrc="/images/灶腳商品圖/葡萄維他命.png"
                  imgClassName="w-[140px] sm:w-[170px]"
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
                  className="w-[80%] bottom-[2%] -translate-x-1/2 left-[25%] z-[60]"
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
                  className="absolute w-full bottom-[-15%] md:bottom-[-35%] z-[99] left-0 -translate-x-1/2"
                >
                  <Image
                    src="/images/灶腳商品圖/DSC05114.png"
                    alt="包包"
                    placeholder="empty"
                    loading="lazy"
                    width={1300}
                    height={1000}
                    className="max-w-[1000px] xl:scale-[1] scale-[1.2] h-auto"
                  />
                </FadeUp>
              </div>

              {/* 右側：文案區 */}
              <div className="right p-7 md:p-20 w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                <FadeUp amount={0.35} className="w-full max-w-[680px]">
                  <div className="flex flex-col">
                    <FadeUp>
                      <h2 className="font-extrabold text-[#f6f5f3] text-4xl sm:text-5xl lg:text-6xl">
                        Dinging Memory
                      </h2>
                    </FadeUp>
                    <div className="mt-3">
                      <FadeUp delay={0.06}>
                        <p className="text-[#A18360] font-bold text-lg sm:text-2xl tracking-wider">
                          Lorem dolor sit amet consectetur
                        </p>
                      </FadeUp>
                    </div>
                    <ul className="mt-2">
                      <FadeUp delay={0.08}>
                        <li className="mt-4  text-[#333] leading-relaxed">
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Omnis laudantium voluptates fugiat aliquid minus
                          doloremque...
                        </li>
                      </FadeUp>
                    </ul>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* 其餘段落（品牌故事 / VIDEO / APP INTRO）保持原樣 */}
        <section className="section_brand_story relative  px-10 py-20">
          <FadeUp
            delay={0.02}
            className="side-info absolute rotate-[40deg] xl:rotate-[-90deg] left-[-5%] top-0 xl:top-[35%]"
          >
            <div className="flex  pl-[50px] justify-center  py-8  w-full items-center">
              <div className="txt text-xl flex  items-center font-bold xl:rotate-[-90deg] tracking-wider">
                <Image
                  src="/images/text04.png"
                  alt=""
                  placeholder="empty"
                  loading="lazy"
                  width={200}
                  height={200}
                  className="w-[55px]"
                />
                The Memory Taiwan Food
                <Image
                  src="/images/text05.png"
                  alt=""
                  placeholder="empty"
                  loading="lazy"
                  width={200}
                  height={200}
                  className="w-[55px]"
                />
              </div>
            </div>
          </FadeUp>

          <div className="title max-w-[1920px] xl:w-[70%] md:w-[90%] w-full mx-auto">
            <FadeUp>
              <h2 className="text-4xl mt-6 sm:mt-0 font-bold font-stone-800">
                BARND STORY
              </h2>
            </FadeUp>
            <FadeUp delay={0.06}>
              <h3 className="text-2xl font-bold">
                consectetur adipisicing elit. Modi, aliquid!
              </h3>
            </FadeUp>
            <FadeUp delay={0.12}>
              <div className="description mt-8 max-w-[600px]">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Laudantium obcaecati...
              </div>
            </FadeUp>
          </div>

          <div className="brand max-w-[1920px] xl:w-[70%] md:w-[90%] gap-5 w-full mx-auto grid  lg:grid-cols-3 ">
            <FadeUp delay={0.04} amount={0.25} className="relative">
              <Link href="main01">
                <Image
                  src="/images/室內.png"
                  width={1000}
                  placeholder="empty"
                  loading="lazy"
                  height={1500}
                  className="max-w-[650px] w-full sm:w-[88%]] mt-10"
                />
              </Link>
            </FadeUp>
            <FadeUp delay={0.08} amount={0.25}>
              <Link href="/main02">
                <Image
                  src="/images/室內.png"
                  width={1000}
                  placeholder="empty"
                  loading="lazy"
                  height={1500}
                  className="max-w-[650px] w-full sm:w-[88%]] mt-10"
                />
              </Link>
            </FadeUp>
            <FadeUp delay={0.12} amount={0.25}>
              <Image
                src="/images/室內.png"
                width={1000}
                placeholder="empty"
                loading="lazy"
                height={1500}
                className="max-w-[650px] w-full sm:w-[88%] mt-10"
              />
            </FadeUp>
          </div>
        </section>

        <section className="section_video p-10">
          <div className="title mx-auto mb-4 flex justify-center items-center flex-col">
            <FadeUp>
              <h2 className="text-[#1b1b1b] text-6xl font-extrabold">VIDEO</h2>
            </FadeUp>
            <FadeUp delay={0.06}>
              <h3 className="text-white text-center text-2xl font-normal">
                Lorem ipsum dolor, sit amet consectetur adipisicing.
              </h3>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="max-w-[600px] text-center font-light">
                Lorem ipsum dolor sit amet consectetur adipisicing elit...
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.08} amount={0.25}>
            <BottomVideoGallery
              items={[
                {
                  src: "https://www.pexels.com/zh-tw/download/video/3015488/",
                  title: "Pexels 3015488",
                  poster:
                    "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg",
                  toIndex: 0,
                },
                {
                  src: "https://www.pexels.com/zh-tw/download/video/3195369/",
                  title: "Pexels 3195369",
                  poster:
                    "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
                  toIndex: 1,
                },
                {
                  src: "https://www.pexels.com/zh-tw/download/video/1341925/",
                  title: "Pexels 1341925",
                  poster:
                    "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg",
                  toIndex: 2,
                },
                {
                  src: "https://www.pexels.com/zh-tw/download/video/2959312/",
                  title: "Pexels 2959312",
                  poster:
                    "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
                  toIndex: 3,
                },
                {
                  src: "https://www.pexels.com/zh-tw/download/video/3195728/",
                  title: "Pexels 3195728",
                  poster:
                    "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
                  toIndex: 4,
                },
              ]}
              onItemClick={(i, item) => {
                if (Number.isInteger(item?.toIndex)) {
                  // goTo(item.toIndex);
                } else {
                  // handleNext();
                }
              }}
            />
          </FadeUp>
        </section>

        <section className="section_app_operation p-10">
          <div className="max-w-[1920px] mx-auto xl:w-[85%] md:w-[92%] w-full">
            <div className="top">
              <div className="title mx-auto flex justify-center items-center flex-col">
                <FadeUp>
                  <h2 className="text-[#1b1b1b] text-6xl font-extrabold">
                    APP INTRO
                  </h2>
                </FadeUp>
                <FadeUp delay={0.06}>
                  <h3 className="text-white text-2xl text-center font-normal">
                    Lorem ipsum dolor, sit amet consectetur adipisicing.
                  </h3>
                </FadeUp>
                <FadeUp delay={0.12}>
                  <p className="max-w-[600px] text-center font-light">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit...
                  </p>
                </FadeUp>
                <FadeUp delay={0.18}>
                  <button className="border text-white bg-[#f2893e] border-black mt-4 mb-8 px-6 py-2">
                    Go App
                  </button>
                </FadeUp>
              </div>
              <FadeUp delay={0.1} amount={0.25}>
                <Image
                  src="/images/mobile-top.png"
                  alt=""
                  placeholder="empty"
                  loading="lazy"
                  width={1000}
                  height={1000}
                  className="w-[950px] mx-auto"
                />
              </FadeUp>
            </div>
          </div>
        </section>
      </Layout>
    </ReactLenis>
  );
}
