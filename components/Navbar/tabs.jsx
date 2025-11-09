// components/SlideTabsExample.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  User2,
  LogIn,
  LogOut,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/router";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";

/* -------------------- 動畫 Variants -------------------- */
const easeOut = [0.22, 1, 0.36, 1];

const fadeUp = {
  initial: { opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.22, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    filter: "blur(6px)",
    transition: { duration: 0.18, ease: easeOut },
  },
};

const modalFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalCard = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.26, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.97,
    transition: { duration: 0.18, ease: easeOut },
  },
};

const cartOverlay = modalFade;

const cartPanel = {
  initial: { x: 24, opacity: 0, scale: 0.98 },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 30 },
  },
  exit: {
    x: 24,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2, ease: easeOut },
  },
};
const listItem = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.22, ease: easeOut },
  }),
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
};

/* ======= 手機抽屜選單 Variants ======= */
const sheetOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

const sheetPanel = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: { type: "spring", stiffness: 280, damping: 32 },
  },
  exit: { x: "100%", transition: { duration: 0.22 } },
};

const accordion = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1, transition: { duration: 0.22 } },
};

/* ====== Login helpers：把使用者輸入規範化、並提供後備嘗試 ====== */
function normalizeLoginPayload({ username, password }) {
  const u = String(username || "").trim();
  const p = String(password || "");
  const payload = { password: p };

  const isEmail = /\S+@\S+\.\S+/.test(u);
  const isPhone = /^\+?\d[\d\s-]{6,}$/.test(u);

  if (isEmail) {
    payload.email = u.toLowerCase();
    payload.username = u;
  } else if (isPhone) {
    payload.phone = u.replace(/\s|-/g, "");
    payload.username = payload.phone;
  } else {
    payload.username = u;
  }
  return payload;
}

/** 先用 normalize 遞交；失敗時嘗試換鍵名再登一次 */
async function tryLoginFallback(store, raw) {
  const first = normalizeLoginPayload(raw);
  try {
    return await store.login(first);
  } catch (e1) {
    const second = { password: first.password };
    if (first.email) {
      second.username = first.email;
    } else if (first.username && first.username.includes("@")) {
      second.email = first.username.toLowerCase();
    } else if (first.phone) {
      second.username = first.phone;
    } else {
      second.username = first.username;
    }
    return store.login(second);
  }
}

/* ------------ 二層內容（桌機：純文字連結） ------------ */
const BrandStoresContent = () => (
  <ul className="min-w-56 text-sm">
    {[
      ["關於有香餐飲集團", "/main01"],
      ["有香", "/brand01"],
      ["憶點點", "/brand02"],
      ["有香ㄟ灶腳", "/brand03"],
    ].map(([t, href]) => (
      <li key={t}>
        <Link
          href={href}
          className="block text-base text-black rounded-lg px-3 py-2 hover:text-white hover:bg-[#e09437] transition-colors"
        >
          {t}
        </Link>
      </li>
    ))}
  </ul>
);

const BrandMenuContent = () => (
  <ul className="min-w-56 text-sm">
    {[
      ["菜單總覽", "/menu"],
      ["有香", "/menu01"],
      ["憶點點", "/menu02"],
      ["有香ㄟ灶腳", "/menu03"],
    ].map(([t, href]) => (
      <li key={t}>
        <Link
          href={href}
          className="block text-base text-black rounded-lg px-3 py-2 hover:bg-[#e09437] hover:text-white transition-colors"
        >
          {t}
        </Link>
      </li>
    ))}
  </ul>
);

