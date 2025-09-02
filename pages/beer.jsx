// app/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";

// ←←← 這裡換成你的 WhatsApp 號碼（國際格式、不要加 +）
const PHONE_INTL = "886939767977";

// 你的商品（可擴充多個）
const PRODUCTS = [
  { id: "beer01", name: "台灣啤酒-01", img: "/images/beer04.png" },
  // { id: "beer02", name: "金牌啤酒 500ml", img: "/images/beer02.png" },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: 選箱數, 1: 基本資料
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);

  // 基本資料
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerNote, setBuyerNote] = useState("");

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
      {/* Hero */}
      <section className="section_hero flex justify-center items-center bg-[url('/images/bg01.png')] bg-center bg-contain h-[70vh]">
        <div className="flex flex-col justify-center items-center">
          <Image
            src="/images/旗幟.png"
            alt="logo"
            className="max-w-[340px]"
            width={330}
            height={120}
          />
          <Image
            src="/images/logo04.png"
            alt="logo"
            className="max-w-[340px]"
            width={330}
            height={120}
          />
          <div className="info flex justify-center items-center">
            <Image
              src="/images/text04.png"
              alt="logo"
              className="max-w-[60px] mx-3"
              width={60}
              height={60}
            />
            <p className="text-[14px] tracking-widest">- SINCE 2022 -</p>
            <Image
              src="/images/text05.png"
              alt="logo"
              className="max-w-[60px] mx-3"
              width={60}
              height={60}
            />
          </div>
          <div className="txt font-bold mt-2">
            嚴選冷凍美食、經典台灣零食飲料
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
              <button
                onClick={() => openOrder(p)}
                className="mt-4 rounded-xl bg-green-600 text-white px-4 py-2 hover:opacity-90"
              >
                選擇並下單
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
