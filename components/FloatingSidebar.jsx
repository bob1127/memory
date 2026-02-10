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
        // 這裡使用 Tailwind class 以保持與您原本提供的彈出視窗樣式一致
        className="fixed inset-0 z-[99999] grid place-items-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalCard}
          className="relative w-full max-w-[1560px] bg-[#dcdedd] p-6 shadow-2xl overflow-y-auto max-h-[98vh] rounded-xl"
          onClick={(e) => e.stopPropagation()} // 防止點擊內容時關閉
        >
          {/* 關閉按鈕 */}
          <button
            className="absolute right-4 top-4 z-50 rounded-full bg-white/50 p-2 text-gray-700 hover:bg-white hover:text-black transition-colors"
            onClick={onClose}
          >
            ✕
          </button>

          {/* === 彈出視窗內容 === */}
          
          {/* Mobile Image */}
          <div className="w-full sm:hidden block">
            <Image
              src="/images/online-store/mobile-01.png"
              alt="Online Store Mobile"
              className="w-full"
              width={1920}
              height={600}
            />
          </div>
          
          {/* Desktop Image */}
          <div className="w-full sm:block hidden">
            <Image
              src="/images/online-store/desktop-01.png"
              alt="Online Store Desktop"
              className="w-full"
              width={1920}
              height={600}
            />
          </div>

          <div className="overflow-hidden p-2 sm:p-5">
            {/* 上排三個連結 */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mx-auto w-[90%] lg:w-[80%]">
              <Link
                href="https://h5.posking.ca/#/shop?id=598"
                className="block w-full h-full"
                target="_blank"
              >
                <Image
                  src="/images/online-store/desktop-02.png"
                  alt="Store 1"
                  className="w-full h-auto duration-300 scale-100 hover:scale-105"
                  width={600}
                  height={400}
                />
              </Link>
              <Link
                href="https://h5.posking.ca/#/shop?id=598"
                className="block w-full h-full"
                target="_blank"
              >
                <Image
                  src="/images/online-store/desktop-03.png"
                  alt="Store 2"
                  className="w-full h-auto duration-300 scale-100 hover:scale-105"
                  width={600}
                  height={400}
                />
              </Link>
              <Link
                href="https://h5.posking.ca/#/shop?id=598"
                className="block w-full h-full"
                target="_blank"
              >
                <Image
                  src="/images/online-store/desktop-04.png"
                  alt="Store 3"
                  className="w-full h-auto duration-300 scale-100 hover:scale-105"
                  width={600}
                  height={400}
                />
              </Link>
            </div>

            {/* 下方大圖連結 */}
            <div className="mt-4 mx-auto w-[90%] lg:w-[80%]">
              <Link
                href="https://h5.posking.ca/#/shop?id=598"
                className="block w-full h-full"
                target="_blank"
              >
                <Image
                  src="/images/online-store/desktop-07.png"
                  alt="Store Large"
                  className="w-full h-auto duration-300 scale-100 hover:scale-105"
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
          <div key={index} style={{ display: 'contents' }}>
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
    document.body
  );
}