/* ------- 簡潔 Hover Flyout（靠左對齊，桌機） ------- */
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
          className="absolute -bottom-1 left-0 right-0 h-[2px] origin-left scale-x-0 bg-black/20 transition-transform duration-300 ease-out"
        />
      </Link>

      <AnimatePresence>
        {showFlyout && (
          <motion.div
            {...fadeUp}
            className="absolute left-0 top-8 z-[1200] rounded-xl border border-black/10 bg-white/95 shadow-lg backdrop-blur-md"
          >
            <div className="p-3">{FlyoutContent && <FlyoutContent />}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== 加入購物車成功：右下角 Toast-Popup ===== */
function AddToCartPopup({ open, item, subtotal, onClose, onCheckout }) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 2800);
    return () => clearTimeout(id);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={modalCard}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-6 right-6 z-[2100] w-[min(420px,92vw)] rounded-2xl border border-black/10 bg-white/95 shadow-2xl backdrop-blur-md"
        >
          <button
            className="absolute right-3 top-3 rounded-full px-2 py-1 text-gray-500 hover:bg-black/5"
            onClick={onClose}
            aria-label="close"
          >
            ✕
          </button>
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
              <ShoppingCart size={18} /> 已加入購物車
            </div>
            {item && (
              <div className="flex items-center gap-3">
                <img
                  src={item.img}
                  alt={item.name || ""}
                  className="h-16 w-16 shrink-0 rounded-lg bg-gray-50 object-contain ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-medium">
                    {item.name || ""}
                  </div>
                  <div className="mt-1 text-xs text-black/60">
                    數量：{item.qty || 1}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  CA${" "}
                  {(
                    Number(item.price || 0) * Number(item.qty || 1)
                  ).toLocaleString()}
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-dashed border-black/10 pt-3">
              <span className="text-sm text-black/70">小計</span>
              <span className="text-lg font-bold">
                CA$ {Number(subtotal || 0).toLocaleString()}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onCheckout}
                className="rounded-xl bg-black px-4 py-2.5 text-white hover:opacity-90 active:scale-[0.99] transition"
              >
                前往結帳
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-black hover:bg-black/5 active:scale-[0.99] transition"
              >
                繼續逛逛
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ===== 線上點餐自定義 Popup ===== */
function OrderPopup({ open, onClose, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        variants={modalFade}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-[9999999999] grid place-items-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalCard}
          className="relative w-full max-w-[1560px] bg-[#dcdedd] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute right-4 top-4 text-gray-500 hover:text-black"
            onClick={onClose}
          >
            ✕
          </button>
          <div>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ===== 登入/註冊 Modal + 表單 ===== */
function AuthModal({
  open,
  mode,
  onClose,
  onSwitchMode,
  onSubmit,
  loading,
  error,
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-[2000] grid place-items-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
          }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-[420px] rounded-2xl bg-white p-5 text-black shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {mode === "login" ? "會員登入" : "會員註冊"}
            </h3>
            <button
              className="rounded-full px-2 py-1 text-gray-500 hover:bg-black/5"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <AuthForm
            mode={mode}
            loading={loading}
            error={error}
            onSubmit={onSubmit}
            switchMode={onSwitchMode}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AuthForm({ mode, onSubmit, loading, error, switchMode }) {
  const [f, setF] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    name: "",
  });

  const onChange = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const nameToFirstLast = (name) => {
    const s = String(name || "").trim();
    if (!s) return { first_name: "", last_name: "" };
    const parts = s.split(/\s+/);
    if (parts.length >= 2) {
      return {
        first_name: parts.slice(0, -1).join(" "),
        last_name: parts.at(-1),
      };
    }
    return { first_name: s, last_name: "" };
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (mode === "login") {
          onSubmit({
            username: f.username.trim(),
            password: f.password,
          });
        } else {
          if (
            !f.email.trim() ||
            !f.phone.trim() ||
            !f.name.trim() ||
            !f.password
          ) {
            alert("請完整填寫：Email、手機、姓名、密碼");
            return;
          }
          const { first_name, last_name } = nameToFirstLast(f.name);
          onSubmit({
            email: f.email.trim(),
            password: f.password,
            phone: f.phone.trim(),
            name: f.name.trim(),
            first_name,
            last_name,
          });
        }
      }}
      className="space-y-3"
    >
      {mode === "login" ? (
        <>
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Email 或手機"
            value={f.username}
            onChange={onChange("username")}
            autoComplete="username"
            required
          />
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="password"
            placeholder="密碼"
            value={f.password}
            onChange={onChange("password")}
            autoComplete="current-password"
            required
          />
        </>
      ) : (
        <>
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="email"
            placeholder="Email（必填）"
            value={f.email}
            onChange={onChange("email")}
            autoComplete="email"
            required
          />
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="tel"
            placeholder="手機號碼（必填）"
            value={f.phone}
            onChange={onChange("phone")}
            inputMode="tel"
            autoComplete="tel"
            required
          />
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="姓名（必填）"
            value={f.name}
            onChange={onChange("name")}
            autoComplete="name"
            required
          />
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="password"
            placeholder="設定密碼（必填）"
            value={f.password}
            onChange={onChange("password")}
            autoComplete="new-password"
            required
          />
        </>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-black px-4 py-2 text-white shadow-sm hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50"
      >
        {loading ? "處理中…" : mode === "login" ? "登入" : "註冊並登入"}
      </button>

      <div className="text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>
            還沒有帳號？{" "}
            <button type="button" onClick={switchMode} className="underline">
              前往註冊
            </button>
          </>
        ) : (
          <>
            已有帳號？{" "}
            <button type="button" onClick={switchMode} className="underline">
              立即登入
            </button>
          </>
        )}
      </div>
    </form>
  );
}

