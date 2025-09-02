// app/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Layout from "./Layout";
import Marquee from "react-marquee-slider";
import Link from "next/link";
import Swiper from "../components/SwiperCarousel/SwiperCardTravel";
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

  return (
    <Layout>
      <div className="bg-[#f5f4f0] pt-[150px]">
        <section className="section-hero  max-w-[1920px] w-[85%]  relative flex  mx-auto items-center justify-center overflow-hidden">
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

        <section className="section-info h-[80vh] max-w-[1920px] w-[85%]  relative flex   mx-auto items-center justify-center ">
          <div className="w-[15%] border-t-3 border-black h-full"></div>
          <div className="w-[70%] relative  border-3 border-black flex justify-center items-center   h-full">
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
          <div className="w-[15%] border-t-3 border-black h-full"></div>
        </section>
        <section className="bg-[#bb1c21]">
          <div className="title-marquee">
            {" "}
            <div className=" pt-[90px]">
              <Marquee velocity={5}>
                {items.map((t, i) => (
                  <div
                    key={i}
                    className="px-8 !text-[100px] text-white py-10 sm:text-base whitespace-nowrap"
                  >
                    {t}
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
          <div className="food  grid grid-cols-3">
            <div className="border-t-2 border-b-2 border-white pb-8 flex justify-center relative items-center ">
              <div className="absolute z-40 right-[7%] top-[20%]">
                {" "}
                <Image
                  src="/images/標籤01.png"
                  alt="title-txt"
                  width={1200}
                  height={1200}
                  className=" max-w-[80px] mx-auto  "
                  priority
                />
              </div>
              <div className="flex flex-col items-center justify-center ">
                <div className="titile py-8">
                  <Image
                    src="/images/種類01.png"
                    alt="title-txt"
                    width={1200}
                    height={1200}
                    className=" max-w-[300px] mx-auto  "
                    priority
                  />
                </div>
                <div className="max-w-[530px]">
                  {" "}
                  <Image
                    src="/images/hotpot.png"
                    alt="main-img"
                    width={1200}
                    height={1200}
                    className=" w-full mx-auto  "
                    priority
                  />
                </div>
                <div className="info text-center max-w-[500px] leading-loose tracking-wider text-slate-50  text-[16px]">
                  以傳承四十年歷經三代的中藥材配方精心熬煮，嚐得到嚴選帶骨羊肉塊的鮮嫩，搭配當歸中藥秘方湯底，溫陽
                  補血且濃郁順口。
                </div>
              </div>
            </div>
            <div className="border-2 border-white relative">
              <div className="absolute z-40 right-[7%] top-[20%]">
                {" "}
                <Image
                  src="/images/標籤01.png"
                  alt="title-txt"
                  width={1200}
                  height={1200}
                  className=" max-w-[80px] mx-auto  "
                  priority
                />
              </div>{" "}
              <div className="flex flex-col items-center justify-center ">
                <div className="titile py-8">
                  <Image
                    src="/images/種類01.png"
                    alt="title-txt"
                    width={1200}
                    height={1200}
                    className=" max-w-[300px] mx-auto  "
                    priority
                  />
                </div>
                <div className="max-w-[530px]">
                  {" "}
                  <Image
                    src="/images/food01.png"
                    alt="main-img"
                    width={1200}
                    height={1200}
                    className=" w-full mx-auto  "
                    priority
                  />
                </div>
                <div className="info text-center max-w-[500px] leading-loose tracking-wider text-slate-50  text-[16px]">
                  以傳承四十年歷經三代的中藥材配方精心熬煮，嚐得到嚴選帶骨羊肉塊的鮮嫩，搭配當歸中藥秘方湯底，溫陽
                  補血且濃郁順口。
                </div>
              </div>
            </div>
            <div className="border-t-2 border-b-2 relative border-white">
              <div className="absolute z-40 right-[7%] top-[20%]">
                {" "}
                <Image
                  src="/images/標籤01.png"
                  alt="title-txt"
                  width={1200}
                  height={1200}
                  className=" max-w-[80px] mx-auto  "
                  priority
                />
              </div>{" "}
              <div className="flex flex-col items-center justify-center ">
                <div className="titile py-8">
                  <Image
                    src="/images/種類01.png"
                    alt="title-txt"
                    width={1200}
                    height={1200}
                    className=" max-w-[300px] mx-auto  "
                    priority
                  />
                </div>
                <div className="max-w-[530px]">
                  {" "}
                  <Image
                    src="/images/desert.png"
                    alt="main-img"
                    width={1200}
                    height={1200}
                    className=" w-full mx-auto  "
                    priority
                  />
                </div>
                <div className="info text-center max-w-[500px] leading-loose tracking-wider text-slate-50  text-[16px]">
                  以傳承四十年歷經三代的中藥材配方精心熬煮，嚐得到嚴選帶骨羊肉塊的鮮嫩，搭配當歸中藥秘方湯底，溫陽
                  補血且濃郁順口。
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
