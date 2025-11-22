// app/page.jsx
"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import SplitType from "split-type";

export default function Home() {
  return (
    <Layout>
      <div className="pt-[88px] bg-[#ede5d6] sm:pt-[100px] pb-10">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left / Sticky promo */}
            <div className="w-full lg:w-[40%]">
              <div className="lg:sticky lg:top-[110px]">
                <div className="flex flex-col items-center">
                  <Image
                    src="/images/news-01.png"
                    alt="最高享LINE POINTS 10% 回饋"
                    className="w-full max-w-[520px] lg:max-w-[400px] rounded-md"
                    width={800}
                    height={800}
                    priority
                  />
                  <div className="mt-4 flex flex-col w-full max-w-[520px] lg:max-w-[400px] gap-2">
                    <b className="text-xl sm:text-2xl md:text-3xl leading-snug">
                      最高享LINE POINTS 10% 回饋
                    </b>
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Odit, saepe!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right / Steps */}
            <div className="w-full lg:w-[60%]">
              <h1 className="text-3xl text-center mt-10 sm:text-4xl md:text-5xl lg:text-6xl  font-bold leading-tight">
                How to Join Our Membership
              </h1>

              <div className="steps mt-6 sm:mt-8">
                {/* Step 1 */}
                <div className="step flex flex-col md:flex-row md:items-center border-b border-gray-200 py-6 sm:py-8">
                  <div className="w-full md:w-[40%] p-2 sm:p-4">
                    <Image
                      src="/images/app/Step1.png"
                      alt="Step 1"
                      className="w-full h-auto"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="w-full md:w-[60%] p-2 sm:p-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      Step-2
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mt-2">
                      Enter Your Cell Number
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl">
                      輸入手機號碼
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="step flex flex-col md:flex-row md:items-center border-b border-gray-200 py-6 sm:py-8">
                  <div className="w-full md:w-[40%] p-2 sm:p-4">
                    <Image
                      src="/images/app/Step2.png"
                      alt="Step 2"
                      className="w-full h-auto"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="w-full md:w-[60%] p-2 sm:p-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      Step-3
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mt-2">
                      Enter The SMS Verification Code
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl">
                      輸入簡訊驗證碼
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="step flex flex-col md:flex-row md:items-center border-b border-gray-200 py-6 sm:py-8">
                  <div className="w-full md:w-[40%] p-2 sm:p-4">
                    <Image
                      src="/images/app/Step3.png"
                      alt="Step 3"
                      className="w-full h-auto"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="w-full md:w-[60%] p-2 sm:p-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      Step-2
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mt-2">
                      Enter Your Cell Number
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl">
                      輸入手機號碼
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="step flex flex-col md:flex-row md:items-center border-b border-gray-200 py-6 sm:py-8">
                  <div className="w-full md:w-[40%] p-2 sm:p-4">
                    <Image
                      src="/images/app/Step4.png"
                      alt="Step 4"
                      className="w-full h-auto"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="w-full md:w-[60%] p-2 sm:p-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      Step-4
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mt-2">
                      Set Your Password
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl">設定密碼</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="step flex flex-col md:flex-row md:items-center border-b border-gray-200 py-6 sm:py-8">
                  <div className="w-full md:w-[40%] p-2 sm:p-4">
                    <Image
                      src="/images/app/Step5.png"
                      alt="Step 5"
                      className="w-full h-auto"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="w-full md:w-[60%] p-2 sm:p-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      Step-5
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mt-2">
                      Membership Registeration Successful
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl">
                      成功加入會員
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="step flex flex-col md:flex-row md:items-center border-b border-gray-200 py-6 sm:py-8">
                  <div className="w-full md:w-[40%] p-2 sm:p-4">
                    <Image
                      src="/images/app/Step6.png"
                      alt="Step 6"
                      className="w-full h-auto"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="w-full md:w-[60%] p-2 sm:p-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                      Step-6
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mt-2">
                      Earn Points with Every Purchase
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl">
                      消費即可累積點數
                    </p>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-4 sm:mt-6 flex flex-col bg-white p-4 sm:p-5 rounded-lg border border-gray-100">
                  <span className="text-base sm:text-lg text-gray-800">
                    Point accumulation is subject to some restrictions
                  </span>
                  <b className="text-base sm:text-lg mt-1">
                    點數累積有部分限制
                  </b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
