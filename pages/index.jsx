// app/page.jsx
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import ParallaxForks from "@/components/ParallaxForks";
import Marquee from "react-marquee-slider";
import Layout from "../pages/Layout";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

/* ========== 小元件：從火鍋中心「彈出」到最終位置（無裁切、只設寬度） ========== */
function VgPop({ containerRef, item, index }) {
  const ref = useRef(null);
  const [delta, setDelta] = useState(null);

  // 量測最終位置與容器中心的位移（px）；初始用 x/y 從中心彈出
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
        ...item.final, // 最終定位（百分比）
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
        className={`${item.widthClass} h-auto block`} // 只設寬度，高度自動
        draggable="false"
        initial={{ filter: "blur(2px)" }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 0.45, delay: 1.0 + index * 0.28 }}
      />
    </motion.div>
  );
}

export default function Home() {
  // 👉 .vg01 資訊（最終位置沿用你的設定）
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

  // 右半邊容器（量測中心）
  const rightRef = useRef(null);

  // ======= 中央 hotpot.png 的滾動旋轉（超跟手的彈簧過度） =======
  // 即時角度
  const baseAngle = useMotionValue(0);
  // 顯示角度（彈簧包一層，調這裡的數值改善延遲/彈性）
  const hotpotRotate = useSpring(baseAngle, {
    stiffness: 300, // ↑ 大=更跟手
    damping: 18, // ↓ 小=彈性更多；大=穩定
    mass: 0.8, // 小=俐落
  });

  useEffect(() => {
    const stepPerWheel = 0.25; // 每單位 deltaY 轉幾度：靈敏度
    const onWheel = (e) => {
      baseAngle.set(baseAngle.get() + e.deltaY * stepPerWheel);
    };
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
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 9000); // ⏳ 每 9 秒換一張（含 3 秒漸變 + 6 秒停留）
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <Layout>
      <section className="section_hero h-screen flex relative overflow-hidden">
        {/* 左半邊 */}
        <div className="left bg-[#ba1632] relative w-1/2 h-full">
          <motion.div
            className="lamp absolute left-[-5%] top-[0%] -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ y: "-40vh", opacity: 0 }} // 從視窗上方掉下來
            animate={{ y: 0, opacity: 1 }} // 定位在原本位置
            transition={{
              type: "spring",
              stiffness: 120, // 彈簧硬度
              damping: 11, // 阻尼，數字越小彈得越明顯
              mass: 1.2, // 質量，影響彈動速度
              delay: 0.5, // 延遲一下再出現
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
          <div className="maintxt absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <Image
              src="/images/logo03.png"
              alt="hotpot"
              placeholder="empty"
              loading="lazy"
              width={900}
              height={900}
              className="w-[350px]"
            />
            <Image
              src="/images/text.png"
              alt="hotpot"
              placeholder="empty"
              loading="lazy"
              width={900}
              height={900}
              className="w-[600px]"
            />
          </div>
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

          {/* 火鍋圖層（基準點） */}
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

          {/* ✅ 正中央 hotpot.png：從視窗右側滑入，最後定位在原本中心；並隨滾動旋轉 */}
          <motion.div
            className="hotpot absolute left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 z-[51]"
            initial={{ x: "60vw", opacity: 0 }} // 從右側螢幕外
            animate={{ x: -230, opacity: 1 }} // 最終回到原本中心（x:0）
            transition={{ type: "spring", stiffness: 140, damping: 24 }}
            style={{ rotate: hotpotRotate }} // 由滾動控制旋轉（超跟手）
          >
            <Image
              src="/images/hotpot.png"
              alt="hotpot"
              placeholder="empty"
              loading="lazy"
              width={900}
              height={900}
              className="w-[800px]"
            />
          </motion.div>

          {/* ✅ vg01 圖片：從火鍋中心彈出到各自最終位置（避免被裁切、只設寬度） */}
          {vgItems.map((it, i) => (
            <VgPop key={it.src} containerRef={rightRef} item={it} index={i} />
          ))}
        </div>
      </section>

      <style jsx global>{`
        /* 霧的遮罩範圍 */
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

        /* 小優化：避免轉動時抖動 */
        .hotpot img {
          will-change: transform;
        }
      `}</style>

      <div className="bg-[url('/images/a2429bd976243f5292cb5707e36a8924.jpg')] bg-center bg-contain  relative w-screen h-32">
        <div className="absolute left-0 top-1/2 -translate-y-1/2  w-full"></div>
      </div>

      <section className="bg-[#bd162f] flex flex-col relative overflow-hidden h-screen">
        <div className="absolute left-[5%] z-50 top-20 ">
          <Image
            src="/images/logo-6.png"
            alt="hotpot"
            placeholder="empty"
            loading="lazy"
            width={900}
            height={900}
            className="w-[380px]"
            data-aos="slide-right"
          />
        </div>
        <div className="absolute left-[20%] z-50 top-20 ">
          <Image
            src="/images/logo-07.png"
            alt="hotpot"
            placeholder="empty"
            loading="lazy"
            width={900}
            height={900}
            className="w-[180px]"
            data-aos="slide-right"
          />
        </div>
        <div className="top  h-1/2 relative"></div>
        <div className="bottom flex flex-row   h-1/2 bg-[#092538] relative">
          <div className="left w-[36%]"></div>
          <div className="right w-[64%] flex justify-start items-center">
            <div className="flex  flex-col w-[80%]" data-aos="fade-up">
              <h2 className="text-white text-5xl">About Us</h2>
              <p className="text-gray-200 text-[14px] tracking-widest leading-loose">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Quisquam quaerat, vero, doloremque quasi inventore omnis
                molestiae nesciunt voluptatem consequatur esse dolores non saepe
                dolore illum labore deserunt, animi accusamus accusantium
                sapiente perferendis ab neque cupiditate. Voluptatem sequi
                temporibus consequatur dicta non ad sint fuga sit obcaecati
                placeat delectus modi, exercitationem aperiam natus culpa
                officiis optio dolore cupiditate aliquid, repellendus maxime qui
                magnam aliquam laboriosam. Neque deleniti sit quam cupiditate
                placeat iste porro totam nobis non natus sunt, officiis rerum,
                vel a? Fugit fuga temporibus sapiente. Consectetur, saepe
                possimus tempore repellendus ab, tempora suscipit veniam fuga
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white  py-[100px] overflow-hidden">
        <div className="mb-[-20px]">
          <ParallaxForks width={2020} height={720} maxTilt={20} />
        </div>
      </section>
      <section></section>

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
            Discover<br></br> Our <br></br>Barnd
          </h2>
          <button className="bg-rose-500 text-white text-xl px-4 py-1 flex justify-center items-center">
            More
          </button>
        </div>
        <div className="right w-[75%]  flex justify-center items-center border">
          <div className="grid grid-cols-3 relative w-full h-full gap-8">
            <div className="relative">
              <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="brand rounded-tr-full rounded-tl-full absolute max-w-[380px] w-full bottom-0 bg-[#bd162f] h-[80%] overflow-visible"
              >
                <div className="w-full h-full relative">
                  <div className="little-img w-[80%] z-10 absolute top-5 left-1/2 -translate-x-1/2">
                    <div className="relative w-full h-[320px]">
                      {/* 父層保持：initial="rest" whileHover="hover" animate="rest" */}
                      {(() => {
                        // 每個物件自己的「最終位移／旋轉／延遲／彈簧」設定 + 各自圖片
                        const items = [
                          {
                            key: "a",
                            src: "/images/vg01.png", // ✅ 第一張圖片
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
                            src: "/images/vg08.png", // ✅ 第二張圖片
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
                            src: "/images/vg05.png", // ✅ 第三張圖片
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
                              src={cfg.src} // ✅ 每個物件用自己的圖片
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
                </div>
              </motion.div>
            </div>
            <div className="relative">
              {" "}
              <div className="brand rounded-br-full rounded-bl-full absolute max-w-[380px] w-full top-0 bg-[#bd162f]  h-[80%]">
                {" "}
                <div className="w-full h-full relative">
                  <Image
                    src="/images/hotpot.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-[320px]  h-[320px] absolute bottom-5 left-1/2 -translate-x-1/2"
                  />
                  <Image
                    src="/images/花紋01.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-full  h-auto absolute top-0 rotate-180 left-1/2 -translate-x-1/2"
                  />
                </div>
              </div>
            </div>
            <div className="relative">
              {" "}
              <div className="brand rounded-tr-full rounded-tl-full absolute max-w-[380px] w-full bottom-0 bg-[#bd162f]  h-[80%]">
                <div className="w-full h-full relative">
                  <Image
                    src="/images/hotpot.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-[320px]  h-[320px] absolute top-5 left-1/2 -translate-x-1/2"
                  />
                  <Image
                    src="/images/花紋01.png"
                    alt="hotpot"
                    placeholder="empty"
                    loading="lazy"
                    width={900}
                    height={900}
                    className="w-full  h-auto absolute bottom-0 left-1/2 -translate-x-1/2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
