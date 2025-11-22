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
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Provident similique eligendi quibusdam aspernatur officia?
                    Eveniet quia quos similique nam nemo fuga, voluptatum
                    laudantium quod? Enim, nam dolorem. Cum expedita officiis
                    laborum vero deserunt dolores, labore modi aperiam voluptate
                    corporis laudantium eos itaque et totam, voluptatem ab
                    sapiente fuga pariatur quasi eius similique quia. Suscipit
                    eaque quod dicta repellendus labore aliquid ea laudantium
                    sunt? Nisi ut iste, molestiae autem, quae libero, veniam
                    esse pariatur aliquid sit delectus modi? Tenetur molestias
                    temporibus eum nostrum distinctio eveniet voluptates, quas,
                    in sed nemo ipsam.
                  </p>
                </FadeUp>
              </div>

              {/* Row 1 */}
              <div className="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-y-10 gap-x-12">
                {/* 左：文字 */}
                <div className="flex justify-center">
                  <div className="flex flex-col">
                    <FadeUp
                      delay={0.04}
                      className="tag border border-black/20 rounded-full px-3 py-1 w-[100px] flex justify-center mb-5"
                    >
                      TAG
                    </FadeUp>
                    <FadeUp delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-bold">
                        全國最大自有工廠
                      </h3>
                    </FadeUp>
                    <FadeUp delay={0.12}>
                      <p className="mt-6 max-w-[560px] leading-relaxed text-stone-800/90">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Rem illo consequatur quo quidem alias perferendis facere
                        dignissimos fugiat repudiandae dolorem mollitia tempora,
                        sapiente fuga!
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
                      TAG
                    </FadeUp>
                    <FadeUp delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-bold">
                        全國最大自有工廠
                      </h3>
                    </FadeUp>
                    <FadeUp delay={0.12}>
                      <p className="mt-6 max-w-[560px] leading-relaxed text-stone-800/90">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Rem illo consequatur quo quidem alias perferendis facere
                        dignissimos fugiat repudiandae dolorem mollitia tempora,
                        sapiente fuga!
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
                      TAG
                    </FadeUp>
                    <FadeUp delay={0.08}>
                      <h3 className="text-3xl sm:text-4xl font-bold">
                        全國最大自有工廠
                      </h3>
                    </FadeUp>
                    <FadeUp delay={0.12}>
                      <p className="mt-6 max-w-[560px] leading-relaxed text-stone-800/90">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Rem illo consequatur quo quidem alias perferendis facere
                        dignissimos fugiat repudiandae dolorem mollitia tempora,
                        sapiente fuga!
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
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    從開業到經營，讓您起步沒壓力
                  </h2>
                </FadeUp>

                <div className="mt-8 sm:mt-10 space-y-4">
                  <FadeUp delay={0.04}>
                    <p className="mx-auto max-w-prose text-[17px] font-semibold leading-tight">
                      開店資金補助讓您起步沒壓力！
                    </p>
                  </FadeUp>
                  <FadeUp delay={0.08}>
                    <p className="mx-auto max-w-prose text-[17px] font-semibold leading-tight">
                      業績獎金幫您多賺一筆
                    </p>
                  </FadeUp>
                  <FadeUp delay={0.12}>
                    <p className="mx-auto max-w-prose text-[17px] font-semibold leading-tight">
                      還有專業教育訓練，讓您穩五站穩市場
                    </p>
                  </FadeUp>
                </div>
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
                      STEP1 - 洽談諮詢
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      透過電話或線上洽談，了解品牌理念、產品特色與市場定位，總部將提供完整的加盟說明與收益分析，協助您評估投資可行性，確認加盟是否符合您的創業規劃。
                    </p>
                  </div>
                </FadeUp>

                <FadeUp delay={0.06}>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      STEP2 - 簽約合作
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      在雙方充分了解並達成共識後，簽訂正式加盟合約，確認加盟權益、費用結構與經營規範。此時您將正式成為品牌合作夥伴，享有總部的完整資源支援。
                    </p>
                  </div>
                </FadeUp>

                <FadeUp delay={0.12}>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      STEP3 - 教育訓練
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      加盟後，總部將安排專業課程，從餐點製作技術、品質控管到店務經營、顧客服務，一步步指導。無論有無餐飲經驗，都能透過系統化訓練快速掌握營運要領，建立自信。
                    </p>
                  </div>
                </FadeUp>

                <FadeUp delay={0.18}>
                  <div className="rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      STEP4 - 籌備開店
                    </h3>
                    <p className="leading-relaxed text-stone-800/90">
                      總部協助選址評估、店面設計與裝潢規劃，並提供開幕宣傳與行銷資源。從前期籌備到開幕活動，全程有專人輔導，確保您順利開業，並在營運過程中持續獲得支援與輔導。
                    </p>
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
