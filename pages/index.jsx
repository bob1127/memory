// app/page.jsx
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import ParallaxForks from "@/components/ParallaxForks";
import Marquee from "react-marquee-slider";
import Link from "next/link";
import HomeLanding from "@/components/ProductSlider01";
import BottomVideoGallery from "../components/BottomVideoCarousel";
import Carousel from "../components/EmblaCarouselTravel/index";
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
      style={{
        ...item.final,
        rotate: `${item.rotate}deg`,
      }}
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

/** =============== Snack：袋口 → 上拋弧線 + 側向四散 → 最終位置 =============== */
function SnackPop({
  anchorRef, // 袋口錨點
  progressSpring, // 進度 0→1
  className, // 最終定位（absolute + left/top/bottom）
  imgSrc,
  imgClassName = "w-[400px]",
  width = 1000,
  height = 1000,
  initialScale = 0.45,
  finalScale = 1,
  z = 40,
  burst = 220, // ↑ 拋多高（px）
  scatterX = 0, // ↔ 側向散開（px，負=左、正=右）
  spin = 0, // 旋轉角度（deg）
}) {
  const itemRef = useRef(null);
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

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    const t = setTimeout(measure, 100);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  // 基礎：袋口位移 → 原位
  const baseX = useTransform(progressSpring, (p) =>
    ready ? delta.x * (1 - p) : 0
  );
  const baseY = useTransform(progressSpring, (p) =>
    ready ? delta.y * (1 - p) : 0
  );

  // 四散弧線：中段達峰值，再回到 0
  const sideX = useTransform(progressSpring, [0, 0.45, 1], [0, scatterX, 0]);
  const arcY = useTransform(progressSpring, [0, 0.35, 1], [0, -burst, 0]);
  const rot = useTransform(progressSpring, [0, 0.5, 1], [0, spin, 0]);

  // 合成
  const xCombined = useTransform([baseX, sideX], ([bx, sx]) => bx + sx);
  const yCombined = useTransform([baseY, arcY], ([by, ay]) => by + ay);

  // 彈簧平滑
  const xSpring = useSpring(xCombined, {
    stiffness: 260,
    damping: 22,
    mass: 0.8,
  });
  const ySpring = useSpring(yCombined, {
    stiffness: 260,
    damping: 22,
    mass: 0.8,
  });
  const sc = useTransform(progressSpring, [0, 1], [initialScale, finalScale]);
  const sSpring = useSpring(sc, { stiffness: 240, damping: 20, mass: 0.25 });
  const oSpring = useTransform(progressSpring, [0, 0.05, 1], [0, 1, 1]);

  return (
    <motion.div
      ref={itemRef}
      className={`absolute pointer-events-none ${className}`}
      style={{
        x: xSpring,
        y: ySpring,
        scale: sSpring,
        opacity: oSpring,
        rotate: rot,
        zIndex: z,
        willChange: "transform, opacity",
      }}
    >
      <Image
        src={imgSrc}
        alt="snack"
        width={width}
        height={height}
        loading="lazy"
        className={imgClassName}
        draggable={false}
      />
    </motion.div>
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

  // Dinging 區塊：scroll progress
  const dingingRef = useRef(null);
  const anchorRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: dingingRef,
    offset: ["start 80%", "end 25%"], // 進出更果斷一點
  });
  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    mass: 0.8,
  });

  return (
    <Layout>
      <HomeLanding />
      <section className="section_hero h-screen flex relative overflow-hidden">
        {/* 左半邊 */}
        <div className="left bg-[#ba1632] overflow-hidden  bg-[url('https://image.memorycorner8.com/DAV02145.jpg')] bg-cover bg-center bg-no-repeat relative w-1/2 h-full">
          <div className="mask w-full h-full bg-black/20 z-20 top-0 left-0 "></div>
          <motion.div
            className="lamp absolute left-[-5%] top-[0%] -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ y: "-40vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 11,
              mass: 1.2,
              delay: 0.5,
            }}
          >
            <Image
              src="/images/lamp.png"
              alt="lamp"
              placeholder="empty"
              loading="lazy"
              width={1300}
              height={1300}
              className="w-[450px] h-auto"
            />
          </motion.div>
        </div>

        {/* 右半邊 */}
        <div
          ref={rightRef}
          className="right bg-[#092538] w-1/2 h-full relative overflow-hidden"
        >
          {/* 霧氣 */}
          <div className="steam-wrap pointer-events-none w-screen absolute left-0 bottom-0 z-40">
            <img
              src="https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog2.png"
              alt="fog"
              className="steam fog-l1"
            />
            <img
              src="https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog2.png"
              alt="fog"
              className="steam fog-l2"
            />
            <img
              src="https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog2.png"
              alt="fog"
              className="steam fog-l3"
            />
          </div>

          {/* 火鍋圖層 */}
          <div className="hotpot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="relative w-[600px] h-[600px]">
              <Image
                src="/images/cd6ca35d0819a7759029f682a81ac350.png"
                alt="hotpot"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="hotpot absolute left-[20%] top-[70%] -translate-x-1/2 -translate-y-1/2 z-30">
            <Image
              src="/images/desert.png"
              alt="hotpot"
              placeholder="empty"
              loading="lazy"
              width={900}
              height={900}
              className="w-[320px]"
            />
          </div>
          <div className="hotpot absolute left-[30%] top-[30%] -translate-x-1/2 -translate-y-1/2 z-30">
            <Image
              src="/images/food01.png"
              alt="hotpot"
              placeholder="empty"
              loading="lazy"
              width={900}
              height={900}
              className="w-[320px]"
            />
          </div>

          {/* 中央 hotpot：滑入 + 滾動旋轉 */}
          <motion.div
            className="hotpot absolute left-1/2 w-[500px] top-[18%] -translate-x-1/2 -translate-y-1/2 z-[51]"
            initial={{ x: "60vw", opacity: 0 }}
            animate={{ x: -230, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 24 }}
            style={{ rotate: hotpotRotate }}
          >
            <Image
              src="/images/hotpot.png"
              alt="hotpot"
              placeholder="empty"
              loading="lazy"
              width={1200}
              height={1200}
              className="!w-[800px]"
            />
          </motion.div>

          {/* 小料彈出 */}
          {vgItems.map((it, i) => (
            <VgPop key={it.src} containerRef={rightRef} item={it} index={i} />
          ))}
        </div>
      </section>

      <style jsx global>{`
        .steam-wrap {
          width: 100%;
          height: 110vh;
          -webkit-mask-image: radial-gradient(
            70% 60% at 50% 80%,
            #000 70%,
            rgba(0, 0, 0, 0) 100%
          );
          mask-image: radial-gradient(
            70% 60% at 50% 80%,
            #000 70%,
            rgba(0, 0, 0, 0) 100%
          );
          overflow: hidden;
        }
        .steam {
          position: absolute;
          left: 50%;
          top: 60%;
          transform: translateX(-50%) translateY(0) scale(2) rotate(-6deg);
          width: 800px;
          height: 800px;
          object-fit: cover;
          opacity: 0.55;
          filter: blur(1px) contrast(105%) brightness(110%);
          mix-blend-mode: screen;
          will-change: transform, opacity;
          pointer-events: none;
        }
        @keyframes steamUpSlow {
          0% {
            transform: translateX(-50%) translateY(0) scale(2) rotate(-6deg);
            opacity: 0.35;
          }
          10% {
            opacity: 0.55;
          }
          50% {
            transform: translateX(-50%) translateY(-55%) scale(2.08)
              rotate(-5deg);
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(-50%) translateY(-110%) scale(2.15)
              rotate(-4deg);
            opacity: 0;
          }
        }
        @keyframes steamUpMid {
          0% {
            transform: translateX(-50%) translateY(0) scale(2) rotate(4deg);
            opacity: 0.45;
          }
          15% {
            opacity: 0.65;
          }
          50% {
            transform: translateX(-50%) translateY(-60%) scale(2.1) rotate(6deg);
          }
          85% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(-50%) translateY(-115%) scale(2.18)
              rotate(8deg);
            opacity: 0;
          }
        }
        @keyframes steamUpFast {
          0% {
            transform: translateX(-50%) translateY(0) scale(2) rotate(-2deg);
            opacity: 0.5;
          }
          20% {
            opacity: 0.75;
          }
          50% {
            transform: translateX(-50%) translateY(-65%) scale(2.12)
              rotate(0deg);
          }
          90% {
            opacity: 0.55;
          }
          100% {
            transform: translateX(-50%) translateY(-120%) scale(2.22)
              rotate(2deg);
            opacity: 0;
          }
        }
        .fog-l1 {
          animation: steamUpSlow 9.5s ease-in-out infinite;
          opacity: 0.45;
        }
        .fog-l2 {
          animation: steamUpMid 7.8s ease-in-out infinite;
          opacity: 0.55;
          transform: translateX(-50%) translateY(0) scale(2.1) rotate(5deg);
          animation-delay: 2.2s;
        }
        .fog-l3 {
          animation: steamUpFast 6.4s ease-in-out infinite;
          opacity: 0.65;
          transform: translateX(-50%) translateY(0) scale(2.15) rotate(-2deg);
          animation-delay: 1.1s;
        }
        .hotpot img {
          will-change: transform;
        }
      `}</style>

      <section className="flex  py-20 flex-col relative overflow-hidden h-screen">
        <div className="flex justify-center  xl:w-[85%] md:w-[90%] w-full  px-5 mx-auto max-w-[1920px] ">
          <div className="w-1/2  flex justify-center pr-10 items-center">
            <div className="left-content flex flex-col">
              <div className="top-button flex">
                <button
                  onClick={() => setActiveTab("youshang")}
                  className={`text-[16px] mx-2 border px-4 py-2 transition-colors ${
                    activeTab === "youshang" ? "bg-[#dd1f1f] text-white" : ""
                  }`}
                >
                  有香餐飲
                </button>
                <button
                  onClick={() => setActiveTab("yi")}
                  className={`text-[16px] mx-2 border px-4 py-2 transition-colors ${
                    activeTab === "yi" ? "bg-[#dd1f1f] text-white" : ""
                  }`}
                >
                  憶點點
                </button>
              </div>

              <div className="brand-description h-[160px] mt-5 text-[20px] ml-2">
                <AnimatePresence mode="wait">
                  {activeTab === "youshang" && (
                    <motion.div
                      key="youshang"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div>
                        有香餐飲 Lorem ipsum, dolor sit amet consectetur
                        adipisicing elit. Deleniti molestias laboriosam quod
                        molestiae consequuntur quas porro suscipit temporibus
                        culpa repellat sunt tenetur
                      </div>
                      <span className="text-[14px] font-light leading-relaxed mt-5 tracking-wider block">
                        Lorem, ipsum dolor sit amet consectetur adipisicing
                        elit. Recusandae nisi maiores perferendis itaque animi
                        magnam ratione suscipit?
                      </span>
                    </motion.div>
                  )}

                  {activeTab === "yi" && (
                    <motion.div
                      key="yi"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div>
                        憶點點 Lorem ipsum dolor sit amet consectetur
                        adipisicing elit. Quibusdam officia dolorum dignissimos
                        minus reprehenderit sequi doloribus expedita.
                      </div>
                      <span className="text-[14px] font-light leading-relaxed mt-5 tracking-wider block">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Quos suscipit dolorum tenetur quaerat.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="color relative w-[95%] mt-10 mx-auto h-full bg-[#dd1f1f] p-[90px]">
                <div className="circle bg-[#dd1f1f] text-white flex justify-center items-center border-2 w-[80px] h-[80px] rounded-full absolute left-[-25px] top-[-25px] border-white">
                  起源
                </div>
                <ul>
                  <li className="text-gray-300 mt-5">
                    1. Lorem ipsum dolor sit amet
                  </li>
                  <li className="text-gray-300 mt-5">
                    2. Lorem ipsum dolor sit amet
                  </li>
                  <li className="text-gray-300 mt-5">
                    3. Lorem ipsum dolor sit amet
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="w-1/2 flex justify-center items-center">
            <Carousel />
          </div>
        </div>
      </section>

      <section className="bg-[] w-full m-0  ">
        <div className="flex  justify-center items-center">
          <div className="left  !w-1/2 bg-[#e49929]   relative   h-[90vh]  flex justify-center items-center ">
            <div className="absolute  left-[-40px] top-[40px]">LOAH</div>
            <div className="flex  p-20  flex-col">
              <h2 className="text-5xl text-gray-800 font-bold">
                Blue Sky Drink
              </h2>
              <p className="text-[16px] mt-5 leading-loose tracking-wider">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero
                hic dolorum officia ducimus quos molestiae consequuntur
                voluptatibus! Fugit eaque, neque facilis alias ducimus corrupti
                esse eos, quod voluptate consequuntur explicabo distinctio
                architecto.
              </p>
              <button className="border-black font-bold bg-white  w-full mt-5  sm:w-[120px] px-3 py-2 text-stone-800  border-1">
                More
              </button>
            </div>
          </div>
          <div className="right w-1/2  overflow-hidden  bg-[url('/images/有香03.png')] bg-center bg-cover  bg-no-repeat  h-[90vh]"></div>
        </div>
      </section>

      {/* ======= 你的 Snack 區塊：四散更高 + 左右回正 ======= */}
      <section ref={dingingRef} className="section_Dinging bg-[#ebe5df] py-20">
        <div className="flex justify-center">
          <div className="left w-1/2 overflow-hidden min-h-screen  relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0">
              <Image
                src="/images/snack/buynow.png"
                width={500}
                height={300}
                className="w-[320px]"
              ></Image>
            </div>
            {/* 袋口錨點：可微調 bottom 來對準袋口 */}
            <div
              ref={anchorRef}
              className="absolute left-1/2 -translate-x-1/2 bottom-[16%] w-[8px] h-[8px]"
            />

            {/* 四個 Snack：提高 burst、調整 scatterX 與 final left-% */}
            <SnackPop
              anchorRef={anchorRef}
              progressSpring={progressSpring}
              className="w-[80%] bottom-[0%] -translate-x-1/2 left-[35%] z-40"
              imgSrc="/images/snack/6_edafda29-95a5-4756-8bc2-d57c4392d920.png-Photoroom.png"
              imgClassName="w-[400px]"
              burst={440}
              scatterX={-220}
              spin={-14}
            />
            <SnackPop
              anchorRef={anchorRef}
              progressSpring={progressSpring}
              className="w-[80%] bottom-[2%] -translate-x-1/2 left-[42%] z-40"
              imgSrc="/images/snack/APPLE-CHIPS-SUP-Front_2000x.png-Photoroom.png"
              imgClassName="w-[400px]"
              burst={520}
              scatterX={+80}
              spin={+12}
            />
            <SnackPop
              anchorRef={anchorRef}
              progressSpring={progressSpring}
              className="w-[80%] bottom-[12%] -translate-x-1/2 left-[30%] z-40"
              imgSrc="/images/snack/png-clipart-chocolate-bar-biscuit-product-snack-cacao-tree-sandwich-biscuits-food-chocolate-bar-Photoroom.png"
              imgClassName="w-[400px]"
              burst={480}
              scatterX={-160}
              spin={+18}
            />
            <SnackPop
              anchorRef={anchorRef}
              progressSpring={progressSpring}
              className="w-[80%] bottom-[10%] -translate-x-1/2 left-[58%] z-40"
              imgSrc="/images/snack/jalapeño p product-Photoroom.png"
              imgClassName="w-[400px]"
              initialScale={0.4}
              burst={500}
              scatterX={+140}
              spin={-20}
            />

            {/* 中間大塑膠袋 */}
            <div className="absolute w-[80%] bottom-[-35%] z-40 -translate-x-1/2 left-1/2 ">
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

          <div className="right w-1/2 flex  justify-center items-center">
            <div className="flex flex-col">
              <h2 className="font-normal   text-[#ff3c3c]  text-6xl">
                Dinging Memory
              </h2>
              <div className="mt-10">
                <p className="text-[#ff3c3c] font-bold text-xl tracking-wider ">
                  Lorem dolor sit amet consectetur
                </p>
              </div>
              <div>
                <ul>
                  <li className="mt-5 font-normal ">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
                    eveniet.
                  </li>
                  <li className="mt-5 font-normal ">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
                    eveniet.
                  </li>
                  <li className="mt-5 font-normal ">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
                    eveniet.
                  </li>
                  <li className="mt-5 font-normal ">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
                    eveniet.
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
      {/* ======= /Snack 區塊 ======= */}

      <section className="section_brand_story relative py-20">
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
            <div className="txt text-xl  tracking-wider">
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
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium
            obcaecati quis esse id sed ex minima nam incidunt mollitia
            perferendis?
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
      <section className="section_video py-20">
        <BottomVideoGallery
          items={[
            // ⚠️ 建議換成「可直播 MP4」＋ poster 圖
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
              // 你的主卡過場：直接切到對應 slide
              goTo(item.toIndex);
            } else {
              handleNext();
            }
          }}
        />
      </section>
      <section className="section_app_operation py-20">
        <div className="max-w-[1920px]  mx-auto xl:w-[85%] md:w-[92%] w-full">
          <div className="top">
            <div className="title mx-auto flex justify-center items-center flex-col">
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
              <button className="border text-white bg-[#f2893e] border-black mt-4 mb-8 px-6 py-2">
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
          <div className="bottom max-w-[1920px]  lg:flex-row flex-col xl:w-[85%] md:w-[95%] w-full mx-auto  flex">
            <div className="left flex flex-col justify-center items-center w-full lg:w-1/2">
              <div className="flex flex-col justify-center  items-center lg:items-start">
                {" "}
                <div className="flex flex-col items-center lg:items-start">
                  <span>DOWNLOAD APP NOW</span>
                  <h2 className="text-5xl font-bold text-stone-800">
                    ABOUT APP
                  </h2>
                </div>
                <ul className="py-8 max-w-[600px]">
                  <b className="text-[#f38642] text-xl">。STEP01</b>
                  <li className="text-[14px]">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ab
                    sed numquam reprehenderit commodi sunt dolores vero
                    molestiae est? Error, nisi? Lorem, ipsum dolor sit amet
                    consectetur adipisicing elit. Ab sed numquam reprehenderit
                    commodi sunt dolores vero molestiae est? Error, nisi?
                  </li>
                  <br></br>
                  <b className="text-[#f38642] text-xl mt-4">。STEP02</b>
                  <li className="text-[14px]">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ab
                    sed numquam reprehenderit commodi sunt dolores vero
                  </li>
                  <br></br>
                  <b className="text-[#f38642] text-xl mt-4">。STEP03</b>
                  <li className="text-[14px]">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ab
                    sed numquam reprehenderit commodi sunt dolores vero
                    consectetur adipisicing elit. Ab sed numquam reprehenderit
                    commodi sunt dolores vero molestiae est? Error, nisi?
                  </li>
                </ul>
              </div>
            </div>
            <div className="right w-full lg:w-1/2">
              <Image
                src="/images/mobile.png"
                alt=""
                placeholder="empty"
                loading="lazy"
                width={1000}
                height={1000}
                className="w-[450px] mx-auto"
              ></Image>
            </div>
          </div>
        </div>
      </section>
      {/* 
      <section className="bg-white  py-[100px] overflow-hidden">
        <div className="mb-[-20px]">
          <ParallaxForks width={2020} height={720} maxTilt={20} />
        </div>
      </section> */}

      {/* 
      <section className="flex  flex-row">
        <div className="left bg-[#ba1632] flex justify-center items-center p-10 xl:p-20 w-1/2 ">
          <div className="items flex max-w-[800px] flex-col ">
            <div className="item mt-5">
              <h2 className="text-white text-5xl font-bold mb-5">
                Memory Dining Group Now Open For Franchising
              </h2>
              <h3 className="text-4xl font-bold text-white">Our Philosophy</h3>
              <p className="text-gray-100">
                In the course of 40 years of inheritance, Memory Corner has
                experienced challenges at different stages but continues to grow
                and thrive. At present, there are three stores, carrying the
                owner's expectations for different aspects of Taiwanese culture:
                the main store - to inherit the authentic Taiwanese cuisine, the
                dessert store - to provide Taiwanese classic desserts and
                snacks, and the central kitchen - to strictly control the
                quality of ingredients and master the taste. We also deeply hope
                that Memory Dining Group will continue to thrive and bring the
                Taiwanese culture to everyone.
              </p>
            </div>
            <div className="item mt-5">
              <h3 className="text-4xl font-bold text-white">
                Taiwanese Culture
              </h3>
              <p className="text-gray-100">
                In addition to the authentic Taiwanese cuisine, we expect every
                guest to see the beauty of Taiwan's traditional culture, through
                all the relics and unique objects that has been custom made and
                transported back to Vancouver that is showcased in the
                restaurant. We thrive to replicate Taiwanese street sceneries
                and temples, so that every guests can personally experience and
                feel the beauty of Taiwan every time they visit.
              </p>
            </div>
            <div className="item mt-5">
              <h3 className="text-4xl font-bold text-white">Our Advantages</h3>
              <p className="text-gray-100">
                Memory Dining Group has been deeply cultivated in Vancouver for
                many years, in addition to having complete brand management
                experience, there is also a strict screening system for
                franchisees. We take the effectiveness of brand franchise as the
                primary consideration, in addition to protecting the commercial
                interests of franchised stores, we will further tailor-made
                planning and guidance for every franchisees.
              </p>
            </div>
          </div>
        </div>
        <div className="right relative w-1/2 aspect-square overflow-hidden">
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt="slideshow"
              fill
              sizes="50vw"
              className={`absolute inset-0 object-cover will-change-auto
          transition-opacity duration-[3000ms] ease-[cubic-bezier(0.45,0,0.1,1)]
          ${i === index ? "opacity-100" : "opacity-0"}`}
              priority={i === 0}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-row bg-[#092538] h-screen">
        <div className="left w-[25%] flex flex-col justify-center items-center border">
          <h2 className="text-5xl text-center mb-8 font-extrabold text-white">
            Discover
            <br /> Our <br />
            Barnd
          </h2>
          <button className="bg-rose-500 text-white text-xl px-4 py-1 flex justify-center items-center">
            More
          </button>
        </div>

        <div className="right w-[75%] flex justify中心 items-center border">
          <div className="grid grid-cols-3 relative w-full h-full gap-8">
          
            <div className="relative">
              <motion.div
                initial={{ height: "0%" }}
                whileInView={{ height: "80%" }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 1, ease: [0.22, 0.8, 0.2, 1] }}
                className="brand rounded-tr-full rounded-tl-full absolute max-w-[380px] w-full bottom-0 bg-[#bd162f] origin-bottom overflow-visible"
              >
                <motion.div
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  className="w-full h-full relative"
                >
                  <div className="little-img w-[80%] z-10 absolute top-5 left-1/2 -translate-x-1/2">
                    <div className="relative w-full h-[320px]">
                      {(() => {
                        const items = [
                          {
                            key: "a",
                            src: "/images/vg01.png",
                            base: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                            x: -20,
                            y: -200,
                            rotate: -10,
                            delay: 0.0,
                            stiffness: 280,
                            damping: 16,
                            mass: 0.7,
                          },
                          {
                            key: "b",
                            src: "/images/vg08.png",
                            base: "absolute left-[30%] top-1/2 -translate-y-1/2",
                            x: 150,
                            y: 150,
                            rotate: 14,
                            delay: 0.18,
                            stiffness: 240,
                            damping: 18,
                            mass: 0.8,
                          },
                          {
                            key: "c",
                            src: "/images/vg05.png",
                            base: "absolute left-[20%] top-[40%]",
                            x: -120,
                            y: -180,
                            rotate: -18,
                            delay: 0.33,
                            stiffness: 320,
                            damping: 14,
                            mass: 0.65,
                          },
                        ];
                        const itemVariants = {
                          rest: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
                          hover: (c) => ({
                            x: c.x,
                            y: c.y,
                            rotate: c.rotate,
                            scale: 1.06,
                            opacity: 1,
                            transition: {
                              type: "spring",
                              stiffness: c.stiffness ?? 280,
                              damping: c.damping ?? 16,
                              mass: c.mass ?? 0.7,
                              delay: c.delay ?? 0,
                            },
                          }),
                        };
                        return items.map((cfg) => (
                          <motion.div
                            key={cfg.key}
                            className={`${cfg.base} z-20 will-change-transform`}
                            variants={itemVariants}
                            custom={cfg}
                          >
                            <Image
                              src={cfg.src}
                              alt={cfg.key}
                              width={90}
                              height={90}
                              className="w-[90px] h-[90px] block select-none pointer-events-none"
                              draggable="false"
                            />
                          </motion.div>
                        ));
                      })()}
                    </div>
                  </div>

                  <Image
                    src="/images/hotpot.png"
                    alt="hotpot"
                    width={900}
                    height={900}
                    className="w-[320px] h-[320px] absolute top-5 z-20 left-1/2 -translate-x-1/2"
                  />
                  <Image
                    src="/images/花紋01.png"
                    alt="hotpot-pattern"
                    width={900}
                    height={900}
                    className="w-full h-auto absolute bottom-0 left-1/2 -translate-x-1/2"
                  />
                  <Image
                    src="/images/text.png"
                    alt="hotpot-pattern"
                    width={900}
                    height={900}
                    className="w-[100px] h-auto absolute bottom-[50%] z-30 left-1/2 -translate-x-1/2"
                  />
                </motion.div>
              </motion.div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ height: "0%" }}
                whileInView={{ height: "80%" }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 1,
                  ease: [0.22, 0.8, 0.2, 1],
                  delay: 0.1,
                }}
                className="brand rounded-br-full rounded-bl-full absolute max-w-[380px] w-full top-0 bg-[#bd162f] origin-top overflow-hidden"
              >
                <div className="w-full h-full relative">
                  <Image
                    src="/images/hotpot.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-[320px] h-[320px] absolute bottom-5 left-1/2 -translate-x-1/2"
                  />
                  <Image
                    src="/images/花紋01.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-full h-auto absolute top-0 rotate-180 left-1/2 -translate-x-1/2"
                  />
                </div>
              </motion.div>
            </div>

          
            <div className="relative">
              <motion.div
                initial={{ height: "0%" }}
                whileInView={{ height: "80%" }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 1,
                  ease: [0.22, 0.8, 0.2, 1],
                  delay: 0.2,
                }}
                className="brand rounded-tr-full rounded-tl-full absolute max-w-[380px] w-full bottom-0 bg-[#bd162f] origin-bottom overflow-hidden"
              >
                <div className="w-full h-full relative">
                  <Image
                    src="/images/hotpot.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-[320px] h-[320px] absolute top-5 left-1/2 -translate-x-1/2"
                  />
                  <Image
                    src="/images/花紋01.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-full h-auto absolute bottom-0 left-1/2 -translate-x-1/2"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section> */}
    </Layout>
  );
}
