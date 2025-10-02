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
  useTransform,
} from "framer-motion";

/* ========== 小元件：從火鍋中心「彈出」到最終位置（無裁切、只設寬度） ========== */
function VgPop({ containerRef, item, index }) {
  const ref = useRef(null);
  const [delta, setDelta] = useState(null);

  useEffect(() => {
    const el = ref.current;
    const wrap = containerRef.current;
    if (!el || !wrap) return;

    const r = el.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const centerX = w.left + w.width / 2;
    const centerY = w.top + w.height / 2;
    const elemX = r.left + r.width / 2;
    const elemY = r.top + r.height / 2;
    setDelta({ x: centerX - elemX, y: centerY - elemY });
  }, []);

  return (
    <motion.div
      ref={ref}
      className="vg01 absolute -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{ ...item.final, rotate: `${item.rotate}deg` }}
      initial={
        delta
          ? { x: delta.x, y: delta.y, scale: 0.3, opacity: 0 }
          : { opacity: 0 }
      }
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 22,
        mass: 1.2,
        bounce: 0.25,
        delay: 1.0 + index * 0.28,
      }}
    >
      <motion.img
        src={item.src}
        alt="vg"
        className={`${item.widthClass} h-auto block`}
        draggable="false"
        initial={{ filter: "blur(2px)" }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 0.45, delay: 1.0 + index * 0.28 }}
      />
    </motion.div>
  );
}

/* ========= 工具 ========= */
function useStableDelta(anchorRef, itemRef) {
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
    const ro = new ResizeObserver(() => measure());
    if (anchorRef.current) ro.observe(anchorRef.current);
    if (itemRef.current) ro.observe(itemRef.current);

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

  return { delta, ready, remeasure: measure };
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
  bounce = 10,
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
        endY + bounce,
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

/* ========= 小卡片（四等份） ========= */
/* ========= 小卡片（四等份） ========= */
function BeerCard({
  bg = "#cdcdd5",
  title = "Title",
  desc = "",
  delay = 0,
  ...rest
}) {
  return (
    <motion.article
      className="relative group flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bg }}
      initial={{ opacity: 0, y: 36, scale: 0.98, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      {...rest} // ⭐ 把 data-aos, data-aos-delay 傳給最外層
    >
      <div
        className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 w-[72%] text-center
        opacity-0 -translate-y-3
        transition-all duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)]
        group-hover:opacity-100 group-hover:translate-y-0 will-change-transform z-20"
      >
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/90 leading-relaxed">{desc}</p>
      </div>

      <div
        className="relative w-[78%] max-w-[620px]
        translate-y-0
        transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)]
        group-hover:translate-y-10 will-change-transform z-10 overflow-hidden group-hover:overflow-visible"
      >
        <div
          className="translate-y-0 scale-[1.1] origin-top
          transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)]
          group-hover:scale-[1.6] group-hover:translate-y-[35%] will-change-transform"
        >
          <img
            src="/images/BUD_LIGHT_12oz_C_AdAge_RGB1-e1450364966247-001-removebg-preview.png"
            alt="Beer"
            className="w-[180%] mx-auto h-[500px] block"
            decoding="async"
            loading="eager"
            fetchPriority="high"
            draggable="false"
          />
        </div>
      </div>
    </motion.article>
  );
}

