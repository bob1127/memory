// app/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Layout from "./Layout";
import Marquee from "react-marquee-slider";
import Link from "next/link";
import Swiper from "../components/SwiperCarousel/SwiperCardTravel";
export default function Participation() {
  const text =
    "熱門餐飲加盟熱烈招募中｜低門檻創業｜專業培訓｜品牌行銷支援｜攜手共創美味與財富";
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
      <section className="section-hero relative flex h-[75vh] min-h-[560px] w-full items-center justify-center bg-[#ee1d1d] overflow-hidden">
        {/* 你的主視覺圖片 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30">
          <Image
            src="/images/合作加盟.png"
            alt="加盟合作-有香餐飲集團"
            width={800}
            height={1500}
            className="max-w-[600px] h-auto w-auto"
            priority
          />
        </div>

        {/* 跑馬燈 */}
        <div className="absolute bottom-0 left-0 right-0 z-50 ">
          <Marquee velocity={15}>
            {items.map((t, i) => (
              <div
                key={i}
                className="px-8 text-sm text-white sm:text-base whitespace-nowrap"
              >
                ✨ {t}
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* 品牌故事區塊（保持原樣） */}
      <section className="mx-auto w-[85%] max-w-[1920px] py-20">
        <div className="flex flex-col gap-10 px-0 md:flex-row md:gap-6 md:px-20">
          <div className="md:w-1/2">
            <h2 className="text-[28px] text-stone-800">
              品牌故事：傳承溫度 × 家鄉味
            </h2>
            <p className="mt-4 max-w-[600px] leading-8 tracking-widest text-stone-700">
              有香餐飲集團在溫哥華已深耕多年，除了擁有完整的品牌經營經驗，針對加盟主也有嚴謹的篩選制度。我們以品牌加盟成效為首要考量，保障加盟店家的商業利益之外，也會進一步為加盟店家個別量身規劃和指導。
            </p>
          </div>
          <div className="md:w-1/2">
            {/* 影片區塊：在圖片上方 */}
            <div className="w-full ">
              {!reduceMotion ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
                  <iframe
                    key={ytSrc}
                    className="h-full w-full"
                    src={ytSrc}
                    title="加盟影片"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="eager"
                  />
                </div>
              ) : (
                <Image
                  src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                  alt="加盟影片縮圖"
                  width={800}
                  height={450}
                  className="rounded-2xl shadow-lg"
                />
              )}
              {/* 切換靜音按鈕 */}
              {!reduceMotion && (
                <button
                  onClick={() => setMuted((v) => !v)}
                  className="absolute right-2 bottom-2 z-50 rounded bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/80"
                >
                  {muted ? "🔈 Unmute" : "🔇 Mute"}
                </button>
              )}
            </div>
            {/* <div className="relative mx-auto aspect-[8/3] w-[420px] overflow-hidden rounded-2xl shadow-lg md:w-[520px]">
              <Image
                src="/images/燈籠.png"
                alt="復古燈籠"
                fill
                sizes="(max-width: 768px) 420px, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
            </div> */}
          </div>
        </div>
      </section>
      <section className="mx-auto w-[85%] max-w-[1920px] py-20">
        <div className="flex justify-center flex-col py-20">
          <div className="relative mx-auto aspect-[13/3] w-[400px] overflow-hidden">
            <Image
              src="/images/燈籠.png"
              alt="復古燈籠"
              fill
              sizes="(max-width: 400px) 400px, 400px"
              className="object-cover"
            />
          </div>
          <div className="info max-w-[600px] text-center leading-loose tracking-widest mt-8 mx-auto">
            不需要餐飲經驗，只要你認同我們的品牌理念、擁有一份創業熱情，並準備好基本資金與店面空間，其餘交給我們。從技術培訓到行銷支援，總部完整提供；低門檻、快上手，讓你輕鬆踏出第一步，快速擁有自己的餐飲事業！
          </div>
        </div>
      </section>
      <section className="mx-auto w-[85%] max-w-[1920px] py-20">
        <div className="flex justify-center items-center mb-20">
          <div className="left w-1/2 bg-[#df4a29] p-10">
            <h2 className="text-[28px] text-stone-50">我們的理念:</h2>
            <h2 className="text-[28px] text-stone-50 w-2/3">
              有香40年傳承的過程中，經歷不同階段的挑戰，並且持續的成長和茁壯。
            </h2>
            <div className="info max-w-[600px] leading-loose text-stone-50 tracking-widest mt-8 ">
              目前有香三家店面，承載著老闆對於有香不同面向的期許：總店－以傳承台灣正港美味料理，輕食店－復刻台式經典甜品和小吃，中央廚房－嚴格控管食材品質與掌握口味。我們也深切期望有香餐飲集團永續經營且穩健成長。
            </div>
          </div>
          <div className="right w-1/2">
            {" "}
            <div className="relative mx-auto aspect-[5/3] w-[500px] max-w-[550px] overflow-hidden">
              <Image
                src="/images/section3Image1.png"
                alt="有香餐飲"
                fill
                sizes="(max-width: 400px) 400px, 400px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="right w-1/2">
            {" "}
            <div className="relative mx-auto aspect-[5/3] w-[500px] max-w-[550px] overflow-hidden">
              <Image
                src="/images/section3Image1.png"
                alt="有香餐飲"
                fill
                sizes="(max-width: 400px) 400px, 400px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="left w-1/2">
            <h2 className="text-[28px] text-stone-800">我們的理念</h2>
            <div className="info max-w-[600px] leading-loose tracking-widest mt-8 ">
              有香40年傳承的過程中，經歷不同階段的挑戰，並且持續的成長和茁壯。目前有香三家店面，承載著老闆對於有香不同面向的期許：總店－以傳承台灣正港美味料理，輕食店－復刻台式經典甜品和小吃，中央廚房－嚴格控管食材品質與掌握口味。我們也深切期望有香餐飲集團永續經營且穩健成長。
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-[85%] max-w-[1920px] py-20">
        <div className="flex flex-col justify-center items-center">
          <div className="title text-center text-4xl font-bold">PROCESS</div>

          <Link
            href=""
            className="
    bg-[#fe3232] 
    text-white 
    px-6 py-2 
    font-semibold 
    border-2 border-[#b51d1d]
    shadow-[4px_4px_0_0_#b51d1d] 
    transition-all duration-200 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    hover:shadow-[6px_6px_0_0_#b51d1d]
    active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#b51d1d]
  "
          >
            立即了解
          </Link>
        </div>
        <div className="grid grid-cols-2 mt-8 gap-5">
          <div className="bg-slate-100 border border-gray-300 p-20 rounded-md">
            <h3 className="text-3xl font-bold mb-4">STEP1 - 洽談諮詢</h3>
            <p>
              透過電話或線上洽談，了解品牌理念、產品特色與市場定位，總部將提供完整的加盟說明與收益分析，協助您評估投資可行性，確認加盟是否符合您的創業規劃。
            </p>
          </div>
          <div className="bg-slate-100 border border-gray-300 p-20 rounded-md">
            <h3 className="text-3xl font-bold mb-4">STEP1 - 簽約合作</h3>
            <p>
              在雙方充分了解並達成共識後，簽訂正式加盟合約，確認加盟權益、費用結構與經營規範。此時您將正式成為品牌合作夥伴，享有總部的完整資源支援。
            </p>
          </div>
          <div className="bg-slate-100 border border-gray-300 p-20 rounded-md">
            <h3 className="text-3xl font-bold mb-4">STEP1 - 教育訓練</h3>
            <p>
              加盟後，總部將安排專業課程，從餐點製作技術、品質控管到店務經營、顧客服務，一步步指導。無論有無餐飲經驗，都能透過系統化訓練快速掌握營運要領，建立自信。
            </p>
          </div>
          <div className="bg-slate-100 border border-gray-300 p-20 rounded-md">
            <h3 className="text-3xl font-bold mb-4">STEP1 - 籌備開店</h3>
            <p>
              總部協助選址評估、店面設計與裝潢規劃，並提供開幕宣傳與行銷資源。從前期籌備到開幕活動，全程有專人輔導，確保您順利開業，並在營運過程中持續獲得支援與輔導。
            </p>
          </div>
        </div>
      </section>
      <section>{/* <Swiper /> */}</section>
    </Layout>
  );
}
