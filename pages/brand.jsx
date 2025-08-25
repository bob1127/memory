// app/page.jsx
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import ParallaxForks from "@/components/ParallaxForks";
import Marquee from "react-marquee-slider";
import Layout from "../pages/Layout";
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
      <section className="section_hero h-screen relative flex relative overflow-hidden">
        {/* <div className="absolute z-40 left-side bg-[#242424] left-0 top-0 h-full w-[40%]">
          <div className="w-full h-full flex justify-center items-center">
            <h1 className="text-stone-50 text-5xl">有香餐品</h1>
          </div>
        </div> */}
        <ProductSlider />
      </section>
    </Layout>
  );
}
