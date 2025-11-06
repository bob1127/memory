// components/FloatingSidebar.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
export default function FloatingSidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;

  // ❗ 完全用 inline style，避免任意 class 影響
  const wrapStyle = {
    position: "fixed",
    zIndex: 99,
    top: "80%",
    right: "14px", // ← 固定靠右 24px
    left: "auto", // ← 明確關閉 left
    transform: "translateY(-50%)", // ← 只做垂直置中
    pointerEvents: "auto",
  };

  return createPortal(
    <div style={wrapStyle} aria-label="floating-sidebar">
      <Link
        href="/beer"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <Image
          src="https://www.clipartmax.com/png/middle/66-661850_beer-icon-logo.png"
          alt="floating"
          width={100}
          height={100}
          style={{
            width: 60,
            height: 60,
            boxShadow: "0 6px 20px rgba(0,0,0,.15)",
            borderRadius: 12,
          }}
          loading="lazy"
        />
        <b>啤酒商城</b>
        {/* 再加幾顆示範按鈕 */}
        {/* <button style={{ padding: "8px 10px", borderRadius: 999, background: "#111", color: "#fff" }}>TOP</button> */}
      </Link>
    </div>,
    document.body
  );
}
