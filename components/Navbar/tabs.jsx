"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import { cartStore } from "@/lib/cartStore";

/* ---------------- Flyout（參考你的示例） ---------------- */
function FlyoutLink({ children, href = "#", FlyoutContent }) {
  const [open, setOpen] = useState(false);
  const showFlyout = !!FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit"
    >
      <Link href={href} className="relative  text-white">
        {children}
        <span
          style={{ transform: showFlyout ? "scaleX(1)" : "scaleX(0)" }}
          className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full  transition-transform duration-300 ease-out"
        />
      </Link>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 z-[1200] bg-[#ffffff] rounded-xl text-black  shadow-xl"
          >
            {/* 防止游標從觸發器滑到面板時抖動 */}
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#ffffff]" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------ 二層內容（依網站地圖示例，可自行調整連結） ------------ */
const BrandStoresContent = () => (
  <div className="w-72 bg-[#9b1d1d]  p-6">
    <h3 className="font-semibold mb-3 text-white">品牌門店</h3>
    <Link
      href="/brand01"
      className="block text-sm py-1 text-white hover:underline"
    >
      有香餐飲
    </Link>
    <Link
      href="/brand01"
      className="block text-sm py-1 text-white hover:underline"
    >
      憶點點
    </Link>
    <Link
      href="/brand01"
      className="block text-sm py-1 text-white hover:underline"
    >
      有香ㄟ灶腳
    </Link>
  </div>
);

const BrandMenuContent = () => (
  <div className="w-72 bg-[#9b1d1d] border-white border p-6">
    <Link href="/menu" className="font-semibold mb-5  text-base text-white">
      品牌菜單-總覽
    </Link>
    <Link
      href="/menu01"
      className="block text-sm py-1 text-white hover:underline"
    >
      有香 菜單
    </Link>
    <Link
      href="/menu02"
      className="block text-sm py-1 text-white hover:underline"
    >
      憶點點 菜單
    </Link>
    <Link
      href="/menu03"
      className="block text-sm py-1 text-white hover:underline"
    >
      有香ㄟ灶腳 菜單
    </Link>
  </div>
);

export const SlideTabsExample = () => {
  const router = useRouter();

  // 滾動顯示/隱藏
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current && y > 50) setIsScrollingUp(false);
      else setIsScrollingUp(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 手機選單
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandOpenMobile, setIsBrandOpenMobile] = useState(false);
  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false); // 品牌菜單 手風琴

  // 購物車
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    cartStore.init();
    const unsub = cartStore.subscribe((c) => setCart([...c]));
    return unsub;
  }, []);
  const cartCount = cart.reduce((n, it) => n + (it.qty || 0), 0);

  return (
    <div className="">
      {/* 背景遮罩（手機菜單用） */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[900] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full h-full bg-black/30 backdrop-blur-sm pointer-events-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <AnimatePresence mode="wait">
        <motion.nav
          key="navbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: isScrollingUp ? 1 : 0,
            y: isScrollingUp ? 0 : -20,
          }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="fixed left-0 top-0 z-[1000] w-full "
        >
          <div className="mx-auto w-[96.5%] flex items-center justify-between px-5 text-white">
            {/* Logo */}
            <div className="w-[30%] pl-5">
              <Link href="/" aria-label="Home">
                <div className="w-[180px] p-2">
                  <Image
                    src="/images/logo/有香餐飲集團-logo.png"
                    alt="有香餐飲集團"
                    width={200}
                    height={60}
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop 主選單（Hover 二層） */}
            <div className="hidden md:flex w-[40%]  items-center justify-center gap-8">
              <FlyoutLink
                href="/brand"
                className=""
                FlyoutContent={BrandStoresContent}
              >
                <img
                  src="/images/navbar-品牌門店.png"
                  alt="navbar-品牌門店"
                  className="w-[100px] mt-2"
                />
              </FlyoutLink>

              <FlyoutLink href="/menu" FlyoutContent={BrandMenuContent}>
                <img
                  src="/images/navbar-品牌菜單.png"
                  alt="navbar-品牌菜單"
                  className="w-[100px] mt-2"
                />
              </FlyoutLink>

              <Link href="/news" className="relative text-white">
                <img
                  src="/images/navbar-品牌動態.png"
                  alt="navbar-品牌動態"
                  className="w-[100px] mt-2"
                />
              </Link>

              <Link href="/participation" className="relative text-white">
                <img
                  src="/images/navbar-加盟合作.png"
                  alt="navbar-加盟合作"
                  className="w-[100px] mt-2"
                />
              </Link>
            </div>

            {/* 右側：保留的 ORDER｜購物車 */}
            <div className="w-[80%] md:w-[30%]">
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/beer"
                  className="rounded-[30px] border border-white/30 bg-[#9c2121] px-3 py-1 text-[14px] text-white"
                >
                  ORDER｜線上訂購
                </Link>

                {/* 購物車按鈕 */}
                <button
                  aria-label="cart"
                  onClick={() => setCartOpen((v) => !v)}
                  className="relative grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30  hover:bg-white/20"
                >
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
                    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[11px] text-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* 漢堡（手機） */}
                <div className="md:hidden pl-1">
                  <button
                    aria-label="open menu"
                    className="p-2"
                    onClick={() => setIsMenuOpen((v) => !v)}
                  >
                    {isMenuOpen ? <X /> : <Menu />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 購物車下拉 Panel（保留） */}
          <AnimatePresence>
            {cartOpen && (
              <motion.section
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                className="fixed left-0 right-0 top-0 z-[1100] h-[90vh] max-h-[90vh] border-b bg-white text-black shadow-2xl"
              >
                {/* 頂部 */}
                <div className="mx-auto flex w-[80%] items-center justify-between border-b p-4">
                  <b>購物車</b>
                  <button
                    className="text-sm text-gray-500 hover:text-black"
                    onClick={() => setCartOpen(false)}
                  >
                    關閉
                  </button>
                </div>

                {/* 內容 */}
                <div className="ml-[160px] h-[calc(90vh-56px-72px)] w-[60%] overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <p className="text-sm text-gray-500">目前沒有商品</p>
                  ) : (
                    cart.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 rounded-lg p-2"
                      >
                        <img
                          src={it.img}
                          alt={it.name}
                          className="w-[150px] rounded bg-gray-50 object-contain"
                        />
                        <div className="flex-1">
                          <div className="line-clamp-2 text-sm font-medium">
                            {it.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              className="h-6 w-6 rounded border"
                              onClick={() =>
                                cartStore.setQty(it.id, Math.max(1, it.qty - 1))
                              }
                            >
                              −
                            </button>
                            <input
                              className="w-10 rounded border text-center"
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
                              className="h-6 w-6 rounded border"
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

                {/* 底部 */}
                <div className="border-t p-4">
                  <button
                    className="mx-auro w-full max-w-[140px] rounded-lg bg-black px-4 py-2 text-white"
                    onClick={() => {
                      setCartOpen(false);
                      router.push("/checkout");
                    }}
                    disabled={cart.length === 0}
                  >
                    前往結帳（{cartCount}）
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.nav>
      </AnimatePresence>

      {/* 手機：漢堡選單內容（含二層手風琴） */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="fixed left-0 right-0 top-[64px] z-[950] overflow-hidden rounded-b-lg bg-[#db2f2f] px-4 pb-4 text-white shadow-lg"
          >
            <div className="flex flex-col gap-2 py-6">
              {/* 品牌門店（手風琴） */}
              <div className="border-b border-white/20 pb-2">
                <button
                  className="flex w-full items-center justify-between py-2"
                  onClick={() => setIsBrandOpenMobile((v) => !v)}
                >
                  <span className="!text-base">品牌門店</span>
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
                        { label: "有香ㄟ灶腳", href: "/main03" },
                      ].map((sub) => (
                        <Link
                          key={sub.href}
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

              {/* 品牌菜單（手風琴） */}
              <div className="border-b border-white/20 pb-2">
                <button
                  className="flex w-full items-center justify-between py-2"
                  onClick={() => setIsMenuOpenMobile((v) => !v)}
                >
                  <span>品牌菜單</span>
                  <motion.span
                    animate={{ rotate: isMenuOpenMobile ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isMenuOpenMobile && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="pl-3"
                    >
                      {[
                        { label: "有香 菜單", href: "/menu/youxiang" },
                        { label: "憶點點 菜單", href: "/menu/yidiandian" },
                        { label: "有香ㄟ灶腳 菜單", href: "/menu/zhao-jiao" },
                      ].map((sub) => (
                        <Link
                          key={sub.href}
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
                { label: "品牌動態", href: "/news" },
                { label: "加盟合作", href: "/participation" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-white/20 py-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* 保留：ORDER｜購物車（手機內也可快速進入） */}
              <div className="mt-2 flex items-center gap-3">
                <Link
                  href="/beer"
                  className="rounded-[30px] border border-white/30 bg-[#9c2121] px-3 py-1 text-[14px] text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ORDER｜線上訂購
                </Link>
                <button
                  className="rounded-[30px] border border-white/30 px-3 py-1 text-[14px]"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCartOpen(true);
                  }}
                >
                  開啟購物車（{cartCount}）
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideTabsExample;