export default function Home() {
  // 👉 .vg01 資訊
  const vgItems = [
    {
      src: "/images/vg07.png",
      final: { right: "10%", top: "70%" },
      rotate: -40,
      widthClass: "w-[180px]",
    },
    {
      src: "/images/vg08.png",
      final: { right: "3%", top: "40%" },
      rotate: -70,
      widthClass: "w-[180px]",
    },
    {
      src: "/images/vg04.png",
      final: { right: "33%", top: "20%" },
      rotate: -40,
      widthClass: "w-[120px]",
    },
    {
      src: "/images/vg03.png",
      final: { left: "33%", top: "20%" },
      rotate: -40,
      widthClass: "w-[100px]",
    },
    {
      src: "/images/vg02.png",
      final: { left: "33%", bottom: "30%" },
      rotate: -40,
      widthClass: "w-[80px]",
    },
    {
      src: "/images/vg01.png",
      final: { right: "33%", bottom: "0%" },
      rotate: -40,
      widthClass: "w-[100px]",
    },
  ];

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

  const [activeTab, setActiveTab] = useState("youshang");

  // Dinging 區塊（錨點會被零食使用）
  const dingingRef = useRef(null);
  const anchorRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: dingingRef,
    offset: ["start 80%", "end 25%"],
  });
  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    mass: 0.8,
  });

  return (
    <ReactLenis root>
      <Layout>
        <div className="mt-[-20px] z-10 ">
          <MinimalPushOverlayMenu />
        </div>

        {/* ====== 你指定要保留的 Section：加上 in-view fade-up ====== */}
        <section className="w-full m-0 bg-white overflow-visible pt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-[85vh]">
            <BeerCard
              bg="#cdcdd5"
              title="Title"
              desc="Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta amet molestiae id beatae, facilis ipsum voluptate quo animi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta"
              data-aos="fade-up"
              data-aos-delay="0"
            />
            <BeerCard
              bg="#cdcdd5"
              title="Title"
              desc="Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta amet molestiae id beatae, facilis ipsum voluptate quo animi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta"
              data-aos="fade-up"
              data-aos-delay="150"
            />
            <BeerCard
              bg="#e5e563"
              title="Title"
              desc="Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta amet molestiae id beatae, facilis ipsum voluptate quo animi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta"
              data-aos="fade-up"
              data-aos-delay="300"
            />
            <BeerCard
              bg="#9e9ee5"
              title="Title"
              desc="Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta amet molestiae id beatae, facilis ipsum voluptate quo animi. Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta"
              data-aos="fade-up"
              data-aos-delay="450"
            />
          </div>
        </section>

        {/* ======= 零食：各自落入袋口（原尺寸→袋口縮小）＋ 無限循環 ======= */}
        <section
          ref={dingingRef}
          className="section_Dinging bg-[#ebe5df] pb-20"
        >
          <div className="flex justify-center">
            <div className="left w-1/2 overflow-hidden min-h-screen relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-0">
                <Image
                  src="/images/snack/buynow.png"
                  width={500}
                  height={300}
                  className="w-[320px]"
                  alt="buy now"
                />
              </div>

              <div
                ref={anchorRef}
                className="absolute -translate-x-1/2 bottom-[18%] w-[8px] h-[8px] left-[34%]"
              />

              <SnackDropLoop
                anchorRef={anchorRef}
                className="w-[80%] bottom-[12%] -translate-x-1/2 left-[30%] z-[9]"
                imgSrc="/images/snack/output-onlinegiftools.gif"
                imgClassName="w-[380px]"
                spawn={460}
                sway={-90}
                spin={18}
                scaleStart={1.0}
                scaleEnd={0.7}
                duration={2.2}
                delay={0.0}
              />
              <SnackDropLoop
                anchorRef={anchorRef}
                className="w-[80%] bottom-[0%] -translate-x-1/2 left-[35%] z-[9]"
                imgSrc="/images/snack/output-onlinegiftools (1).gif"
                imgClassName="w-[400px]"
                spawn={480}
                sway={-120}
                spin={-14}
                scaleStart={1.0}
                scaleEnd={0.68}
                duration={2.35}
                delay={0.35}
              />
              <SnackDropLoop
                anchorRef={anchorRef}
                className="w-[80%] bottom-[2%] -translate-x-1/2 left-[25%] z-[60]"
                imgSrc="/images/snack/output-onlinegiftools (2).gif"
                imgClassName="w-[350px]"
                spawn={520}
                sway={0}
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
                imgSrc="/images/snack/output-onlinegiftools (3).gif"
                imgClassName="w-[400px]"
                spawn={500}
                sway={0}
                spin={-16}
                scaleStart={1.0}
                scaleEnd={0.64}
                duration={2.4}
                delay={1.05}
                lockXToMouth
                xOffset={-280}
              />

              <div className="absolute w-[80%] bottom-[-35%] z-[99] -translate-x-1/2 left-1/2 ">
                <Image
                  src="/images/bag.png"
                  alt="bag"
                  placeholder="empty"
                  loading="lazy"
                  width={1000}
                  height={1000}
                  className="!w-[1000px]"
                />
              </div>
            </div>

            {/* 右側說明文 */}
            <div className="right w-1/2 flex justify-center items-center">
              <div className="flex flex-col">
                <h2 className="font-normal text-[#ff3c3c] text-6xl">
                  Dinging Memory
                </h2>
                <div className="mt-10">
                  <p className="text-[#ff3c3c] font-bold text-xl tracking-wider">
                    Lorem dolor sit amet consectetur
                  </p>
                </div>
                <div>
                  <ul>
                    <li className="mt-5 font-normal ">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Ab, eveniet.
                    </li>
                    <li className="mt-5 font-normal ">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Ab, eveniet.
                    </li>
                    <li className="mt-5 font-normal ">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Ab, eveniet.
                    </li>
                    <li className="mt-5 font-normal ">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Ab, eveniet.
                    </li>
                  </ul>
                  <div className="mt-10">
                    <p className="text-[#ff3c3c] w-1/2 font-bold text-xl tracking-wider ">
                      Lorem dolor sit amet consectetur Lorem dolor sit amet
                      consectetur
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section_brand_story relative bg-white py-20">
          <div className="side-info absolute rotate-[-90deg] left-[-5%] top-[35%]">
            <div className="flex justify-center items-center">
              <div className=" ">
                <Image
                  src="/images/text04.png"
                  alt=""
                  placeholder="empty"
                  loading="lazy"
                  width={200}
                  height={200}
                  className="w-[55px]"
                ></Image>
              </div>
              <div className="txt text-xl tracking-wider">
                The Memory Taiwan Food
              </div>
              <div className=" ">
                <Image
                  src="/images/text04.png"
                  alt=""
                  placeholder="empty"
                  loading="lazy"
                  width={200}
                  height={200}
                  className="w-[55px]"
                ></Image>
              </div>
            </div>
          </div>
          <div className="title max-w-[1920px] xl:w-[80%] md:w-[90%] w-full mx-auto">
            <h2 className="text-4xl font-bold font-stone-800">BARND STORY</h2>
            <h3 className="text-2xl font-bold">
              consectetur adipisicing elit. Modi, aliquid!
            </h3>
            <div className="description mt-8 max-w-[600px]">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Laudantium obcaecati quis esse id sed ex minima nam incidunt
              mollitia perferendis?
            </div>
          </div>
          <div className="brand max-w-[1920px] xl:w-[80%] md:w-[90%] gap-5 w-full mx-auto grid grid-cols-3 ">
            <div className="relative">
              <Link href="main01">
                <Image
                  src="/images/室內.png"
                  width={1000}
                  placeholder="empty"
                  loading="lazy"
                  height={1500}
                  className="max-w-[650px] w-[88%] mt-10"
                ></Image>
              </Link>
            </div>
            <div>
              <Link href="/main02">
                <Image
                  src="/images/室內.png"
                  width={1000}
                  placeholder="empty"
                  loading="lazy"
                  height={1500}
                  className="max-w-[650px] w-[88%] mt-10"
                ></Image>
              </Link>
            </div>
            <div>
              <Image
                src="/images/室內.png"
                width={1000}
                placeholder="empty"
                loading="lazy"
                height={1500}
                className="max-w-[650px] w-[88%] mt-10"
              ></Image>
            </div>
          </div>
        </section>

        <section className="section_video py-20 bg-white">
          <div className="title mx-auto flex justify中心 items-center flex-col">
            <h2 className="text-[#1b1b1b] text-6xl font-extrabold">VIDEO</h2>
            <h3 className="text-[#f39837] text-2xl font-normal">
              Lorem ipsum dolor, sit amet consectetur adipisicing.
            </h3>
            <p className="max-w-[600px] text-center font-light">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Laboriosam, porro blanditiis tempore rem, accusamus sed quibusdam,
              facilis quod eum accusantium aliquid? Labore, dignissimos.
              Molestiae mollitia esse officia beatae quas quis?
            </p>
            <button className="border text白 bg-[#f2893e] border-black mt-4 mb-8 px-6 py-2">
              Go youtube
            </button>
          </div>
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
        </section>

        <section className="section_app_operation py-20 bg-white">
          <div className="max-w-[1920px] mx-auto xl:w-[85%] md:w-[92%] w-full">
            <div className="top">
              <div className="title mx-auto flex justify中心 items-center flex-col">
                <h2 className="text-[#1b1b1b] text-6xl font-extrabold">
                  APP INTRO
                </h2>
                <h3 className="text-[#f39837] text-2xl font-normal">
                  Lorem ipsum dolor, sit amet consectetur adipisicing.
                </h3>
                <p className="max-w-[600px] text-center font-light">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Laboriosam, porro blanditiis tempore rem, accusamus sed
                  quibusdam, facilis quod eum accusantium aliquid? Labore,
                  dignissimos. Molestiae mollitia esse officia beatae quas quis?
                </p>
                <button className="border text白 bg-[#f2893e] border-black mt-4 mb-8 px-6 py-2">
                  Go App
                </button>
              </div>
              <Image
                src="/images/mobile-top.png"
                alt=""
                placeholder="empty"
                loading="lazy"
                width={1000}
                height={1000}
                className="w-[950px] mx-auto"
              ></Image>
            </div>
          </div>
        </section>
      </Layout>
    </ReactLenis>
  );
}
