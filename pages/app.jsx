// app/page.jsx (或 pages/app.jsx)
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";

/* =================================================================
   1. 翻譯資料庫 (區分中英文)
   ================================================================= */
const TRANSLATIONS = {
  "zh-TW": {
    promo: {
      title: "最高享LINE POINTS 10% 回饋",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit, saepe!",
    },
    title: "輕鬆加入會員並開始集點",
    subtitle: "先掃描門店提供的會員 QR Code",
    steps: [
      {
        num: "Step-1",
        text1: "點擊 「Free Claim」",
        text2: "",
        img: "/images/app/Step1.png",
      },
      {
        num: "Step-2",
        text1: "輸入手機號碼",
        text2: "",
        img: "/images/app/Step2.png",
      },
      {
        num: "Step-3",
        text1: "輸入簡訊驗證碼",
        text2: "",
        img: "/images/app/Step3.png",
      },
      {
        num: "Step-4",
        text1: "設定會員密碼",
        text2: "",
        img: "/images/app/Step4.png",
      },
      {
        num: "Step-5",
        text1: "成功取得會員號碼",
        text2: "",
        img: "/images/app/手機app-Step--5.png",
      },
      {
        num: "Step-6",
        text1: "點擊會員卡",
        text2: "👉 出示 QR Code 給店員掃描，即可累積點數",
        img: "/images/app/Step6.png",
      },
    ],
    termsTitle: "會員注意事項",
    terms: [
      "本會員回饋計畫適用於 有香（Richmond）・憶點點・有香ㄟ灶腳 三家門市。",
      "一個會員帳號可於上述三家門市累積與使用點數。",
      "點數僅適用於原價商品，恕不與其他折扣併用。",
      "點數累積部分項目可能有所限制，詳情請以店內公告為準。",
    ],
  },
  en: {
    promo: {
      title: "Earn up to 10% LINE POINTS back",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit, saepe!",
    },
    title: "How to Join Our Membership",
    subtitle: "Scan the membership QR code provided in-store",
    steps: [
      {
        num: "Step-1",
        text1: 'Click "Free Claim"',
        text2: "",
        img: "/images/app/Step1.png",
      },
      {
        num: "Step-2",
        text1: "Enter your mobile number",
        text2: "",
        img: "/images/app/Step2.png",
      },
      {
        num: "Step-3",
        text1: "Enter the SMS verification code",
        text2: "",
        img: "/images/app/Step3.png",
      },
      {
        num: "Step-4",
        text1: "Set your password",
        text2: "",
        img: "/images/app/Step4.png",
      },
      {
        num: "Step-5",
        text1: "Your membership number is successfully created",
        text2: "",
        img: "/images/app/手機app-Step--5.png",
      },
      {
        num: "Step-6",
        text1: "Open your digital membership card",
        text2: "👉 Show the QR code to our staff to earn points",
        img: "/images/app/Step6.png",
      },
    ],
    termsTitle: "Member Terms",
    terms: [
      "Valid at Memory Corner (Richmond), Sweet Memory, and Old Memory Kitchen.",
      "Earn and redeem points across all three locations with one account.",
      "Points apply to regular-priced items only. Not valid with other offers.",
      "Some items may be excluded. See in-store details.",
    ],
  },
};

/* =================================================================
   2. 主頁面元件
   ================================================================= */
export default function AppGuidePage() {
  const router = useRouter();
  // 取得當前語系，預設為 zh-TW
  const locale = router.locale || "zh-TW";
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];

  return (
    <Layout>
      <div className="pt-[88px] bg-[#ede5d6] sm:pt-[100px] pb-10">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* 左側：促銷活動 (Sticky) */}
            <div className="w-full lg:w-[40%]">
              <div className="lg:sticky lg:top-[110px]">
                <div className="flex flex-col items-center">
                  <Image
                    src="/images/news-01.png"
                    alt={t.promo.title}
                    className="w-full max-w-[520px] lg:max-w-[400px] rounded-md"
                    width={800}
                    height={800}
                    priority
                  />
                  <div className="mt-4 flex flex-col w-full max-w-[520px] lg:max-w-[400px] gap-2 text-gray-800">
                    <b className="text-xl sm:text-2xl md:text-3xl leading-snug">
                      {t.promo.title}
                    </b>
                    <span className="text-sm sm:text-base leading-relaxed">
                      {t.promo.desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：步驟教學 */}
            <div className="w-full lg:w-[60%] text-gray-900">
              <h1 className="text-3xl text-center mt-10 sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t.title}
              </h1>
              <p className="text-center text-lg sm:text-xl md:text-2xl mt-4 font-medium text-gray-700">
                {t.subtitle}
              </p>

              <div className="steps mt-8 sm:mt-10">
                {/* 使用 map 渲染 6 個步驟，保持代碼乾淨 */}
                {t.steps.map((step, index) => (
                  <div
                    key={index}
                    className="step flex flex-col md:flex-row md:items-center border-b border-gray-300 py-8 sm:py-10"
                  >
                    <div className="w-full md:w-[40%] p-4 flex justify-center">
                      <Image
                        src={step.img}
                        alt={step.num}
                        className="w-full max-w-[400px] h-auto object-contain"
                        width={800}
                        height={800}
                      />
                    </div>
                    <div className="w-full md:w-[60%] p-4">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                        {step.num}
                      </h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-medium">
                        {step.text1}
                      </p>
                      {step.text2 && (
                        <p className="text-base sm:text-lg md:text-xl text-gray-700 mt-2 flex items-start">
                          {step.text2}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* 會員注意事項 */}
                <div className="mt-10 sm:mt-12 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
                    {t.termsTitle}
                  </h3>
                  <div className="space-y-4 text-base sm:text-lg text-gray-800 leading-relaxed">
                    {t.terms.map((term, index) => (
                      <div key={index} className="flex">
                        <span className="mr-2 text-[#e7a042] font-bold">•</span>
                        <p>{term}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
