// app/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import Image from "next/image";
import Layout from "./Layout";
import ParallaxImage from "../components/ParallaxImage";
import { motion, useReducedMotion } from "framer-motion";

/* ========== 共用：滾動進場（大距離、超柔順） ========== */
function FadeUp({
  children,
  className = "",
  delay = 0,
  distance = 96,
  amount = 0.3,
}) {
  const prefersReduced = useReducedMotion();
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
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 1.05,
          delay,
        },
      }}
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

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
      <ReactLenis root>
        <div className="bg-[#ede5d6]">
          {/* 視覺留白 */}
          <div className=" py-14 sm:py-16 "></div>

          {/* ============ Why Section ============ */}
          <section className="section_why ">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
              {/* 標題區 */}
              <div className="flex flex-col items-center text-center">
                <FadeUp>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    為什麼選擇加盟有香？
                  </h1>
                </FadeUp>
                <FadeUp delay={0.06}>
                  <p className="mt-5 max-w-prose text-base sm:text-[17px] leading-relaxed text-stone-800/90">
                    集團擁有多年餐飲經驗，從產品研發、門市營運到行銷推廣，皆具備成熟的系統與完善資源。我們提供可複製的成功模式與完善支援，加盟主可快速上手核心營運、穩定獲利。
                  </p>
                </FadeUp>
              </div>
              <h2 className="text-[32px] mt-20 mx-auto font-bold text-center">
                {" "}
                加盟創業首選品牌
              </h2>

              {/* Row 1 */}
              <div className="mt-6 lg:mt-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-y-10 gap-x-12">
                {/* 左：文字 */}
                <div className="flex justify-center">
                  <div className="flex flex-col">
                    <FadeUp
                      delay={0.04}
                      className="tag border border-black/20 rounded-full px-3 py-1 w-[100px] flex justify-center mb-5"
                    >
                      品牌
                    </FadeUp>
                    <FadeUp delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-bold">
                        品牌統一形象
                      </h3>
                    </FadeUp>
                    <FadeUp delay={0.12}>
                      <p className="mt-6 max-w-[560px] leading-relaxed text-stone-800/90">
                        加盟店將融入有香集團品牌形象，有助於新店建立穩固的顧客忠誠度。
                      </p>
                    </FadeUp>
                  </div>
                </div>

                {/* 右：圖（Parallax） → 改為 4:3、無圓角 */}
                <FadeUp delay={0.08} amount={0.25}>
                  <div className="relative w-full aspect-[4/3] overflow-hidden shadow-sm">
                    <ParallaxImage
                      src="/images/participation/DSC06648.jpg"
                      alt=""
                    />
                  </div>
                </FadeUp>
              </div>

              {/* Row 2（大螢幕左右互換） */}
              <div className="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-y-10 gap-x-12">
                {/* 左（大螢幕放圖） → 改為 4:3、無圓角 */}
                <FadeUp
                  delay={0.06}
                  amount={0.25}
                  className="order-1 lg:order-none"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden shadow-sm">
                    <ParallaxImage
                      src="/images/participation/DSC05470.jpg"
                      alt=""
                    />
                  </div>
                </FadeUp>

                {/* 右：文字 */}
                <div className="flex justify-center order-none lg:order-1">
                  <div className="flex flex-col">
                    <FadeUp
                      delay={0.04}
                      className="tag border border-black/20 rounded-full px-3 py-1 w-[100px] flex justify-center mb-5"
                    >
                      研發
                    </FadeUp>
                    <FadeUp delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-bold">
                        研發團隊不斷創新
                      </h3>
                    </FadeUp>
                    <FadeUp delay={0.12}>
                      <p className="mt-6 max-w-[560px] leading-relaxed text-stone-800/90">
                        以傳統工法為基礎，融合創新思維，用心打造每一道能代表品牌精神的料理。
                      </p>
                    </FadeUp>
                  </div>
                </div>
              </div>

              {/* Row 3（大圖） */}
              <div className="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-y-10 gap-x-12">
                {/* 左：文字 */}
                <div className="flex justify-center">
                  <div className="flex flex-col">
                    <FadeUp
                      delay={0.04}
                      className="tag border border-black/20 rounded-full px-3 py-1 w-[100px] flex justify-center mb-5"
                    >
                      培訓
                    </FadeUp>
                    <FadeUp delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-bold">
                        專業員工培訓 與擴店經驗
                      </h3>
                    </FadeUp>
                    <FadeUp delay={0.12}>
                      <p className="mt-6 max-w-[560px] leading-relaxed text-stone-800/90">
                        提供豐富且專業的員工培訓流程，並將多年的擴店經驗完整傳授給加盟店，確保營運效率和品質。
                      </p>
                    </FadeUp>
                  </div>
                </div>

                {/* 右：滿版大圖 → 改為 4:3、無圓角 */}
                <FadeUp delay={0.08} amount={0.25}>
                  <div className="relative w-full aspect-[4/3] overflow-hidden shadow-sm">
                    <ParallaxImage
                      src="/images/participation/C0262 - frame at 0m0s.jpg"
                      alt=""
                    />
                  </div>
                </FadeUp>
              </div>

              {/* 三段標語 + 文字區 */}
              <div className="mt-20 lg:mt-24 flex flex-col items-center text-center">
                <FadeUp>
                  <h2 className="text-4xl   sm:text-5xl font-extrabold tracking-tight">
                    延續台灣正宗美食的<br></br>傳承與創新
                  </h2>
                  <h2 className="text-4xl mt-3 sm:text-5xl font-extrabold tracking-tight">
                    FAQ
                  </h2>
                </FadeUp>
              </div>
            </div>
          </section>

          {/* ============ 步驟卡片區 ============ */}
          <section className="">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-6 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
                <FadeUp>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      加盟需要花費多少錢?
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      加盟採取量身規劃的方式，例如加盟業者已有合適的硬體設備(例如:厨房冰箱、不锈钢壁面、吊掛招牌...等等)，討論和確認合過後，都可以物盡其用保留使用。
                    </p>
                    <p className="leading-relaxed text-stone-800/90">
                      下一步，我們會依據加盟店的規模，進一步討論需要補購買的用品、設備以及硬體裝潢，費用會分項進行報價。因此加盟費用會依據不同加盟業者是否已有合適的設備和營業場地大小，在費用上會有所差別。
                    </p>
                  </div>
                </FadeUp>

                <FadeUp delay={0.06}>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      是否所有食材以及調味料都需要與有香餐飲集團購買?
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      有香餐飲集團為了嚴格控管產品製程、追求口味和品質一致性，2022年成立了有香中央厨房。在合約中，會明確就明為了保障產品口味一致性，有些品质屬於加盟店必須跟有香中央廚房購買，同時，有些品項和食品則是自由開放讓加盟店選擇自行購買或向中央府房購買。
                    </p>
                  </div>
                </FadeUp>

                <FadeUp delay={0.12}>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      和中央廚房購買食材的優點?是否有專人配送?
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      有些食材在規範中必須與中央府房購買，除了確保提供的餐點品質和口味一致性，同時也能為加盟店帶來以下優點:
                    </p>
                    <ul className="mt-5">
                      <li>
                        ● 加盟店可以大大降低人員費心處理食材的時間和人力。
                      </li>
                      <li>
                        ● 中央廚房進貨量大，能幫加盟店壓低獨自進貨的成本。
                      </li>
                      <li>
                        ●
                        下單的方式:加盟店電話下單，即安排專人包貨且免費運送到門店。
                      </li>
                    </ul>
                  </div>
                </FadeUp>

                <FadeUp delay={0.18}>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      為什麼要選擇加盟有香?
                    </h3>
                    <ul>
                      <li>● 有香餐飲品牌已在溫哥華地區遠近馳名。</li>
                      <li>● 專人教育培訓。</li>
                      <li>● 專人給予店面選址的專業市場評估。</li>
                      <li>
                        ● 針對營業用硬體設備、廚房器具以及裝潢給予專業的建議。
                      </li>
                      <li>● 保障加盟店家的營業商圈。</li>
                    </ul>
                  </div>
                </FadeUp>
              </div>

              {/* CTA */}
              <FadeUp delay={0.24}>
                <div className="flex justify-center">
                  <a
                    href="/participation-form"
                    className="
                    mt-8 inline-block bg-[#fe3232] text-white px-6 py-2 font-semibold 
                    border-2 border-[#b51d1d]
                    shadow-[4px_4px_0_0_#b51d1d] 
                    transition-all duration-200 
                    hover:translate-x-[-2px] hover:translate-y-[-2px] 
                    hover:shadow-[6px_6px_0_0_#b51d1d]
                    active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#b51d1d]
                  "
                  >
                    立即了解
                  </a>
                </div>
              </FadeUp>
            </div>
          </section>
        </div>
      </ReactLenis>
    </Layout>
  );
}
