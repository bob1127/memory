// app/page.jsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Layout from "./Layout";
import ParallaxForks from "@/components/ParallaxForks";

import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

import Marquee from "react-marquee-slider";
import Link from "next/link";
import Swiper from "../components/SwiperCarousel/SwiperCardTravel";
export default function Participation() {
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

  const text = "Original Taiwan Food Flavor . Hotpot Food";
  const items = Array.from({ length: 12 }, () => text);

  // YouTube 影片設定
  const videoId = "uCE89aM_V98";
  const [muted, setMuted] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(m.matches);
      const onChange = (e) => setReduceMotion(e.matches);
      m.addEventListener?.("change", onChange);
      return () => m.removeEventListener?.("change", onChange);
    }
  }, []);

  const ytSrc = useMemo(() => {
    const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: "1",
      mute: muted ? "1" : "0",
      controls: "0",
      playsinline: "1",
      modestbranding: "1",
      rel: "0",
      loop: "1",
      playlist: videoId,
    });
    return `${base}?${params.toString()}`;
  }, [videoId, muted]);

  return (
    <Layout>
      <div className="bg-[#f5f4f0] pt-[150px]">
        <section className="section-hero  max-w-[1920px]  w-full md:w-[85%]  relative flex  mx-auto items-center justify-center overflow-hidden">
          <div className="beer absolute top-1/2 left-[50px]">
            <Image
              src="/images/beer04.png"
              alt="main-img"
              width={1200}
              height={1200}
              className="max-w-[400px] scale-75 h-auto rotate-[-40deg] object-cover"
              priority
            />
          </div>

          <div className="main-top w-full flex">
            <div className="w-[15%]">
              <Image
                src="/images/有香文字.png"
                alt="main-img"
                width={1200}
                height={1200} // 1:1
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <div className="w-[70%] border-3 border-black border-b-transparent">
              <div className="overflow-hidden aspect-[4/3] rounded-lg">
                <Image
                  src="https://images.pexels.com/photos/27135599/pexels-photo-27135599.jpeg"
                  alt="main-img"
                  width={1200}
                  height={1200} // 1:1
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>

            <div className="w-[15%]">
              {" "}
              <Image
                src="/images/台灣文字.png"
                alt="main-img"
                width={1200}
                height={1200} // 1:1
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
          {/* 你的主視覺圖片 */}
          {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30">
          <Image
            src="/images/合作加盟.png"
            alt="加盟合作-有香餐飲集團"
            width={800}
            height={1500}
            className="max-w-[600px] h-auto w-auto"
            priority
          />
        </div> */}
        </section>
        <section className="section-info h-[80vh] max-w-[1920px] w-full md:w-[85%]  relative flex   mx-auto items-center justify-center ">
          <div className=" w-0 md:w-[15%] border-t-3 border-black h-full"></div>
          <div className=" w-full px-6 md:w-[70%] relative  border-3 border-black flex justify-center items-center   h-full">
            <div className="beer absolute top-[-50%] z-50 left-[25%]">
              <Image
                src="/images/hotpot-shadow.png"
                alt="main-img"
                width={1200}
                height={1200}
                className="max-w-[600px] scale-75 h-auto  object-cover"
                priority
              />
            </div>
            <div className="txt  flex flex-col justify-center items-center">
              <h2 className="font-bold text-4xl">台灣 Ｘ 小吃 Ｘ 火鍋</h2>
              <p className="max-w-[650px] text-center leading-loose -tracking-wider mt-8">
                隨著歲月流轉，吳爺爺將這獨特的秘方傳給了吳爸爸，餐館逐步成為高雄當地人熟知的經典小館，名聲遠播。
                後來，由於吳家移民加拿大，吳家餐館停業，成為吳爺爺的心中難以釋懷的遺憾。然而，這份傳承並未因此終止。成長於加拿大的吳家長孫，自小立志成為廚師，對爺爺的好手藝念念不忘。經歷多年的學習和努力，他終於決心讓這份家族的味道重現異鄉，並在大溫地區創立了「有香餐飲集團」。
                「有香」之名源於爺爺和奶奶的名字，象徵對家族傳承的敬意與延續。我們希望，這份跨越國界的家族風味能夠溫暖每位顧客的心，讓台灣的美食文化在北美這片土地上再次閃耀，傳遞家的溫度與歸屬感。
              </p>
            </div>
          </div>
          <div className=" w-0 md:w-[15%] border-t-3 border-black h-full"></div>
        </section>
        <section className="bg-[#bb1c21] overflow-hidden">
          {/* Title Marquee */}
          <div className="title-marquee py-10">
            <Marquee velocity={5}>
              {items.map((t, i) => (
                <div
                  key={i}
                  className="px-6 text-[9vw] sm:text-5xl lg:text-[100px] text-white whitespace-nowrap"
                >
                  {t}
                </div>
              ))}
            </Marquee>
          </div>

          {/* Foods */}
          <div className="food grid grid-cols-1 lg:grid-cols-3 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-white">
            {/* 卡 1 */}
            <div className="relative flex justify-center items-center px-4 sm:px-6 py-10">
              <div className="absolute z-40 right-2 top-2 sm:right-6 sm:top-6 lg:right-[7%] lg:top-[20%]">
                <Image
                  src="/images/標籤01.png"
                  alt="title-txt"
                  width={1200}
                  height={1200}
                  className="w-14 sm:w-16 lg:max-w-[80px] mx-auto"
                  priority
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="py-6 sm:py-8">
                  <Image
                    src="/images/種類01.png"
                    alt="title-txt"
                    width={1200}
                    height={1200}
                    className="w-[60vw] max-w-[220px] sm:max-w-[260px] lg:max-w-[300px] mx-auto"
                    priority
                  />
                </div>

                <div className="w-full max-w-[530px] px-2">
                  <Image
                    src="/images/羊肉爐.png"
                    alt="main-img"
                    width={1200}
                    height={1200}
                    className="w-full h-auto mx-auto"
                    priority
                  />
                </div>

                <div className="info mt-4 text-center w-[90%] sm:w-[85%] lg:w-[80%] mx-auto tracking-wider text-slate-50 text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed sm:leading-loose">
                  以傳承四十年歷經三代的中藥材配方精心熬煮，嚐得到嚴選帶骨羊肉塊的鮮嫩，搭配當歸中藥秘方湯底，溫陽
                  補血且濃郁順口。
                </div>
              </div>
            </div>

            {/* 卡 2 */}
            <div className="relative flex justify-center items-center px-4 sm:px-6 py-10">
              <div className="absolute z-40 right-2 top-2 sm:right-6 sm:top-6 lg:right-[7%] lg:top-[20%]">
                <Image
                  src="/images/標籤01.png"
                  alt="title-txt"
                  width={1200}
                  height={1200}
                  className="w-14 sm:w-16 lg:max-w-[80px] mx-auto"
                  priority
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="py-6 sm:py-8">
                  <Image
                    src="/images/種類01.png"
                    alt="title-txt"
                    width={1200}
                    height={1200}
                    className="w-[60vw] max-w-[220px] sm:max-w-[260px] lg:max-w-[300px] mx-auto"
                    priority
                  />
                </div>

                <div className="w-full max-w-[530px] px-2">
                  <Image
                    src="/images/food01.png"
                    alt="main-img"
                    width={1200}
                    height={1200}
                    className="w-full h-auto mx-auto"
                    priority
                  />
                </div>

                <div className="info mt-4 text-center w-[90%] sm:w-[85%] lg:w-[80%] mx-auto tracking-wider text-slate-50 text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed sm:leading-loose">
                  以傳承四十年歷經三代的中藥材配方精心熬煮，嚐得到嚴選帶骨羊肉塊的鮮嫩，搭配當歸中藥秘方湯底，溫陽
                  補血且濃郁順口。
                </div>
              </div>
            </div>

            {/* 卡 3 */}
            <div className="relative flex justify-center items-center px-4 sm:px-6 py-10">
              <div className="absolute z-40 right-2 top-2 sm:right-6 sm:top-6 lg:right-[7%] lg:top-[20%]">
                <Image
                  src="/images/標籤01.png"
                  alt="title-txt"
                  width={1200}
                  height={1200}
                  className="w-14 sm:w-16 lg:max-w-[80px] mx-auto"
                  priority
                />
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="py-6 sm:py-8">
                  <Image
                    src="/images/種類01.png"
                    alt="title-txt"
                    width={1200}
                    height={1200}
                    className="w-[60vw] max-w-[220px] sm:max-w-[260px] lg:max-w-[300px] mx-auto"
                    priority
                  />
                </div>

                <div className="w-full max-w-[530px] px-2">
                  <Image
                    src="/images/desert.png"
                    alt="main-img"
                    width={1200}
                    height={1200}
                    className="w-full h-auto mx-auto"
                    priority
                  />
                </div>

                <div className="info mt-4 text-center w-[90%] sm:w-[85%] lg:w-[80%] mx-auto tracking-wider text-slate-50 text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed sm:leading-loose">
                  以傳承四十年歷經三代的中藥材配方精心熬煮，嚐得到嚴選帶骨羊肉塊的鮮嫩，搭配當歸中藥秘方湯底，溫陽
                  補血且濃郁順口。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row bg-[#092538] h-screen">
          <div className="left py-10 w-full lg:w-[25%] flex flex-col justify-center items-center border">
            <h2 className="text-5xl text-center mb-8 font-extrabold text-white">
              Discover
              <br /> Our <br />
              Barnd
            </h2>
            <button className="bg-rose-500 text-white text-xl px-4 py-1 flex justify-center items-center">
              More
            </button>
          </div>

          <div className="right w-full  h-[400px] sm:h-[550px] md:h-full lg:w-[75%] flex justify-center items-center border">
            <div className="grid grid-cols-3 relative w-full h-full gap-2 md:gap-8">
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
                            rest: {
                              x: 0,
                              y: 0,
                              rotate: 0,
                              scale: 1,
                              opacity: 1,
                            },
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
        </section>
        <section className="bg-white w-full  py-[100px] overflow-hidden">
          <div className="mb-[-20px]">
            <ParallaxForks width={2020} height={720} maxTilt={20} />
          </div>
        </section>
        <section className="flex  flex-row">
          <div className="left bg-[#ba1632] flex justify-center items-center p-10 xl:p-20 w-1/2 ">
            <div className="items flex max-w-[800px] flex-col ">
              <div className="item mt-5">
                <h2 className="text-white text-5xl font-bold mb-5">
                  Memory Dining Group Now Open For Franchising
                </h2>
                <h3 className="text-4xl font-bold text-white">
                  Our Philosophy
                </h3>
                <p className="text-gray-100">
                  In the course of 40 years of inheritance, Memory Corner has
                  experienced challenges at different stages but continues to
                  grow and thrive. At present, there are three stores, carrying
                  the owner's expectations for different aspects of Taiwanese
                  culture: the main store - to inherit the authentic Taiwanese
                  cuisine, the dessert store - to provide Taiwanese classic
                  desserts and snacks, and the central kitchen - to strictly
                  control the quality of ingredients and master the taste. We
                  also deeply hope that Memory Dining Group will continue to
                  thrive and bring the Taiwanese culture to everyone.
                </p>
              </div>
              <div className="item mt-5">
                <h3 className="text-4xl font-bold text-white">
                  Taiwanese Culture
                </h3>
                <p className="text-gray-100">
                  In addition to the authentic Taiwanese cuisine, we expect
                  every guest to see the beauty of Taiwan's traditional culture,
                  through all the relics and unique objects that has been custom
                  made and transported back to Vancouver that is showcased in
                  the restaurant. We thrive to replicate Taiwanese street
                  sceneries and temples, so that every guests can personally
                  experience and feel the beauty of Taiwan every time they
                  visit.
                </p>
              </div>
              <div className="item mt-5">
                <h3 className="text-4xl font-bold text-white">
                  Our Advantages
                </h3>
                <p className="text-gray-100">
                  Memory Dining Group has been deeply cultivated in Vancouver
                  for many years, in addition to having complete brand
                  management experience, there is also a strict screening system
                  for franchisees. We take the effectiveness of brand franchise
                  as the primary consideration, in addition to protecting the
                  commercial interests of franchised stores, we will further
                  tailor-made planning and guidance for every franchisees.
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
      </div>
    </Layout>
  );
}
