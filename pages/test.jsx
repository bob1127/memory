// app/page.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import dynamic from "next/dynamic";

const MinimalPushOverlayMenu = dynamic(
  () => import("@/components/MinimalPushOverlayMenu"),
  { ssr: false } // GSAP/DOM 動畫僅在瀏覽器執行
);
export default function Home() {
  return (
    <>
      <MinimalPushOverlayMenu />
    </>
  );
}
