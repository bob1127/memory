// app/page.jsx
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import ParallaxForks from "@/components/ParallaxForks";
import Marquee from "react-marquee-slider";
import Layout from "./Layout";
import ProductSlider from "@/components/ProductSlider";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

export default function Home() {
  return (
    <Layout>
      <section className="section_hero flex justify-center items-center  bg-[url('/images/bg01.png')] bg-center bg-contain h-[70vh]">
        <div className="flex flex-col justify-center items-center">
          <Image
            src="/images/旗幟.png"
            alt="logo"
            className="max-w-[340px]"
            placeholder="empty"
            loading="lazy"
            width={330}
            height={120}
          ></Image>
          <Image
            src="/images/logo04.png"
            alt="logo"
            className="max-w-[340px]"
            placeholder="empty"
            loading="lazy"
            width={330}
            height={120}
          ></Image>
          <div className="info flex justify-center items-center">
            <Image
              src="/images/text04.png"
              alt="logo"
              className="max-w-[60px] mx-3"
              placeholder="empty"
              loading="lazy"
              width={330}
              height={120}
            ></Image>
            <p className="text-[14px] tracking-widest">- SINCE 2022 -</p>
            <Image
              src="/images/text05.png"
              alt="logo"
              className="max-w-[60px] mx-3"
              placeholder="empty"
              loading="lazy"
              width={330}
              height={120}
            ></Image>
          </div>
          <div className="txt font-bold mt-2">
            嚴選冷凍美食、經典台灣零食飲料
          </div>
        </div>
      </section>
      <section className="section-content h-screen">
        <div className="title flex justify-center pt-20 items-center">
          <h4 className="text-[22px] font-bold">ORDER</h4>
        </div>
        <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-4 gap-4">
          <div className="item flex flex-col justify-center items-center">
            <div className="item-info">
              <b>台灣啤酒-01</b>
            </div>
            <Image
              src="/images/beer04.png"
              alt="logo"
              className="max-w-[200px] mx-3"
              placeholder="empty"
              loading="lazy"
              width={330}
              height={120}
            ></Image>
          </div>
        </div>
      </section>
    </Layout>
  );
}
