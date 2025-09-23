"use client";

import { useUser } from "../../components/context/UserContext";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MenuToggle from "../../components/Header/index";
import { useRouter } from "next/router";

export const SlideTabsExample = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile 菜單開關
  const [isMenuActive, setIsMenuActive] = useState(false); // 保留
  const [isScrollingUp, setIsScrollingUp] = useState(true); // 滾動方向
  const [isBrandOpenMobile, setIsBrandOpenMobile] = useState(false); // 手機展開
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null); // 桌面目前展開中的主選單 key
  const closeTimerRef = useRef(null); // 延遲關閉計時器
  const lastScrollY = useRef(0);
  const { userInfo, logout } = useUser();

  // 支援子選單
  const navLinks = [
    {
      key: "brand",
      label: "品牌門店",
      href: "#",
      subItems: [
        { label: "有香餐飲", href: "/main01" },
        { label: "憶點點", href: "/main02" },
      ],
    },
    { key: "menu", label: "品牌門店", href: "/brand01" },
    { key: "menu", label: "品牌菜單", href: "/menu" },
    { key: "news", label: "品牌動態", href: "/news" },
    { key: "join", label: "加盟合作", href: "/participation" },
  ];

  // 監聽滾動方向
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 0) return;
      if (currentY > lastScrollY.current && currentY > 50) {
        setIsScrollingUp(false); // 向下滾動
      } else {
        setIsScrollingUp(true); // 向上滾動
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 清理關閉計時器
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // 桌面：控制滑入/滑出（含 150ms 緩衝，避免抖動）
  const handleMenuEnter = (key) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDesktopMenu(key);
  };

  const handleMenuLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenDesktopMenu(null), 150);
  };

  return (
    <div className="">
      {/* ✅ 手機選單背景遮罩 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[900] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full h-full bg-white/30 backdrop-blur-md pointer-events-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Navbar：滾動時淡出/淡入 */}
      <AnimatePresence mode="wait">
        {!isMenuActive && (
          <motion.div
            key="navbar"
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: isScrollingUp ? 1 : 0,
              y: isScrollingUp ? 0 : -20,
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="fixed left-0 w-full top-0 z-[1000] !bg-[#996c2d]"
          >
            <div className="flex justify-between items-center px-5 !rounded-[8px] text-white mx-auto w-[96.5%] ">
              {/* Logo */}
              <div className="w-[30%] pl-5">
                <Link href="/">
                  <div className="w-[80px] p-2">
                    <Image
                      src="/images/logo05.png"
                      alt="ESIM Logo"
                      width={120}
                      height={40}
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop Nav（修正 hover 後不消失） */}
              <div className="hidden md:flex w-[40%] justify-center gap-6 items-center">
                {navLinks.map((link) =>
                  link.subItems ? (
                    <div
                      key={link.key}
                      className="relative"
                      onMouseEnter={() => handleMenuEnter(link.key)}
                      onMouseLeave={handleMenuLeave}
                      onFocus={() => handleMenuEnter(link.key)}
                      onBlur={handleMenuLeave}
                    >
                      {/* 觸發器 */}
                      <button
                        className="relative h-10 rounded-full bg-transparent px-4 text-neutral-950"
                        onClick={(e) => e.preventDefault()}
                        aria-haspopup="true"
                        aria-expanded={openDesktopMenu === link.key}
                      >
                        <span className="relative inline-flex overflow-hidden">
                          <div className="translate-y-0 mt-2 text-slate-50 skew-y-0 transition duration-500">
                            {link.label}
                          </div>
                        </span>
                      </button>

                      {/* 子選單：用狀態控制顯示/隱藏 */}
                      <AnimatePresence>
                        {openDesktopMenu === link.key && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="absolute left-0 mt-2 bg-[#212121] text-white rounded-lg shadow-lg overflow-hidden border border-white/10 min-w-[160px]"
                          >
                            {link.subItems.map((sub) => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className="block px-4 py-2 hover:bg-[#333]"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="relative h-10 rounded-full bg-transparent px-4 text-neutral-950"
                    >
                      <span className="relative inline-flex overflow-hidden">
                        <div className="translate-y-0 mt-2 text-slate-50 skew-y-0 transition duration-500">
                          {link.label}
                        </div>
                      </span>
                    </Link>
                  )
                )}
              </div>

              {/* Right Side */}
              <div className="w-[80%] md:w-[30%]">
                <div className="flex justify-center items-center">
                  <Link
                    href="/beer"
                    className="bg-[#9c2121] text-white border border-gray-300 rounded-[30px] px-3 py-1 text-[14px]"
                  >
                    ORDER｜線上訂購
                  </Link>

                  <div className="mx-2">線上預約/點餐</div>
                </div>
              </div>

              {/* 漢堡按鈕 */}
              <div className="w-[20%] md:hidden flex justify-end pr-3">
                <button
                  aria-label="open menu"
                  className="p-2"
                  onClick={() => setIsMenuOpen((v) => !v)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Mobile 漢堡選單內容（原本就可展開的版本） */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden px-4 pb-4 fixed top-[64px] left-0 right-0 z-[950] bg-[#db2f2f] text-white shadow-lg py-6 rounded-b-lg"
          >
            <div className="flex flex-col gap-2">
              {/* 品牌門店（可展開） */}
              <div className="border-b border-white/20 pb-2">
                <button
                  className="w-full flex items-center justify-between py-2"
                  onClick={() => setIsBrandOpenMobile((v) => !v)}
                >
                  <span>品牌門店</span>
                  <motion.span
                    animate={{ rotate: isBrandOpenMobile ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isBrandOpenMobile && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="pl-3"
                    >
                      {navLinks[0].subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="block py-2 text-sm hover:underline"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 其他主選單 */}
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="py-3 border-b border-white/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
