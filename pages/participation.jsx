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
      <div className="bg-[#f0d0ab] py-20"></div>
      <section className="section_why bg-[#f0d0ab] ">
        <div className="max-w-[1920px] mx-auto xl:w-[80%] md:w-[90%] w-full flex flex-col justify-center items-center">
          <div className="title flex flex-col justify-center items-center">
            <h1 className="text-5xl font-extrabold">為什麼選擇加盟有香？</h1>
            <p className="text-center max-w-[800px] tracking-widest mt-5">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Provident similique eligendi quibusdam aspernatur officia? Eveniet
              quia quos similique nam nemo fuga, voluptatum laudantium quod?
              Enim, nam dolorem. Cum expedita officiis laborum vero deserunt
              dolores, labore modi aperiam voluptate corporis laudantium eos
              itaque et totam, voluptatem ab sapiente fuga pariatur quasi eius
              similique quia. Suscipit eaque quod dicta repellendus labore
              aliquid ea laudantium sunt? Nisi ut iste, molestiae autem, quae
              libero, veniam esse pariatur aliquid sit delectus modi? Tenetur
              molestias temporibus eum nostrum distinctio eveniet voluptates,
              quas, in sed nemo ipsam.
            </p>
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto xl:w-[80%] md:w-[90%] w-full row flex flex-col mt-20 justify-center items-center">
          <div className="info-item-row flex justify-center items-center flex-col mt-10">
            <h2 className="text-4xl font-bold">加盟創業首選品牌</h2>
            <div className="flex w-full">
              <div className="w-1/2 flex items-center justify-center">
                <div className="flex flex-col mt-10">
                  <div className="tag border border-black px-3 py-1 w-[100px] flex justify-center mb-5">
                    TAG
                  </div>{" "}
                  <h3 className="text-4xl font-bold">全國最大自有工廠</h3>
                  <p className="max-w-[500px] mt-8">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem
                    illo consequatur quo quidem alias perferendis facere
                    dignissimos fugiat repudiandae dolorem mollitia tempora,
                    sapiente fuga!
                  </p>
                </div>
              </div>
              <div className="w-1/2 p-10">
                <img
                  src="https://new-sushism.jp/wp/wp-content/themes/sushizm/assets/images/about_img_01.jpg"
                  className="w-full"
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="info-item-row flex justify-center items-center flex-col mt-10">
            <div className="flex w-full">
              <div className="w-1/2 p-10">
                <img
                  src="https://new-sushism.jp/wp/wp-content/themes/sushizm/assets/images/about_img_01.jpg"
                  className="w-full"
                  alt=""
                />
              </div>
              <div className="w-1/2 flex items-center justify-center">
                <div className="flex flex-col mt-10">
                  <div className="tag border border-black px-3 py-1 w-[100px] flex justify-center mb-5">
                    TAG
                  </div>{" "}
                  <h3 className="text-4xl font-bold">全國最大自有工廠</h3>
                  <p className="max-w-[500px] mt-8">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem
                    illo consequatur quo quidem alias perferendis facere
                    dignissimos fugiat repudiandae dolorem mollitia tempora,
                    sapiente fuga!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="info-item-row flex justify-center items-center flex-col mt-10">
            <div className="flex w-full">
              <div className="w-1/2 flex items-center justify-center">
                <div className="flex flex-col mt-10">
                  <div className="tag border border-black px-3 py-1 w-[100px] flex justify-center mb-5">
                    TAG
                  </div>{" "}
                  <h3 className="text-4xl font-bold">全國最大自有工廠</h3>
                  <p className="max-w-[500px] mt-8">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem
                    illo consequatur quo quidem alias perferendis facere
                    dignissimos fugiat repudiandae dolorem mollitia tempora,
                    sapiente fuga!
                  </p>
                </div>
              </div>
              <div className="w-1/2 p-10">
                <img
                  src="https://new-sushism.jp/wp/wp-content/themes/sushizm/assets/images/about_img_01.jpg"
                  className="w-full"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto xl:w-[80%] md:w-[90%] mt-20 w-full flex flex-col justify-center items-center">
          <div className="title flex flex-col justify-center items-center">
            <h1 className="text-5xl font-extrabold">
              從開業到經營，讓您起步沒壓力
            </h1>
            <div className="mt-10">
              <p className="text-center max-w-[800px] text-[18px] font-bold leading-none mt-5">
                開店資金補助讓您起步沒壓力！
              </p>
              <p className="text-center max-w-[800px] text-[18px] font-bold leading-none mt-5">
                業績獎金幫您多賺一筆
              </p>
              <p className="text-center max-w-[800px] text-[18px] font-bold leading-none mt-5">
                還有專業教育訓練，讓您穩五站穩市場
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="  bg-[#f0d0ab]">
        <div className="max-w-[1920px] mx-auto xl:w-[80%] md:w-[90%] w-full row flex flex-col pt-5 justify-center items-center">
          <div className="flex flex-col justify-center items-center "></div>
          <div className="grid  grid-col-1 lg:grid-cols-2 mt-8 gap-5">
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
          <Link
            href=""
            className="
             my-5
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
      </section>
    </Layout>
  );
}
