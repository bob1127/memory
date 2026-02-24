// components/FloatingSidebar.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
// ❗ 1. 引入動畫庫 (請確保專案有安裝 framer-motion)
import { AnimatePresence, motion } from "framer-motion";

/* =================== 動畫設定 =================== */
const modalFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const modalCard = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.97 },
};

/* =================== 彈出視窗元件 (OrderPopup) =================== */
function OrderPopup({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalFade}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-[99999] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalCard}
          className="relative w-full max-w-[1200px] bg-[#dcdedd] p-0 shadow-2xl overflow-y-auto max-h-[98vh] rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()} // 防止點擊內容時關閉
        >
          {/* 關閉按鈕 */}
          <button
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/70 transition-colors backdrop-blur-md"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* === 彈出視窗內容 === */}

          {/* 頂部 Banner (保留原有的 Mobile/Desktop 圖片) */}
          <div className="w-full sm:hidden block">
            <Image
              src="/images/online-store/mobile-01.png"
              alt="Online Store Mobile"
              className="w-full h-auto object-cover"
              width={1920}
              height={600}
            />
          </div>
          <div className="w-full sm:block hidden">
            <Image
              src="/images/online-store/desktop-01.png"
              alt="Online Store Desktop"
              className="w-full h-auto object-cover max-h-[300px]"
              width={1920}
              height={600}
            />
          </div>

          <div className="p-4 sm:p-6 md:p-10 bg-[#dcdedd]">
            {/* =========================================
                上排三個分店連結區塊 (圖片 + 下方文字時間) 
                ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mx-auto w-full max-w-5xl mb-8">
              {/* Store 1: Memory Corner (Richmond) */}
              <div className="flex flex-col items-center">
                <Link
                  href="https://h5.posking.ca/#/shop?id=598"
                  className="block w-full hover:-translate-y-2 transition-transform duration-300 "
                  target="_blank"
                >
                  <Image
                    src="/images/online-store/desktop-02.png"
                    alt="Memory Corner Richmond"
                    className="w-full h-auto"
                    width={600}
                    height={400}
                  />
                </Link>
                {/* 文字營業時間 */}
                <div className="mt-3 text-center text-gray-800 font-bold leading-snug">
                  <p className="text-[13px] sm:text-[14px]">
                    Sun to Thu 11:30 AM – 9:15 PM
                  </p>
                  <p className="text-[13px] sm:text-[14px]">
                    Fri & Sat 11:30 AM – 10:15 PM
                  </p>
                </div>
              </div>

              {/* Store 2: Memory Corner (Coquitlam) */}
              <div className="flex flex-col items-center">
                <Link
                  href="https://h5.posking.ca/#/shop?id=598"
                  className="block w-full hover:-translate-y-2 transition-transform duration-300 "
                  target="_blank"
                >
                  <Image
                    src="/images/online-store/desktop-03.png"
                    alt="Memory Corner Coquitlam"
                    className="w-full h-auto"
                    width={600}
                    height={400}
                  />
                </Link>
                {/* 文字營業時間 */}
                <div className="mt-3 text-center text-gray-800 font-bold leading-snug">
                  <p className="text-[13px] sm:text-[14px]">
                    Daily 11:30 AM – 10:30 PM
                  </p>
                </div>
              </div>

              {/* Store 3: Sweet Memory */}
              <div className="flex flex-col items-center">
                <Link
                  href="https://h5.posking.ca/#/shop?id=598"
                  className="block w-full hover:-translate-y-2 transition-transform duration-300 "
                  target="_blank"
                >
                  <Image
                    src="/images/online-store/desktop-04.png"
                    alt="Sweet Memory"
                    className="w-full h-auto"
                    width={600}
                    height={400}
                  />
                </Link>
                {/* 文字營業時間 */}
                <div className="mt-3 text-center text-gray-800 font-bold leading-snug">
                  <p className="text-[13px] sm:text-[14px]">
                    Daily 11:30 AM – 12:00 AM
                  </p>
                </div>
              </div>
            </div>

            {/* =========================================
                下方大圖連結 (In-store pickup 說明)
                ========================================= */}
            <div className="mx-auto w-full max-w-5xl hover:opacity-90 transition-opacity duration-300">
              <Link
                href="https://h5.posking.ca/#/shop?id=598"
                className="block w-full h-full   rounded-xl overflow-hidden"
                target="_blank"
              >
                <Image
                  src="/images/online-store/desktop-07.png"
                  alt="Store Large"
                  className="w-full h-auto object-cover"
                  width={1920}
                  height={600}
                />
              </Link>
            </div>
          </div>
          {/* === 內容結束 === */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =================== 主要 Sidebar 元件 =================== */
export default function FloatingSidebar() {
  const [mounted, setMounted] = useState(false);
  // ❗ 2. 加入控制彈出視窗的 State
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;

  // 定義按鈕資料
  const buttons = [
    {
      label: "餐廳點餐",
      src: "/images/sidebar/浮動選單-餐廳點餐.png",
      href: null, // 設為 null 代表不跳轉
      onClick: () => setShowOrderPopup(true), // ❗ 綁定開啟視窗事件
    },
    {
      label: "線上購物",
      src: "/images/sidebar/浮動選單-線上購物.png",
      href: "/groupBuy", // 其他按鈕維持連結
    },
    {
      label: "啤酒訂購",
      src: "/images/sidebar/浮動選單-啤酒訂購.png",
      href: "/beer",
    },
    {
      label: "來店自取",
      src: "/images/Store-Pickup.png",
      href: "/checkout",
    },
    {
      label: "宅配到家",
      src: "/images/Scheduled-Delivery.png",
      href: "/checkout",
    },
  ];

  // 外層容器 Style
  const wrapStyle = {
    position: "fixed",
    zIndex: 99,
    top: "70%",
    right: "14px",
    left: "auto",
    transform: "translateY(-50%)",
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "12px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  // 統一按鈕 Style (無論是 Link 還是 button 都共用)
  const itemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
  };

  const imgStyle = {
    width: 50,
    height: 50,
    objectFit: "contain",
    borderRadius: 8,
  };

  const textStyle = {
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  };

  const dividerStyle = {
    borderBottom: "1px dashed #ccc",
    width: "80%",
    alignSelf: "center",
    margin: "4px 0",
  };

  return createPortal(
    <>
      {/* Sidebar 本體 */}
      <div style={wrapStyle} aria-label="floating-sidebar">
        {buttons.map((btn, index) => (
          <div key={index} style={{ display: "contents" }}>
            {/* 判斷是連結還是按鈕 */}
            {btn.href ? (
              <Link href={btn.href} style={itemStyle}>
                <Image
                  src={btn.src}
                  alt={btn.label}
                  width={80}
                  height={80}
                  style={imgStyle}
                  loading="lazy"
                />
                <span style={textStyle}>{btn.label}</span>
              </Link>
            ) : (
              <button onClick={btn.onClick} style={itemStyle}>
                <Image
                  src={btn.src}
                  alt={btn.label}
                  width={80}
                  height={80}
                  style={imgStyle}
                  loading="lazy"
                />
                <span style={textStyle}>{btn.label}</span>
              </button>
            )}

            {/* 分隔線 */}
            {index < buttons.length - 1 && <div style={dividerStyle} />}
          </div>
        ))}
      </div>

      {/* ❗ 3. 渲染彈出視窗 */}
      <OrderPopup
        open={showOrderPopup}
        onClose={() => setShowOrderPopup(false)}
      />
    </>,
    document.body,
  );
}
