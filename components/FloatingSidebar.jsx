"use client";

import { useEffect, useState, Fragment } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
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
          onClick={(e) => e.stopPropagation()}
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

          {/* 頂部 Banner */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mx-auto w-full max-w-5xl mb-8">
              {/* Store 1 */}
              <div className="flex flex-col items-center">
                <Link
                  href="https://h5.posking.ca/#/shop?id=598"
                  className="block w-full hover:-translate-y-2 transition-transform duration-300"
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
                <div className="mt-3 text-center text-gray-800 font-bold leading-snug">
                  <p className="text-[13px] sm:text-[14px]">
                    Sun to Thu 11:30 AM – 9:15 PM
                  </p>
                  <p className="text-[13px] sm:text-[14px]">
                    Fri & Sat 11:30 AM – 10:15 PM
                  </p>
                </div>
              </div>

              {/* Store 2 */}
              <div className="flex flex-col items-center">
                <Link
                  href="https://h5.posking.ca/#/shop?id=598"
                  className="block w-full hover:-translate-y-2 transition-transform duration-300"
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
                <div className="mt-3 text-center text-gray-800 font-bold leading-snug">
                  <p className="text-[13px] sm:text-[14px]">
                    Daily 11:30 AM – 10:30 PM
                  </p>
                </div>
              </div>

              {/* Store 3 */}
              <div className="flex flex-col items-center">
                <Link
                  href="https://h5.posking.ca/#/shop?id=598"
                  className="block w-full hover:-translate-y-2 transition-transform duration-300"
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
                <div className="mt-3 text-center text-gray-800 font-bold leading-snug">
                  <p className="text-[13px] sm:text-[14px]">
                    Daily 11:30 AM – 12:00 AM
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-5xl hover:opacity-90 transition-opacity duration-300">
              <Link
                href="https://h5.posking.ca/#/shop?id=598"
                className="block w-full h-full drop-shadow-lg rounded-xl overflow-hidden"
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =================== 主要 Sidebar 元件 =================== */
export default function FloatingSidebar() {
  const [mounted, setMounted] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 監聽視窗大小，決定要不要切換為手機版
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile(); // 初次檢查
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  const buttons = [
    {
      label: "餐廳點餐",
      src: "/images/sidebar/浮動選單-餐廳點餐.png",
      href: null,
      onClick: () => setShowOrderPopup(true),
    },
    {
      label: "線上購物",
      src: "/images/sidebar/浮動選單-線上購物.png",
      href: "/groupBuy",
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

  /* ---------------- 原本最穩定的 Inline Styles ---------------- */
  // 電腦版外框
  const desktopWrapStyle = {
    position: "fixed",
    zIndex: 99,
    top: "70%",
    right: "14px",
    left: "auto", // 強制釋放左側
    transform: "translateY(-50%)",
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "12px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "85px", // 鎖定寬度
  };

  // 手機版選單外框 (展開時)
  const mobileWrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "12px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    width: "85px", // 鎖定寬度
    backdropFilter: "blur(4px)",
  };

  // 單顆按鈕與文字
  const itemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    width: "100%",
  };

  const imgStyle = {
    width: 45,
    height: 45,
    objectFit: "contain",
    borderRadius: 8,
  };

  const textStyle = {
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    lineHeight: 1.1,
    width: "100%",
  };

  const dividerStyle = {
    borderBottom: "1px dashed #ccc",
    width: "80%",
    alignSelf: "center",
    margin: "4px 0",
  };

  // 共用的按鈕渲染邏輯
  const renderMenuItems = () => (
    <>
      {buttons.map((btn, index) => (
        <Fragment key={index}>
          {btn.href ? (
            <Link
              href={btn.href}
              style={itemStyle}
              onClick={() => setIsMobileOpen(false)}
            >
              <Image
                src={btn.src}
                alt={btn.label}
                width={45}
                height={45}
                style={imgStyle}
                loading="lazy"
              />
              <span style={textStyle}>{btn.label}</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                btn.onClick();
                setIsMobileOpen(false);
              }}
              style={itemStyle}
            >
              <Image
                src={btn.src}
                alt={btn.label}
                width={45}
                height={45}
                style={imgStyle}
                loading="lazy"
              />
              <span style={textStyle}>{btn.label}</span>
            </button>
          )}

          {index < buttons.length - 1 && <div style={dividerStyle} />}
        </Fragment>
      ))}
    </>
  );

  return createPortal(
    <>
      {/* ================= 判斷：大於 768px (電腦版) ================= */}
      {!isMobile && (
        <div style={desktopWrapStyle} aria-label="floating-sidebar">
          {renderMenuItems()}
        </div>
      )}

      {/* ================= 判斷：小於 768px (手機版) ================= */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            zIndex: 99,
            right: "16px",
            bottom: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
            pointerEvents: "auto",
          }}
        >
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={mobileWrapStyle}
                className="origin-bottom-right"
              >
                {renderMenuItems()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 右下角懸浮按鈕 */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#4b2c1d",
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              border: "none",
              cursor: "pointer",
              zIndex: 50,
            }}
            aria-label="Toggle Menu"
          >
            {isMobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                style={{ width: "24px", height: "24px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                style={{ width: "28px", height: "28px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* 渲染彈出視窗 */}
      <OrderPopup
        open={showOrderPopup}
        onClose={() => setShowOrderPopup(false)}
      />
    </>,
    document.body,
  );
}
