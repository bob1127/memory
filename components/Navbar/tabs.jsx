"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cartStore } from "@/lib/cartStore";

/* ------- 簡潔 Hover Flyout（靠左對齊） ------- */
function FlyoutLink({ label, href = "#", FlyoutContent }) {
  const [open, setOpen] = useState(false);
  const showFlyout = !!FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit"
    >
      <Link
        href={href}
        className="relative text-base font-medium text-black/80 hover:text-[#eda240] transition-colors"
      >
        {label}
        <span
          style={{ transform: showFlyout ? "scaleX(1)" : "scaleX(0)" }}
          className="absolute -bottom-1 left-0 right-0 h-[2px] origin-left scale-x-0 bg-white/70 transition-transform duration-300 ease-out"
        />
      </Link>

      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            /* 置中 → 靠左 */
            className="absolute left-0 top-8 z-[1200] rounded-lg border border-gray-200 bg-white text-gray-800 shadow-lg"
          >
            <div className="p-3">
              <FlyoutContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------ 二層內容（純文字連結） ------------ */
const BrandStoresContent = () => (
  <ul className="min-w-56 text-sm">
    <li>
      <Link
        href="/brand01"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        關於有香餐飲集團
      </Link>
    </li>
    <li>
      <Link
        href="/brand01"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        有香
      </Link>
    </li>
    <li>
      <Link
        href="/brand01"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        憶點點
      </Link>
    </li>
    <li>
      <Link
        href="/brand01"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        有香ㄟ灶腳
      </Link>
    </li>
  </ul>
);

const BrandMenuContent = () => (
  <ul className="min-w-56 text-sm">
    <li>
      <Link
        href="/menu"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        菜單總覽
      </Link>
    </li>
    <li>
      <Link
        href="/menu01"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        有香
      </Link>
    </li>
    <li>
      <Link
        href="/menu02"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        憶點點
      </Link>
    </li>
    <li>
      <Link
        href="/menu03"
        className="block text-base text-black rounded px-3 py-2 hover:text-white hover:bg-[#e09437]"
      >
        有香ㄟ灶腳
      </Link>
    </li>
  </ul>
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
  const [isMenuOpenMobile, setIsMenuOpenMobile] = useState(false);

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
          className="fixed left-0 top-0 z-[1000] w-full"
        >
          <div className="mx-auto w-[96.5%] mt-5 px-5 text-white">
            <div className="flex items-center">
              {/* ── 左欄：手機 Logo（桌機隱藏／作為置中用的占位） ── */}
              <div className="w-1/3 md:w-1/3">
                <div className="pl-5 md:hidden">
                  <Link href="/" aria-label="Home">
                    <div className="w-[160px] p-2">
                      <Image
                        src="/images/logo/有香餐飲集團-logo.png"
                        alt="有香餐飲集團"
                        width={180}
                        height={56}
                        priority
                      />
                    </div>
                  </Link>
                </div>
              </div>

              {/* ── 中欄：桌機主選單（置中） ── */}
              <div className="hidden md:flex w-1/3 items-center justify-center gap-8">
                <FlyoutLink
                  href="/"
                  label="品牌門店"
                  FlyoutContent={BrandStoresContent}
                />
                <FlyoutLink
                  href="/menu"
                  label="品牌菜單"
                  FlyoutContent={BrandMenuContent}
                />

                {/* 中間 Logo */}
                <Link href="/" aria-label="Home" className="pl-2">
                  <Image
                    src="/images/logo/有香餐飲集團-logo.png"
                    alt="有香餐飲集團"
                    width={150}
                    height={48}
                    priority
                    className="h-auto w-[190px]"
                  />
                </Link>

                <Link
                  href="/news"
                  className="text-base font-medium text-black/80 hover:text-[#eda240] transition-colors"
                >
                  品牌動態
                </Link>
                <Link
                  href="/participation"
                  className="text-base font-medium text-black/80 hover:text-[#eda240] transition-colors"
                >
                  加盟合作
                </Link>
              </div>

              {/* ── 右欄：線上訂購 & 購物車（靠右） ── */}
              <div className="flex w-2/3 md:w-1/3 items-center justify-end gap-3">
                <Link
                  href="/beer"
                  className="rounded-[30px] border border-white/30 bg-[#9c2121] px-3 py-1 text-[14px] text-white hover:bg-[#881b1b] transition-colors"
                >
                  ORDER｜線上訂購
                </Link>

                <button
                  aria-label="cart"
                  onClick={() => setCartOpen((v) => !v)}
                  className="relative grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 hover:bg-white/20 transition-colors"
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
                <div className="mx-auto flex w-[80%] items-center justify-between border-b p-4">
                  <b>購物車</b>
                  <button
                    className="text-sm text-gray-500 hover:text-black"
                    onClick={() => setCartOpen(false)}
                  >
                    關閉
                  </button>
                </div>

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

                <div className="border-t p-4">
                  <button
                    className="mx-auro w-full max-w-[140px] rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
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

      {/* 手機：漢堡選單內容（不變） */}
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
                        { label: "有香", href: "/main01" },
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

              <div className="mt-2 flex items-center gap-3">
                <Link
                  href="/beer"
                  className="rounded-[30px] border border-white/30 bg-[#9c2121] px-3 py-1 text-[14px] text-white hover:bg-[#881b1b] transition-colors"
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
