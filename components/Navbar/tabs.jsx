"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import { cartStore } from "@/lib/cartStore"; // ★ 新增

export const SlideTabsExample = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile 菜單開關
  const [isMenuActive, setIsMenuActive] = useState(false); // 保留
  const [isScrollingUp, setIsScrollingUp] = useState(true); // 滾動方向
  const [isBrandOpenMobile, setIsBrandOpenMobile] = useState(false); // 手機展開
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null); // 桌面目前展開中的主選單 key
  const closeTimerRef = useRef(null); // 延遲關閉計時器
  const lastScrollY = useRef(0);

  // ★ 購物車
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

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

  // 初始化 / 訂閱購物車
  useEffect(() => {
    cartStore.init();
    const unsub = cartStore.subscribe((c) => setCart([...c]));
    return unsub;
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

  const cartCount = cart.reduce((n, it) => n + (it.qty || 0), 0);

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
                          <div className="translate-y-0 mt-2 text-slate-50  skew-y-0 transition duration-500">
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
                        <div className="translate-y-0 text-base font-normal mt-2 text-slate-50 skew-y-0 transition duration-500">
                          {link.label}
                        </div>
                      </span>
                    </Link>
                  )
                )}
              </div>

              {/* Right Side */}
              <div className="w-[80%] md:w-[30%]">
                <div className="flex justify-center items-center gap-3">
                  <Link
                    href="/beer"
                    className="bg-[#9c2121] text-white border border-gray-300 rounded-[30px] px-3 py-1 text-[14px]"
                  >
                    ORDER｜線上訂購
                  </Link>
                  <div className="mx-2">線上預約/點餐</div>

                  {/* ★ 購物車按鈕 */}
                  <button
                    aria-label="cart"
                    onClick={() => setCartOpen((v) => !v)}
                    className="relative rounded-full bg-white/10 hover:bg-white/20 border border-white/20 w-10 h-10 grid place-items-center"
                  >
                    {/* 簡單購物車 icon */}
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="9" cy="20" r="1.5" />
                      <circle cx="17" cy="20" r="1.5" />
                      <path d="M3 4h2l2.6 11.3a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 2-1.7L21 8H7" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] grid place-items-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
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

            {/* ★ 下拉購物車面板（90vh，高度、從上方滑下） */}
            <AnimatePresence>
              {cartOpen && (
                <motion.section
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                  className="fixed left-0 right-0 top-0 z-[1100] bg-white text-black shadow-2xl border-b h-[90vh] max-h-[90vh]"
                >
                  {/* 頂部工具列 */}
                  <div className="flex items-center mx-auto  w-[80%] justify-between p-4 border-b">
                    <b>購物車</b>
                    <button
                      className="text-sm text-gray-500 hover:text-black"
                      onClick={() => setCartOpen(false)}
                    >
                      關閉
                    </button>
                  </div>

                  {/* 內容：可滾動區（中段） */}
                  <div className="p-4 space-y-3 w-[60%] border-gray-200 ml-[160px] overflow-y-auto h-[calc(90vh-56px-72px)]">
                    {cart.length === 0 ? (
                      <p className="text-sm text-gray-500">目前沒有商品</p>
                    ) : (
                      cart.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-3  rounded-lg p-2"
                        >
                          <img
                            src={it.img}
                            alt={it.name}
                            className=" w-[150px] object-contain bg-gray-50 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium line-clamp-2">
                              {it.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                className="w-6 h-6 border rounded"
                                onClick={() =>
                                  cartStore.setQty(
                                    it.id,
                                    Math.max(1, it.qty - 1)
                                  )
                                }
                              >
                                −
                              </button>
                              <input
                                className="w-10 text-center border rounded"
                                value={it.qty}
                                onChange={(e) =>
                                  cartStore.setQty(
                                    it.id,
                                    Math.max(
                                      1,
                                      parseInt(e.target.value || "1", 10)
                                    )
                                  )
                                }
                              />
                              <button
                                className="w-6 h-6 border rounded"
                                onClick={() =>
                                  cartStore.setQty(it.id, it.qty + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            className="text-xs text-gray-500 hover:text-red-600"
                            onClick={() => cartStore.remove(it.id)}
                          >
                            移除
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 底部操作列 */}
                  <div className="p-4 border-t">
                    <button
                      className="w-full mx-auro max-w-[100px] px-4 py-2 rounded-lg bg-black text-white py-2"
                      onClick={() => {
                        setCartOpen(false);
                        router.push("/checkout"); // 之後可接你的結帳頁
                      }}
                      disabled={cart.length === 0}
                    >
                      前往結帳（{cartCount}）
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
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
                      {[
                        { label: "有香餐飲", href: "/main01" },
                        { label: "憶點點", href: "/main02" },
                      ].map((sub) => (
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
              {[
                { key: "brand01", label: "品牌門店", href: "/brand01" },
                { key: "menu", label: "品牌菜單", href: "/menu" },
                { key: "news", label: "品牌動態", href: "/news" },
                { key: "join", label: "加盟合作", href: "/participation" },
              ].map((link) => (
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
