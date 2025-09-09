// app/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Layout from "./Layout";
import Marquee from "react-marquee-slider";
import Link from "next/link";
import Carousel from "../components/EmblaCarouselTravel/index";
import TestimonialsEmbla from "../components/TestimonialsEmbla";
import { motion } from "framer-motion";

export default function Participation() {
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

  const images = [
    "/images/desert.png",
    "/images/冰品.png",
    "/images/室內.png",
    "/images/億點點01.png",
    "/images/冰品.png",
    "/images/室內.png",
    "/images/億點點01.png",
    "/images/冰品.png",
    "/images/室內.png",
  ];

  return (
    <Layout>
      <div className="bg-[#f5f2eb] pt-[20px]">
        <section className="bg-[#921e1e]  py-[150px] h-screen relative">
          <div className="absolute z-40 right-[10%] top-1/2">
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/images/肉包.png"
                alt="main-img"
                width={2200}
                height={2200}
                className=" max-w-[400px]"
                priority
              />
            </div>
          </div>
          <div className="absolute z-40 left-[10%] bottom-0">
            <div className="flex flex-col justify-center items-center">
              <Image
                src="/images/湯匙.png"
                alt="main-img"
                width={2200}
                height={2200}
                className=" max-w-[280px]"
                priority
              />
            </div>
          </div>
          <div className=" absolute left-1/2 -translate-x-1/2 z-40 bottom-0">
            <Image
              src="/images/Generated-Image-September-05,-2025---7_10PM.png"
              alt="main-img"
              width={2200}
              height={2200}
              className=" max-w-[900px]"
              priority
            />
          </div>
        </section>
        <div className="title mt-[90px] px-6 max-w-[1920px] xl:w-[80%] md:w-[90%] w-full  mx-auto">
          <h2 className=" lg:text-[50px] text-[40px] 2xl:text-[120px] m-0  p-0  leading-none tracking-normal font-bold text-[#e52727]">
            MEMORY
          </h2>
          <p className="text-[36px] font-bold  m-0 p-0  text-[#e52727]">
            Dining Group - 億點點
          </p>
        </div>
        <div className="flex max-w-[1920px] px-6 xl:w-[80%] md:w-[90%] w-full mx-auto">
          <div className="w-[60%]">
            <div className="txt flex flex-col">
              <span className="text-[14px]"></span>
              <p className="text-[20px] text-[#e52727] font-bold mt-4">
                憶點點(Sweet Memory)
                匯聚台灣北中南美食，提供古早味甜品手工嫩豆花、仙 ...
                有香中央廚房(Old Memory<br></br>
                Kitchen)是有香餐飲集團為了嚴格控管產品製程、追求極致
              </p>
            </div>
          </div>
          <div className="w-[34%]"></div>
        </div>
        <div className="">
          <div className="relative">
            <div className="img absolute left-3  top-[-20px]  z-40 w-[100px] h-[100px]">
              <Image
                src="/images/img11.png"
                className="w-[140px] h-auto"
                width={200}
                height={200}
              />
            </div>
          </div>

          <Carousel />
        </div>
        <section className="bg-[#c91e1e] py-20 flex flex-col w-full justify-center items-center">
          <div className="flex max-w-[1920px] mx-auto w-[80%]">
            <div className="flex flex-col items-center justify-center w-full">
              <h2 className="text-white leading-none text-[100px] font-bold">
                BEER TIME
              </h2>
              <h2 className="text-white leading-none text-[70px] font-extrabold">
                啤酒批發販售
              </h2>
              <p className="text-slate-50 text-[14px] text-center w-2/3 mt-4 mb-4 leading-loose tracking-wider">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Reiciendis, optio nihil non tenetur nam saepe exercitationem
                iure, sapiente distinctio porro laboriosam mollitia fuga,
                asperiores praesentium deserunt! Voluptate ea dolores quas,
                molestiae perferendis incidunt iste, ipsam omnis, magni quos
                autem necessitatibus?
              </p>
              <button className="bg-white text-[#db2d2d]  mb-10  font-bold px-5 py-3 rounded-[30px]">
                Online Store
              </button>
            </div>
          </div>
          <div className="beer-img relative  w-[97%] mx-auto">
            <motion.div
              className="absolute right-0"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/b776692077adae3048618b7faae3cf93-Photoroom.png"
                alt="beer-img"
                placeholder="empty"
                loading="lazy"
                width={300}
                height={300}
                className=" max-w-[90px]  sm:max-w-[120px]  lg:max-w-[200px] top-[-100px]"
              />
            </motion.div>
            {/* 燈籠加上搖擺動畫 */}
            <motion.div
              className="absolute"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/b776692077adae3048618b7faae3cf93-Photoroom.png"
                alt="beer-img"
                placeholder="empty"
                loading="lazy"
                width={300}
                height={300}
                className=" max-w-[90px] sm:max-w-[120px] lg:max-w-[200px] top-[-100px]"
              />
            </motion.div>
            <Image
              src="/images/有香03.png"
              alt="beer-img"
              placeholder="empty"
              loading="lazy"
              width={2000}
              height={1000}
              className="w-full mx-auto"
            />
          </div>
        </section>

        {/* <TestimonialsEmbla images={images} title="客戶好評" /> */}
      </div>
    </Layout>
  );
}
