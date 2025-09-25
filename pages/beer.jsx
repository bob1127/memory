// app/page.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";
// ←←← 這裡換成你的 WhatsApp 號碼（國際格式、不要加 +）
const PHONE_INTL = "886939767977";

// 你的商品（可擴充多個）
const PRODUCTS = [
  { id: "beer01", name: "台灣啤酒-01", img: "/images/beer04.png" },
  // { id: "beer02", name: "金牌啤酒 500ml", img: "/images/beer02.png" },
];

// 跑馬燈素材（確保是「陣列」）
const MARQUEE_ITEMS = [
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 1",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 2",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 3",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 4",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 5",
  },
  {
    src: "https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1100x1100_ea22b01a-1894-4e50-acfc-1ec3550da288.gif",
    alt: "beer anim 6",
  },
];

// 跑馬燈在 hero 動畫開始後多久出現（毫秒）
const APPEAR_DELAY_MS = 800;

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: 選箱數, 1: 基本資料
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);

  // 基本資料
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerNote, setBuyerNote] = useState("");

  // 控制跑馬燈顯示時機（提早一點出現）
  const [showMarquee, setShowMarquee] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // 開啟彈窗
  const openOrder = (product) => {
    setSelectedProduct(product);
    setQty(1);
    setBuyerName("");
    setBuyerPhone("");
    setBuyerNote("");
    setStep(0);
    setModalOpen(true);
  };

  // 關閉彈窗
  const closeModal = () => setModalOpen(false);

  // 送出到 WhatsApp
  const submitWhatsApp = () => {
    const safeQty = Math.max(1, Number.isFinite(+qty) ? +qty : 1);
    const lines = [
      `【下單詢問】`,
      `商品：${selectedProduct?.name ?? ""}`,
      `箱數：${safeQty}`,
      `訂購人：${buyerName || "未填"}`,
      buyerPhone ? `電話：${buyerPhone}` : null,
      buyerNote ? `備註：${buyerNote}` : null,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://api.whatsapp.com/send?phone=${PHONE_INTL}&text=${text}`;
    window.open(url, "_blank");
    setModalOpen(false);
  };

  // ESC 關閉
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Layout>
      {/* 跑馬燈：進場更明顯，提前於 hero 動畫完全結束 */}
      <AnimatePresence>
        {showMarquee && (
          <motion.div
            key="marquee-wrap"
            className="pointer-events-none w-full py-6 overflow-hidden absolute z-50 left-0 top-20"
            initial={{ opacity: 0, y: 64, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ willChange: "transform, opacity, filter" }}
          >
            {/* 漸層遮罩，讓跑馬燈更立體 */}
            <div className="" />

            {/* 第一排：右→左（rtl） */}
            <Marquee velocity={28} direction="rtl" scatterRandomly={false}>
              {MARQUEE_ITEMS.map((item, idx) => (
                <div
                  key={`m1-${idx}`}
                  className="mx-6 flex items-center drop-shadow"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-[420px] object-contain"
                  />
                </div>
              ))}
            </Marquee>

            {/* 第二排：左→右（ltr） */}
            <Marquee velocity={24} direction="ltr" scatterRandomly={false}>
              {MARQUEE_ITEMS.map((item, idx) => (
                <div
                  key={`m2-${idx}`}
                  className="mx-6 flex items-center drop-shadow"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-[420px] object-contain"
                  />
                </div>
              ))}
            </Marquee>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero（兩張圖：由大到小 + 淡入） */}
      <section className="section_hero relative h-screen overflow-hidden">
        {/* Logo：先到位、縮放淡入 */}
        <motion.div
          className="absolute right-20 top-20 z-20"
          initial={{ scale: 1.5, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/logo-6.png"
            alt="logo"
            placeholder="empty"
            loading="eager"
            priority
            width={800}
            height={500}
            className="w-[200px] transform-gpu"
          />
        </motion.div>

        {/* 啤酒大圖：稍晚進場、由大到小 */}
        <motion.div
          className="absolute left-10 bottom-20 z-20"
          initial={{ scale: 1.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <Image
            src="/images/beer02.png"
            alt="beer"
            placeholder="empty"
            loading="eager"
            priority
            width={800}
            height={500}
            className="w-[700px] transform-gpu"
          />
        </motion.div>
      </section>
      <section className="section-about max-w-[1920px] mt-20 xl:w-[80%] md:w-[90%] mx-auto w-full">
        <div className="w-1/2">
          <div className="txt">
            <span className="text-[#fc9f47] text-[18px] font-noraml">
              About Beer Store
            </span>
            <h2 className="text-6xl text-[#fc9f47] font-bold">BEER STORE</h2>
            <h2 className="text-6xl text-[#fc9f47] font-bold">
              Your Story, Your Beer
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-10 mt-8">
            <div>
              <p>
                しまなみブルワリーは美しい瀬戸内の島々を臨む広島県尾道市にあるブルワリーです。オーナーブルワーの松岡風人が日本のビール文化を支えたビール職人・山田一巳さんに憧れて弟子入りし、そこからクラフトラガーにこだわって15年。
              </p>
            </div>
            <div>
              <p>
                しまなみブルワリーは美しい瀬戸内の島々を臨む広島県尾道市にあるブルワリーです。オーナーブルワーの松岡風人が日本のビール文化を支えたビール職人・山田一巳さんに憧れて弟子入りし、そこからクラフトラガーにこだわって15年。
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section-video  bg-[#189BBC] mt-20 h-[55vh] flex justify-center items-center ">
        <div className="flex flex-row    max-w-[1920px] xl:w-[80%] md:w-[90%] w-full mx-auto">
          <div className="left-txt w-[35%] flex justify-center items-center">
            <div className="flex flex-col">
              <div className="flex  items-end">
                {" "}
                <span className="text-white font-light text-5xl">STYLE</span>
                <span className="text-white font-light text-md ml-5">
                  スタイル
                </span>
                <br></br>
              </div>
              <h2 className="fonr-bold text-white text-8xl mt-10">LAGER</h2>
              <p className="max-w-[400px] tracking-widest text-[14px] text-white">
                オーナーブルワーの松岡は、マイクロブルワリーでは珍しくラガースタイルを得意としています。全世界で一番愛されているピルスナーを、確かな技術で醸します。
              </p>
            </div>
          </div>
          <div className="right-video w-[65%] relative">
            <div className="absolute z-40 top-[-200px] right-0">
              <video
                className="max-w-[700px]"
                src="https://www.pexels.com/zh-tw/download/video/2498732/"
              ></video>
            </div>
          </div>
        </div>
      </section>
      <section className="section-intro pb-20 ">
        <div className="bg-slate-100 item w-[90%] rounded-tr-3xl relative">
          <div className="flex p-20">
            <div className=" flex justify-center items-start w-1/2">
              <div className="txt-intro py-20 flex justify-center flex-col items-start ">
                <p className="text-2xl text-stone-800">
                  美味的拉格啤酒的正中間
                </p>
                <h3 className="text-5xl font-bold text-stone-900">
                  罷工皮爾斯納
                </h3>
                <div className="info flex  mt-8 items-center justify-center">
                  <div className="left flex flex-col">
                    <span>風格：比爾森啤酒</span>
                    <span>酒精：5.5%</span>
                    <span>內容量：370ml</span>
                  </div>
                  <div className="h-[70px] w-[1px] mx-5 mt-2 bg-gray-400"></div>
                  <div className="left flex flex-col">
                    <span>
                      原材料： 大麥麥芽（加拿大、德國）、啤酒花、愛爾蘭苔蘚
                    </span>
                    <span>保質期：4個月</span>
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex w-1/2 justify-center  items-center">
              <div className="absolute bottom-0">
                <div
                  className="flex
                "
                >
                  <Image
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1350x1210_v-fms_webp_346625a1-ef1c-45e9-8c29-9bba84b02ded_small.webp"
                    alt="beer"
                    placeholder="empty"
                    loading="eager"
                    priority
                    width={800}
                    height={500}
                    className="w-[450px] mr-[-300px] transform-gpu"
                  />
                  <Image
                    src="https://storage.googleapis.com/studio-design-asset-files/projects/G3qbJR3dqJ/s-1350x1210_v-fms_webp_aab1e546-a749-42e7-a54a-4a796f388ba5_small.webp"
                    alt="beer"
                    placeholder="empty"
                    loading="eager"
                    priority
                    width={800}
                    height={500}
                    className="w-[500px] transform-gpu"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 商品清單 */}
      <section className="section-content min-h-screen pb-24">
        <div className="title flex justify-center pt-20 items-center">
          <h4 className="text-[22px] font-bold">ORDER</h4>
        </div>

        <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="item flex flex-col justify-center items-center rounded-2xl border border-black/5 bg-white/50 p-4 shadow-sm"
            >
              <div className="item-info mb-2">
                <b>{p.name}</b>
              </div>
              <Image
                src={p.img}
                alt={p.name}
                className="w-[200px] h-auto"
                width={330}
                height={120}
              />

              {/* 加入購物車 */}
              <button
                onClick={() => {
                  cartStore.add({ id: p.id, name: p.name, img: p.img }, 1);
                  // 小小動畫回饋
                  const btn = document.getElementById(`btn-${p.id}`);
                  if (btn) {
                    btn.animate(
                      [
                        { transform: "scale(1)", filter: "brightness(1)" },
                        {
                          transform: "scale(1.06)",
                          filter: "brightness(1.15)",
                        },
                        { transform: "scale(1)", filter: "brightness(1)" },
                      ],
                      { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" }
                    );
                  }
                }}
                id={`btn-${p.id}`}
                className="mt-4 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90"
              >
                加入購物車
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 兩步驟下單彈窗 */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />
            {/* 內容卡片 */}
            <motion.div
              initial={{ y: 40, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative z-[101] w-[92%] max-w-[520px] rounded-2xl bg-white p-5 shadow-xl"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-green-600/10 flex items-center justify-center">
                    🛒
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-gray-500">下單商品</div>
                    <div className="font-semibold">{selectedProduct?.name}</div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-2 hover:bg-black/5"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Steps indicator */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded ${
                      step === 0 ? "bg-black text-white" : "bg-black/5"
                    }`}
                  >
                    1 選箱數
                  </span>
                  <span className="text-gray-400">→</span>
                  <span
                    className={`px-2 py-1 rounded ${
                      step === 1 ? "bg-black text-white" : "bg-black/5"
                    }`}
                  >
                    2 基本資料
                  </span>
                </div>
              </div>

              {/* Step 0：箱數 */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    請輸入需要訂購的箱數
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="rounded-xl border px-4 py-2"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, parseInt(e.target.value || "1", 10)))
                      }
                      className="w-28 rounded-xl border px-3 py-2 text-center"
                    />
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="rounded-xl border px-4 py-2"
                    >
                      +
                    </button>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setStep(1)}
                      className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90"
                    >
                      下一步
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1：基本資料 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    請填寫訂購人基本資料（*為必填）
                  </div>
                  <label className="block">
                    <span className="text-sm text-gray-600">* 訂購人姓名</span>
                    <input
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      placeholder="王小明"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">
                      聯絡電話（選填）
                    </span>
                    <input
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      placeholder="09xx-xxx-xxx"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600">備註（選填）</span>
                    <input
                      value={buyerNote}
                      onChange={(e) => setBuyerNote(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      placeholder="如：到府時間、發票抬頭、送冰塊等"
                    />
                  </label>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setStep(0)}
                      className="rounded-xl border px-4 py-2"
                    >
                      上一步
                    </button>

                    <button
                      onClick={submitWhatsApp}
                      disabled={!buyerName.trim()}
                      className={`rounded-xl px-4 py-2 text-white ${
                        buyerName.trim()
                          ? "bg-green-600 hover:opacity-90"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      確認並用 WhatsApp 傳送
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