/* ======= 手機抽屜選單元件 ======= */
function MobileNavSheet({
  open,
  onClose,
  onSelect,
  brandStores = [
    { t: "關於有香餐飲集團", href: "/main01" },
    { t: "有香", href: "/brand01" },
    { t: "憶點點", href: "/brand02" },
    { t: "有香ㄟ灶腳", href: "/brand03" },
  ],
  brandMenus = [
    { t: "菜單總覽", href: "/menu" },
    { t: "有香", href: "/menu01" },
    { t: "憶點點", href: "/menu02" },
    { t: "有香ㄟ灶腳", href: "/menu03" },
  ],
  cta = {
    groupBuy: { text: "團購商城", href: "https://corner-rouge.vercel.app/" },
    order: { text: "線上點餐", href: "#" },
  },
}) {
  const panelRef = useRef(null);
  const [brandOpen, setBrandOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const canPortal = typeof window !== "undefined" && !!document?.body;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => (document.documentElement.style.overflow = prev);
  }, [open]);

  const handleSelect = (href) => {
    onSelect?.(href);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={sheetOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="主選單"
            variants={sheetPanel}
            initial="initial"
            animate="animate"
            exit="exit"
            ref={panelRef}
            className="fixed right-0 top-0 z-[3010] h-full w-[min(92vw,420px)] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <Link href="/" onClick={onClose} aria-label="Home">
                <Image
                  src="/images/logo/有香餐飲集團-logo.png"
                  alt="有香餐飲集團"
                  width={150}
                  height={48}
                  priority
                />
              </Link>
              <button
                aria-label="close"
                className="rounded-full p-2 text-gray-600 hover:bg-black/5"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex h-[calc(100%-64px)] flex-col">
              <nav className="flex-1 overflow-y-auto px-2 py-2 text-[15px]">
                {/* 品牌門店 (二層) */}
                <button
                  onClick={() => setBrandOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-medium hover:bg-black/5"
                >
                  <span>品牌門店</span>
                  <ChevronDown
                    className={`transition-transform ${
                      brandOpen ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>
                <motion.div
                  variants={accordion}
                  initial="collapsed"
                  animate={brandOpen ? "expanded" : "collapsed"}
                  className="overflow-hidden pl-1"
                >
                  <ul className="mb-1 space-y-1 rounded-xl bg-black/[0.03] p-1">
                    {brandStores.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className="block rounded-lg px-3 py-2 hover:bg-white"
                          onClick={() => handleSelect(it.href)}
                        >
                          {it.t}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* 品牌菜單 (二層) */}
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-medium hover:bg-black/5"
                >
                  <span>品牌菜單</span>
                  <ChevronDown
                    className={`transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>
                <motion.div
                  variants={accordion}
                  initial="collapsed"
                  animate={menuOpen ? "expanded" : "collapsed"}
                  className="overflow-hidden pl-1"
                >
                  <ul className="mb-1 space-y-1 rounded-xl bg-black/[0.03] p-1">
                    {brandMenus.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className="block rounded-lg px-3 py-2 hover:bg-white"
                          onClick={() => handleSelect(it.href)}
                        >
                          {it.t}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* 一層連結 */}
                <Link
                  href="/news"
                  className="mt-1 block rounded-xl px-3 py-3 font-medium hover:bg-black/5"
                  onClick={() => handleSelect("/news")}
                >
                  品牌動態
                </Link>
                <Link
                  href="/participation"
                  className="mt-1 block rounded-xl px-3 py-3 font-medium hover:bg-black/5"
                  onClick={() => handleSelect("/participation")}
                >
                  加盟合作
                </Link>
              </nav>

              {/* CTA 區 */}
              <div className="border-t border-black/10 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={cta.groupBuy.href}
                    target="_blank"
                    className="rounded-2xl bg-[#9c2121] px-4 py-2 text-center text-white hover:opacity-90 active:scale-[0.99] transition"
                    onClick={onClose}
                  >
                    {cta.groupBuy.text}
                  </Link>
                  <Link
                    href={cta.order.href}
                    className="rounded-2xl border border-black/15 bg-white px-4 py-2 text-center hover:bg-black/5 active:scale-[0.99] transition"
                    onClick={onClose}
                  >
                    {cta.order.text}
                  </Link>
                </div>
                <div className="mt-2 text-center text-xs text-black/50">
                  © {new Date().getFullYear()} 有香餐飲集團
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* =================== 主元件 =================== */
export const SlideTabsExample = () => {
  const router = useRouter();

  // 手機選單
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 購物車
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    cartStore.init?.();
    const unsub = cartStore.subscribe?.((c) => setCart([...(c || [])]));
    return typeof unsub === "function" ? unsub : undefined;
  }, []);
  const cartCount = cart.reduce((n, it) => n + (it.qty || 0), 0);
  const subtotal = cart.reduce(
    (sum, it) => sum + Number(it.price || 0) * (it.qty || 0),
    0
  );

  // 會員
  const [auth, setAuth] = useState(authStore.get?.() || {});
  const [userOpen, setUserOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");

  // ✅ 線上點餐彈出框
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  // ✅ 加入購物車成功提示
  const [showAdded, setShowAdded] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  // 初始化與訂閱 auth 狀態
  useEffect(() => {
    authStore.init?.();
    const unsub = authStore.subscribe?.((s) => setAuth({ ...(s || {}) }));
    return typeof unsub === "function" ? unsub : undefined;
  }, []);

  // 跨分頁同步（localStorage 變更時重新 init）
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (!e.key) return;
      const k = e.key.toLowerCase();
      if (k.includes("auth") || k.includes("token") || k.includes("user")) {
        authStore.init?.();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 在商品卡片或詳情頁呼叫這個
  const handleAddToCart = (item) => {
    cartStore.add?.({
      id: item.id,
      name: item.name,
      img: item.img,
      price: item.price,
      qty: item.qty || 1,
    });
    setAddedItem({ ...item, qty: item.qty || 1 });
    setShowAdded(true);
  };

  return (
    <div>
      {/* 手機菜單遮罩（點擊背景時也關閉，已在 MobileNavSheet 內處理） */}

      <motion.nav
        key="navbar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="fixed left-0 top-0 z-[1000] bg-white sm:bg-transparent w-full"
      >
        <div className="mx-auto w-full mt-0 sm:mt-5 py-2 sm:py-0 px-2 text-white">
          <div className="flex items-center">
            {/* 左：手機 Logo */}
            <div className="w-1/3 md:w-1/3">
              <div className="md:hidden">
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

            {/* 中：桌機選單 */}
            <div className="hidden md:flex w-[60%] lg:w-[80%] items-center justify-center gap-8">
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

            {/* 右：訂購 / 會員 / 購物車 / 漢堡 */}
            <div className="flex w-2/3 md:w-1/3 items-center justify-end gap-3">
              <Link
                href="https://corner-rouge.vercel.app/"
                target="_blank"
                className="rounded-[30px] hidden sm:block border border-white/30 bg-[#9c2121] px-3 py-1 text-[14px] text-white hover:bg-[#881b1b] transition-colors"
              >
                團購商城
              </Link>
              <button
                onClick={() => setShowOrderPopup(true)}
                className="rounded-[30px] hidden sm:block border border-white/30 bg-[#9c2121] px-3 py-1 text-[14px] text-white hover:bg-[#881b1b] transition-colors"
              >
                線上點餐
              </button>

              {/* 會員 icon（顯示「已登入」徽章 + 快速進入帳戶） */}
              <div className="relative">
                <button
                  aria-label="user"
                  onClick={() => setUserOpen((v) => !v)}
                  className="relative grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 hover:bg-white/20 transition-colors"
                >
                  <User2 size={18} />
                  {auth?.user && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-[1px] text-[10px] text-white shadow">
                      已登入
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      {...fadeUp}
                      className="absolute right-0 mt-2 w-72 rounded-xl border border-white/15 bg-black/80 text-white shadow-xl backdrop-blur-md"
                    >
                      {!auth?.user ? (
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowAuthModal(true);
                              setAuthMode("login");
                              setUserOpen(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                          >
                            <LogIn size={16} /> 登入
                          </button>
                          <button
                            onClick={() => {
                              setShowAuthModal(true);
                              setAuthMode("register");
                              setUserOpen(false);
                            }}
                            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                          >
                            <User2 size={16} /> 註冊
                          </button>
                        </div>
                      ) : (
                        <div className="p-2 text-sm">
                          <div className="px-3 py-2">
                            <div className="text-white/80">已登入</div>
                            <div className="truncate font-medium">
                              {auth.user.displayName ||
                                auth.user.name ||
                                auth.user.email}
                            </div>
                            {auth.user.email && (
                              <div className="truncate text-xs text-white/60">
                                {auth.user.email}
                              </div>
                            )}
                          </div>
                          <Link
                            href="/account"
                            className="block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
                            onClick={() => setUserOpen(false)}
                          >
                            我的帳戶 / 訂單
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                await authStore.logout?.();
                              } finally {
                                setUserOpen(false);
                                if (typeof window !== "undefined") {
                                  setTimeout(
                                    () => window.location.reload(),
                                    120
                                  );
                                }
                              }
                            }}
                            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-200 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={16} /> 登出
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 購物車 */}
              <button
                aria-label="cart"
                onClick={() => setCartOpen((v) => !v)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 hover:bg-white/20 transition-colors"
              >
                <ShoppingCart size={18} />
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
                  className={`grid h-10 w-10 place-items-center rounded-full border transition-colors ${
                    isMenuOpen
                      ? "bg-white border-gray-300 shadow-sm"
                      : "bg-white/90 border-gray-300 hover:bg-white"
                  }`}
                  onClick={() => setIsMenuOpen((v) => !v)}
                >
                  {isMenuOpen ? (
                    <X className="text-gray-700" />
                  ) : (
                    <Menu className="text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ===== 新增：線上點餐自定義 Popup ===== */}
      <OrderPopup
        open={showOrderPopup}
        onClose={() => setShowOrderPopup(false)}
      >
        <div className="w-full sm:hidden block">
          <Image
            src="/images/online-store/mobile-01.png"
            alt=""
            className="w-full"
            placeholder="empty"
            width={1920}
            height={600}
          />
          <div className="grid grid-cols-2">
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-02.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-03.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-04.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-05.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
          </div>
          <Image
            src="/images/online-store/desktop-06.png"
            alt=""
            className="w-full"
            placeholder="empty"
            width={1920}
            height={600}
          />
          <Image
            src="/images/online-store/desktop-07.png"
            alt=""
            className="w-full"
            placeholder="empty"
            width={1920}
            height={600}
          />
        </div>
        <div className="w-full sm:block hidden">
          <Image
            src="/images/online-store/desktop-01.png"
            alt=""
            className="w-full"
            placeholder="empty"
            width={1920}
            height={600}
          />
          <div className="grid grid-cols-4">
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-02.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-03.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-04.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
            <Link
              href="https://google.com"
              target="_blank"
              className="hover:scale-105 duration-400"
            >
              <Image
                src="/images/online-store/desktop-05.png"
                alt=""
                className="w-full"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
          </div>
          <Image
            src="/images/online-store/desktop-06.png"
            alt=""
            className="w-full"
            placeholder="empty"
            width={1920}
            height={600}
          />
          <Image
            src="/images/online-store/desktop-07.png"
            alt=""
            className="w-full"
            placeholder="empty"
            width={1920}
            height={600}
          />
        </div>
      </OrderPopup>

      {/* ====== Demo：測試加入購物車（實際請移到商品卡片/詳情頁） ====== */}
      <div className="fixed bottom-6 left-6 z-[5]">
        <button
          className="rounded-xl bg-black px-4 py-2 text-white shadow hover:opacity-90"
          onClick={() =>
            handleAddToCart({
              id: "demo-1",
              name: "示範商品 Demo",
              img: "/images/online-store/desktop-02.png",
              price: 120,
              qty: 1,
            })
          }
        >
          測試：加入購物車
        </button>
      </div>

      {/* ===== 加入購物車成功 Toast ===== */}
      <AddToCartPopup
        open={showAdded}
        item={addedItem}
        subtotal={subtotal}
        onClose={() => setShowAdded(false)}
        onCheckout={() => {
          setShowAdded(false);
          setCartOpen(true); // 或 router.push('/checkout')
        }}
      />

      {/* ====== 購物車 Drawer ====== */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              {...cartOverlay}
              className="fixed inset-0 z-[2000] bg-black/35 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.section
              variants={cartPanel}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed h-[95vh] overflow-scroll right-4 ml-4 top-4 z-[2010] w-[min(920px,92vw)] rounded-2xl border border-black/10 bg-white/98 shadow-2xl backdrop-blur-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingCart size={18} />
                  購物車
                  {cartCount > 0 && (
                    <span className="ml-1 text-sm font-normal text-black/60">
                      · {cartCount} 件
                    </span>
                  )}
                </div>
                <button
                  className="rounded-full px-3 py-1.5 text-sm text-gray-600 hover:bg-black/5"
                  onClick={() => setCartOpen(false)}
                >
                  關閉
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Items */}
                <div className="lg:col-span-2 max-h-[58vh] overflow-y-auto px-5 py-4">
                  {cart.length === 0 ? (
                    <EmptyCart />
                  ) : (
                    <ul className="space-y-3">
                      <AnimatePresence initial={false}>
                        {cart.map((it, i) => (
                          <motion.li
                            key={it.id}
                            custom={i}
                            variants={listItem}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="rounded-xl border border-black/10 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={it.img}
                                alt={it.name || ""}
                                className="h-20 w-20 shrink-0 rounded-lg bg-gray-50 object-contain ring-1 ring-black/5"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-2 text-sm font-medium">
                                  {it.name || ""}
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 hover:bg-black/5 active:scale-95 transition"
                                    onClick={() =>
                                      cartStore.setQty?.(
                                        it.id,
                                        Math.max(1, (it.qty || 1) - 1)
                                      )
                                    }
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <input
                                    className="h-7 w-12 rounded-lg border border-black/10 text-center text-sm"
                                    value={it.qty}
                                    onChange={(e) =>
                                      cartStore.setQty?.(
                                        it.id,
                                        Math.max(
                                          1,
                                          parseInt(e.target.value || "1", 10)
                                        )
                                      )
                                    }
                                  />
                                  <button
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 hover:bg-black/5 active:scale-95 transition"
                                    onClick={() =>
                                      cartStore.setQty?.(
                                        it.id,
                                        (it.qty || 1) + 1
                                      )
                                    }
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="text-sm font-semibold">
                                  CA${" "}
                                  {(
                                    Number(it.price || 0) * (it.qty || 0)
                                  ).toLocaleString()}
                                </div>
                                <button
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition"
                                  onClick={() => cartStore.remove?.(it.id)}
                                >
                                  <Trash2 size={14} />
                                  刪除
                                </button>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>

                {/* Summary */}
                <div className="border-t border-black/10 lg:border-l lg:border-t-0">
                  <div className="sticky top-0 px-5 py-4">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="text-base font-semibold">訂單摘要</div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-black/70">小計</span>
                          <span className="font-medium">
                            CA$ {subtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/70">運費</span>
                          <span className="text-black/60">結帳計算</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-dashed border-black/10 pt-3">
                        <span className="font-semibold">總計</span>
                        <span className="text-lg font-bold">
                          CA$ {subtotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <button
                          className="rounded-xl bg-black px-4 py-3 text-white shadow-sm hover:opacity-90 active:scale-[0.99] transition"
                          onClick={() => {
                            setCartOpen(false);
                            router.push("/checkout");
                          }}
                          disabled={cart.length === 0}
                        >
                          前往結帳 ({cartCount})
                        </button>
                        <button
                          className="rounded-xl border border-black/15 bg-white px-4 py-3 text-black hover:bg-black/5 active:scale-[0.99] transition"
                          onClick={() => setCartOpen(false)}
                        >
                          繼續購物
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      {/* ===== 登入/註冊 Modal ===== */}
      <AuthModal
        open={showAuthModal}
        mode={authMode}
        loading={authLoading}
        error={authErr}
        onClose={() => setShowAuthModal(false)}
        onSwitchMode={() =>
          setAuthMode((m) => (m === "login" ? "register" : "login"))
        }
        onSubmit={async (payload) => {
          try {
            setAuthErr("");
            setAuthLoading(true);

            if (authMode === "login") {
              await tryLoginFallback(authStore, payload);
            } else {
              await authStore.register?.(payload);
              await tryLoginFallback(authStore, {
                username: payload.email || payload.phone || payload.name,
                password: payload.password,
              });
            }

            setShowAuthModal(false);
          } catch (e) {
            setAuthErr(String(e?.message || e || "登入失敗，請確認帳號密碼"));
          } finally {
            setAuthLoading(false);
          }
        }}
      />

      {/* ======= 手機抽屜選單渲染 ======= */}
      <MobileNavSheet
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelect={(href) => {
          // 已用 <Link> 處理導頁；如需強制路由：
          // router.push(href);
          setIsMenuOpen(false);
        }}
        // 可傳入 brandStores / brandMenus / cta 自訂
      />
    </div>
  );
};

export default SlideTabsExample;

/* ===== 空購物車 ===== */
function EmptyCart() {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-black/15 bg-gray-50/60 text-center">
      <div>
        <ShoppingCart className="mx-auto mb-2 opacity-50" size={28} />
        <div className="text-sm text-black/60">目前沒有商品</div>
      </div>
    </div>
  );
}
