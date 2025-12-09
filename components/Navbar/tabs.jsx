"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  Globe,
} from "lucide-react";
import { useRouter } from "next/router";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";

/* =================== Helper: 取得多語言商品名稱 =================== */
// 這段邏輯確保購物車能隨時切換語言
const getCartName = (item, locale) => {
  if (!item) return "";
  const isEn = locale === "en";

  // 1. 如果是英文版，且商品有存 name_en，就顯示 name_en
  if (isEn && item.name_en) return item.name_en;

  // 2. 如果是中文版，且商品有存 name_zh，就顯示 name_zh
  if (!isEn && item.name_zh) return item.name_zh;

  // 3. 如果都沒有 (例如舊的購物車資料)，就顯示預設的 name
  return item.name || "";
};

/* =================== 1. 導覽列與購物車翻譯資料庫 =================== */
const NAV_TRANSLATIONS = {
  "zh-TW": {
    stores: "品牌門店",
    menus: "品牌菜單",
    news: "品牌動態",
    franchise: "加盟合作",
    contact: "聯絡我們",
    group_buy: "團購商城",
    order_online: "線上點餐",
    login: "會員登入 / 註冊",
    my_account: "我的帳戶",
    logout: "登出",
    cart: "購物車",
    language: "語言 / Language",
    cart_ui: {
      added: "已加入購物車",
      qty: "數量",
      subtotal: "小計",
      checkout: "前往結帳",
      continue: "繼續逛逛",
      close: "關閉",
      item_unit: "件",
      empty: "目前沒有商品",
      summary: "訂單摘要",
      shipping: "運費",
      shipping_calc: "結帳計算",
      total: "總計",
      remove: "刪除",
    },
    sub_stores: [
      { t: "關於有香餐飲集團", href: "/brand-story?tab=group" },
      { t: "關於有香", href: "/brand-story?tab=youxiang" },
      { t: "關於憶點點", href: "/brand-story?tab=memory" },
      { t: "關於有香ㄟ灶腳", href: "/brand-story?tab=corner" },
    ],
    sub_menus: [
      { t: "菜單總覽", href: "/menu" },
      { t: "有香", href: "/menu01" },
      { t: "憶點點", href: "/menu02" },
    ],
  },
  en: {
    stores: "Locations",
    menus: "Menus",
    news: "News",
    franchise: "Franchise",
    contact: "Contact Us",
    group_buy: "Group Buy",
    order_online: "Order Online",
    login: "Login / Register",
    my_account: "My Account",
    logout: "Logout",
    cart: "Cart",
    language: "Language",
    cart_ui: {
      added: "Added to Cart",
      qty: "Qty",
      subtotal: "Subtotal",
      checkout: "Checkout",
      continue: "Continue Shopping",
      close: "Close",
      item_unit: "items",
      empty: "Your cart is empty",
      summary: "Order Summary",
      shipping: "Shipping",
      shipping_calc: "Calculated at checkout",
      total: "Total",
      remove: "Remove",
    },
    sub_stores: [
      { t: "About Group", href: "/brand-story?tab=group" },
      { t: "Memory Corner", href: "/brand-story?tab=youxiang" },
      { t: "Sweet Memory", href: "/brand-story?tab=memory" },
      { t: "Kitchen Corner", href: "/brand-story?tab=corner" },
    ],
    sub_menus: [
      { t: "All Menus", href: "/menu" },
      { t: "Memory Corner", href: "/menu01" },
      { t: "Sweet Memory", href: "/menu02" },
    ],
  },
};

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
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const modalCard = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.97 },
};
const cartOverlay = modalFade;
const cartPanel = {
  initial: { x: 24, opacity: 0, scale: 0.98 },
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: { x: 24, opacity: 0, scale: 0.98 },
};
const listItem = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.05 * i } }),
  exit: { opacity: 0, y: 10 },
};
const sheetOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const sheetPanel = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};
const accordion = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
};

/* ====== Login helpers ====== */
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
async function tryLoginFallback(store, raw) {
  const first = normalizeLoginPayload(raw);
  try {
    return await store.login(first);
  } catch (e1) {
    const second = { password: first.password };
    if (first.email) second.username = first.email;
    else if (first.username && first.username.includes("@"))
      second.email = first.username.toLowerCase();
    else if (first.phone) second.username = first.phone;
    else second.username = first.username;
    return store.login(second);
  }
}

/* ------------ SubMenuContent ------------ */
const SubMenuContent = ({ items }) => (
  <div className="w-[230px] text-center text-[15px] leading-none">
    <div className="flex flex-col">
      {items.map((item, idx) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-4 py-2.5 text-[15px] text-white bg-[#b87938] hover:bg-[#c5853d] border border-[#c59b63] ${
            idx > 0 ? "border-t-0" : ""
          } transition-colors`}
        >
          {item.t}
        </Link>
      ))}
    </div>
  </div>
);

/* ------- FlyoutLink ------- */
function FlyoutLink({ label, href = "#", items }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit group"
    >
      <Link
        href={href}
        className={`relative inline-flex items-center px-4 py-2.5 border border-transparent text-[17px] font-medium text-[#3c2514] transition-colors duration-200 group-hover:text-[#b57a3c]`}
      >
        {label}
      </Link>
      <AnimatePresence>
        {open && items && (
          <motion.div
            {...fadeUp}
            className="absolute left-0 top-[100%] z-[1200] rounded-b-[8px] border border-t-0 border-[#b57a3c] bg-transparent shadow-lg backdrop-blur-[2px] min-w-[220px]"
          >
            <div className="p-0">
              <SubMenuContent items={items} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== [修改] AddToCartPopup：傳入 locale 以支援名稱切換 ===== */
function AddToCartPopup({
  open,
  item,
  subtotal,
  onClose,
  onCheckout,
  t,
  locale,
}) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 2800);
    return () => clearTimeout(id);
  }, [open, onClose]);

  const ui = t?.cart_ui || {};
  // 使用 helper 取得動態名稱
  const displayName = getCartName(item, locale);

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
          >
            ✕
          </button>
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
              <ShoppingCart size={18} /> {ui.added || "已加入購物車"}
            </div>
            {item && (
              <div className="flex items-center gap-3">
                <img
                  src={item.img}
                  alt={displayName}
                  className="h-16 w-16 shrink-0 rounded-lg bg-gray-50 object-contain ring-1 ring-black/5"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-medium">
                    {/* ✅ 這裡顯示切換後的名稱 */}
                    {displayName}
                  </div>
                  <div className="mt-1 text-xs text-black/60">
                    {ui.qty || "數量"}：{item.qty || 1}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  CA${" "}
                  {Number(
                    item.price || 0 * Number(item.qty || 1)
                  ).toLocaleString()}
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-black/10 pt-3">
              <span className="text-sm text-black/70">
                {ui.subtotal || "小計"}
              </span>
              <span className="text-lg font-bold">
                CA$ {Number(subtotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onCheckout}
                className="rounded-xl bg-black px-4 py-2.5 text-white hover:opacity-90"
              >
                {ui.checkout || "前往結帳"}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-black hover:bg-black/5"
              >
                {ui.continue || "繼續逛逛"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ===== Order Popup ===== */
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
          className="relative w-full max-w-[1560px] bg-[#dcdedd] p-6 shadow-2xl overflow-y-auto max-h-[98vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute right-4 top-4 z-50 rounded-full bg-white/50 p-2 text-gray-700 hover:bg-white hover:text-black"
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

/* ===== Auth Modal ===== */
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
    if (parts.length >= 2)
      return {
        first_name: parts.slice(0, -1).join(" "),
        last_name: parts.at(-1),
      };
    return { first_name: s, last_name: "" };
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (mode === "login")
          onSubmit({ username: f.username.trim(), password: f.password });
        else {
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
          {" "}
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="Email 或手機"
            value={f.username}
            onChange={onChange("username")}
            autoComplete="username"
            required
          />{" "}
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="password"
            placeholder="密碼"
            value={f.password}
            onChange={onChange("password")}
            autoComplete="current-password"
            required
          />{" "}
        </>
      ) : (
        <>
          {" "}
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="email"
            placeholder="Email（必填）"
            value={f.email}
            onChange={onChange("email")}
            autoComplete="email"
            required
          />{" "}
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="tel"
            placeholder="手機號碼（必填）"
            value={f.phone}
            onChange={onChange("phone")}
            inputMode="tel"
            autoComplete="tel"
            required
          />{" "}
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            placeholder="姓名（必填）"
            value={f.name}
            onChange={onChange("name")}
            autoComplete="name"
            required
          />{" "}
          <input
            className="w-full rounded-lg border border-black/15 px-3 py-2"
            type="password"
            placeholder="設定密碼（必填）"
            value={f.password}
            onChange={onChange("password")}
            autoComplete="new-password"
            required
          />{" "}
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
        className="w-full rounded-xl bg-black px-4 py-2 text-white shadow-sm hover:opacity-90 disabled:opacity-50"
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

/* ======= 手機抽屜選單 ======= */
function MobileNavSheet({
  open,
  onClose,
  onSelect,
  t,
  cta = {
    groupBuy: { href: "https://corner-rouge.vercel.app/" },
    order: { href: "#" },
  },
  auth,
  cartCount = 0,
  onLoginClick,
  onLogoutClick,
  onCartClick,
  onOrderClick,
  locale,
  onSwitchLocale,
}) {
  const panelRef = useRef(null);
  const [brandOpen, setBrandOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
            variants={sheetPanel}
            initial="initial"
            animate="animate"
            exit="exit"
            ref={panelRef}
            className="fixed right-0 top-0 z-[3010] h-full w-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <Link href="/" onClick={onClose} aria-label="Home">
                <div className="w-[120px]">
                  <Image
                    src="/images/logo/有香餐飲集團-logo.png"
                    alt="有香餐飲集團"
                    width={150}
                    height={48}
                    priority
                  />
                </div>
              </Link>
              <button
                className="rounded-full p-2 text-gray-600 hover:bg-black/5"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-black/5">
              <div className="flex items-center gap-2 text-sm text-black/60">
                <Globe size={16} /> {t.language || "Language"}
              </div>
              <div className="flex items-center rounded-full bg-[#634832]/90 p-[3px] shadow-inner">
                <button
                  onClick={() => onSwitchLocale("zh-TW")}
                  className={`rounded-full px-4 py-[4px] text-[12px] font-bold transition-all duration-300 ${
                    locale === "zh-TW" || !locale
                      ? "bg-white text-[#3c2514] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => onSwitchLocale("en")}
                  className={`rounded-full px-4 py-[4px] text-[12px] font-bold transition-all duration-300 ${
                    locale === "en"
                      ? "bg-white text-[#3c2514] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
            <div className="flex h-[calc(100%-110px)] flex-col">
              <nav className="flex-1 overflow-y-auto px-4 py-4 text-[15px] space-y-1">
                <button
                  onClick={() => setBrandOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left font-medium hover:bg-black/5 transition"
                >
                  <span>{t.stores}</span>
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
                  className="overflow-hidden pl-2"
                >
                  <ul className="mb-2 space-y-1 border-l-2 border-black/5 pl-2">
                    {t.sub_stores.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className="block rounded-lg px-3 py-2 text-black/70 hover:bg-black/5 hover:text-black"
                          onClick={() => handleSelect(it.href)}
                        >
                          {it.t}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left font-medium hover:bg-black/5 transition"
                >
                  <span>{t.menus}</span>
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
                  className="overflow-hidden pl-2"
                >
                  <ul className="mb-2 space-y-1 border-l-2 border-black/5 pl-2">
                    {t.sub_menus.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className="block rounded-lg px-3 py-2 text-black/70 hover:bg-black/5 hover:text-black"
                          onClick={() => handleSelect(it.href)}
                        >
                          {it.t}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                <Link
                  href="/news"
                  className="block rounded-xl px-2 py-3 font-medium hover:bg-black/5 transition"
                  onClick={() => handleSelect("/news")}
                >
                  {t.news}
                </Link>
                <Link
                  href="/participation"
                  className="block rounded-xl px-2 py-3 font-medium hover:bg-black/5 transition"
                  onClick={() => handleSelect("/participation")}
                >
                  {t.franchise}
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-xl px-2 py-3 font-medium hover:bg-black/5 transition"
                  onClick={() => handleSelect("/contact")}
                >
                  {t.contact}
                </Link>
              </nav>
              <div className="border-t border-black/10 p-4 space-y-3 bg-gray-50/50">
                {!auth?.user ? (
                  <button
                    onClick={() => {
                      onLoginClick?.();
                      onClose?.();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-white hover:opacity-90"
                  >
                    <User2 size={18} /> {t.login}
                  </button>
                ) : (
                  <div className="rounded-xl border border-black/10 bg-white p-3 text-center shadow-sm">
                    {" "}
                    <div className="text-sm text-black/70 mb-2">
                      Hello,{" "}
                      {auth.user.displayName || auth.user.name || "Member"}
                    </div>{" "}
                    <div className="flex justify-center gap-2">
                      <Link
                        href="/account"
                        className="rounded-lg bg-black text-white px-3 py-1.5 text-xs hover:opacity-90"
                        onClick={onClose}
                      >
                        {t.my_account}
                      </Link>
                      <button
                        className="rounded-lg border border-black/15 px-3 py-1.5 text-xs hover:bg-black/5"
                        onClick={() => {
                          onLogoutClick?.();
                          onClose?.();
                        }}
                      >
                        {t.logout}
                      </button>
                    </div>{" "}
                  </div>
                )}
                <button
                  onClick={() => {
                    onCartClick?.();
                    onClose?.();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 hover:bg-black/5"
                >
                  <ShoppingCart size={18} /> {t.cart}
                  {cartCount > 0 && (
                    <span className="ml-1 rounded-full bg-[#9c2121] px-2 py-[1px] text-[11px] text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="border-t border-black/10 p-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={cta.groupBuy.href}
                    target="_blank"
                    className="rounded-xl bg-[#9c2121] px-2 py-2.5 text-center text-sm font-medium text-white hover:bg-[#881b1b]"
                    onClick={onClose}
                  >
                    {t.group_buy}
                  </Link>
                  <button
                    onClick={() => {
                      onOrderClick?.();
                      onClose?.();
                    }}
                    className="rounded-xl border border-[#9c2121] text-[#9c2121] bg-white px-2 py-2.5 text-center text-sm font-medium hover:bg-red-50"
                  >
                    {t.order_online}
                  </button>
                </div>
                <div className="mt-3 text-center text-[10px] text-black/40">
                  © {new Date().getFullYear()} Memory Corner
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
  const { locale, pathname, query, asPath } = router;
  const t = NAV_TRANSLATIONS[locale] || NAV_TRANSLATIONS["zh-TW"];
  const ui = t.cart_ui || {};

  const handleSwitchLocale = (newLocale) => {
    if (newLocale === locale) return;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setIsScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const [auth, setAuth] = useState(authStore.get?.() || {});
  const [userOpen, setUserOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => {
    authStore.init?.();
    const unsub = authStore.subscribe?.((s) => setAuth({ ...(s || {}) }));
    return typeof unsub === "function" ? unsub : undefined;
  }, []);
  useEffect(() => {
    const onStorage = (e) => {
      if (!e || !e.key) return;
      const k = e.key.toLowerCase();
      if (k.includes("auth") || k.includes("token") || k.includes("user")) {
        authStore.init?.();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div>
      <motion.nav
        key="navbar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className={`fixed left-0 top-0 z-[999] w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#ede5d6]/95 shadow-md backdrop-blur-sm py-2"
            : "bg-white xl:bg-transparent py-2 xl:py-4"
        }`}
      >
        <div className="mx-auto w-full px-4 xl:px-8 max-w-[1920px]">
          <div className="flex items-center justify-between">
            {/* 左側 */}
            <div className="flex w-[20%] items-center justify-start">
              <div className="xl:hidden">
                <button
                  aria-label="open menu"
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/50 hover:bg-white active:scale-95 transition-all"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Menu className="text-[#3c2514]" size={22} />
                </button>
              </div>
              <div className="hidden xl:flex items-center gap-3">
                <Link
                  href="https://corner-rouge.vercel.app/"
                  target="_blank"
                  className="group relative overflow-hidden rounded-full border border-white/30 bg-[#9c2121] px-5 py-2 text-[15px] text-white hover:bg-[#881b1b] transition-colors shadow-sm"
                >
                  <span className="relative z-10">{t.group_buy}</span>
                </Link>
                <button
                  onClick={() => setShowOrderPopup(true)}
                  className="rounded-full border border-white/30 bg-[#9c2121] px-5 py-2 text-[15px] text-white hover:bg-[#881b1b] transition-colors shadow-sm"
                >
                  {t.order_online}
                </button>
              </div>
            </div>
            {/* 中間 */}
            <div className="flex flex-1 justify-center">
              <div className="xl:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link href="/" aria-label="Home">
                  <div className="w-[140px] md:w-[160px]">
                    <Image
                      src="/images/logo/有香餐飲集團-logo.png"
                      alt="有香餐飲集團"
                      width={160}
                      height={50}
                      priority
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </Link>
              </div>
              <div className="hidden xl:flex items-center justify-center gap-5 2xl:gap-8">
                <FlyoutLink href="/" label={t.stores} items={t.sub_stores} />
                <FlyoutLink href="/menu" label={t.menus} items={t.sub_menus} />
                <Link href="/" aria-label="Home" className="px-2">
                  <Image
                    src="/images/logo/有香餐飲集團-logo.png"
                    alt="有香餐飲集團"
                    width={180}
                    height={58}
                    priority
                    className="h-[50px] w-auto object-contain drop-shadow-sm"
                  />
                </Link>
                <Link
                  href="/news"
                  className="px-4 py-2 text-[17px] font-medium text-[#3c2514] hover:text-[#b57a3c] transition-colors"
                >
                  {t.news}
                </Link>
                <Link
                  href="/participation"
                  className="px-4 py-2 text-[17px] font-medium text-[#3c2514] hover:text-[#b57a3c] transition-colors"
                >
                  {t.franchise}
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 text-[17px] font-medium text-[#3c2514] hover:text-[#b57a3c] transition-colors"
                >
                  {t.contact}
                </Link>
              </div>
            </div>
            {/* 右側 */}
            <div className="flex w-[20%] items-center justify-end gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center rounded-full bg-[#634832]/90 p-[3px] shadow-inner backdrop-blur-sm">
                <button
                  onClick={() => handleSwitchLocale("zh-TW")}
                  className={`rounded-full px-3 py-[3px] text-[12px] font-bold transition-all duration-300 ${
                    locale === "zh-TW" || !locale
                      ? "bg-white text-[#3c2514] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  CN
                </button>
                <button
                  onClick={() => handleSwitchLocale("en")}
                  className={`rounded-full px-3 py-[3px] text-[12px] font-bold transition-all duration-300 ${
                    locale === "en"
                      ? "bg-white text-[#3c2514] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>
              <div className="relative hidden sm:block">
                <button
                  aria-label="user"
                  onClick={() => setUserOpen((v) => !v)}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition-all ${
                    isScrolled || isMenuOpen
                      ? "border-black/10 bg-black/5 hover:bg-black/10 text-[#3c2514]"
                      : "xl:border-white/20 xl:bg-black/20 xl:text-white xl:hover:bg-white/20 border-black/10 bg-black/5 text-[#3c2514]"
                  }`}
                >
                  <User2 size={20} />
                  {auth?.user && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow ring-2 ring-white" />
                  )}
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      {...fadeUp}
                      className="absolute right-0 mt-3 w-72 rounded-xl border border-white/20 bg-black/85 text-white shadow-2xl backdrop-blur-md overflow-hidden"
                    >
                      {!auth?.user ? (
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowAuthModal(true);
                              setAuthMode("login");
                              setUserOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors"
                          >
                            <LogIn size={18} />{" "}
                            <span className="text-[15px]">{t.login}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-2">
                          <div className="px-4 py-3 border-b border-white/10 mb-1">
                            <div className="text-xs text-white/50 uppercase tracking-wider">
                              Signed in as
                            </div>
                            <div className="truncate font-medium text-[15px] mt-0.5">
                              {auth.user.displayName ||
                                auth.user.name ||
                                auth.user.email}
                            </div>
                          </div>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 w-full rounded-lg px-4 py-3 hover:bg-white/10 transition-colors"
                            onClick={() => setUserOpen(false)}
                          >
                            <User2 size={16} /> {t.my_account}
                          </Link>
                          <button
                            onClick={async () => {
                              await authStore.logout?.();
                              setUserOpen(false);
                              window.location.reload();
                            }}
                            className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                          >
                            <LogOut size={16} /> {t.logout}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                aria-label="cart"
                onClick={() => setCartOpen((v) => !v)}
                className={`relative grid h-10 w-10 place-items-center rounded-full border transition-all ${
                  isScrolled || isMenuOpen
                    ? "border-black/10 bg-black/5 hover:bg-black/10 text-[#3c2514]"
                    : "xl:border-white/20 xl:bg-black/20 xl:text-white xl:hover:bg-white/20 border-black/10 bg-black/5 text-[#3c2514]"
                }`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#9c2121] px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

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
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {/* 第一個區塊 (有連結) */}
          <div className="overflow-hidden p-2 sm:p-5">
            <Link
              href="https://h5.posking.ca/#/shop?id=598"
              className="block w-full h-full"
              target="_blank"
            >
              <Image
                src="/images/online-store/desktop-02.png"
                alt=""
                className="w-full h-auto duration-300 scale-100 hover:scale-105"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
          </div>

          {/* 第二個區塊 */}
          <div className="overflow-hidden p-2 sm:p-5">
            <Link
              href="https://h5.posking.ca/#/shop?form=OW&id=624&lid=20&mid=27"
              className="block w-full h-full"
              target="_blank"
            >
              {" "}
              <Image
                src="/images/online-store/desktop-03.png"
                alt=""
                className="w-full h-auto duration-300 scale-100 hover:scale-105"
                placeholder="empty"
                width={1920}
                height={600}
              />
            </Link>
          </div>

          {/* 第三個區塊 */}
          <div className="overflow-hidden p-2 sm:p-5">
            <Link
              href="https://h5.posking.ca/#/shop?id=609"
              className="block w-full h-full"
              target="_blank"
            >
              {" "}
              <Image
                src="/images/online-store/desktop-04.png"
                alt=""
                className="w-full h-auto duration-300 scale-100 hover:scale-105"
                placeholder="empty"
                width={1920}
                height={600}
              />{" "}
            </Link>
          </div>

          {/* 第四個區塊 */}
          <div className="overflow-hidden p-2 sm:p-5">
            <Image
              src="/images/online-store/desktop-05.png"
              alt=""
              className="w-full h-auto duration-300 scale-100 hover:scale-105"
              placeholder="empty"
              width={1920}
              height={600}
            />
          </div>
        </div>
        <div className="w-full sm:block hidden p-5 overflow-hidden">
          <Image
            src="/images/online-store/desktop-06.png"
            alt=""
            className="w-full hover:scale-105 scale-100 duration-300"
            placeholder="empty"
            width={1920}
            height={600}
          />
        </div>
        <div className="w-full   ">
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

      {/* AddToCartPopup: 傳入 locale 以支援名稱切換 */}
      <AddToCartPopup
        open={showAdded}
        item={addedItem}
        subtotal={subtotal}
        onClose={() => setShowAdded(false)}
        onCheckout={() => {
          setShowAdded(false);
          setCartOpen(true);
        }}
        t={t}
        locale={locale}
      />

      {/* Cart Drawer */}
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
              className="fixed h-[95vh] overflow-scroll right-4 ml-4 top-4 z-[999999999999] w-[min(920px,92vw)] rounded-2xl border border-black/10 bg-white/98 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <ShoppingCart size={18} /> {t.cart}{" "}
                  {cartCount > 0 && (
                    <span className="ml-1 text-sm font-normal text-black/60">
                      · {cartCount} {ui.item_unit}
                    </span>
                  )}
                </div>
                <button
                  className="rounded-full px-3 py-1.5 text-sm text-gray-600 hover:bg-black/5"
                  onClick={() => setCartOpen(false)}
                >
                  {ui.close || "關閉"}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 max-h-[58vh] overflow-y-auto px-5 py-4">
                  {cart.length === 0 ? (
                    <EmptyCart t={t} />
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
                                alt={it.name}
                                className="h-20 w-20 shrink-0 rounded-lg bg-gray-50 object-contain ring-1 ring-black/5"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-2 text-sm font-medium">
                                  {/* ✅ 這裡使用 getCartName 來切換名稱 */}
                                  {getCartName(it, locale)}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 hover:bg-black/5"
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
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 hover:bg-black/5"
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
                                  {Number(
                                    it.price || 0 * (it.qty || 0)
                                  ).toLocaleString()}
                                </div>
                                <button
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => cartStore.remove?.(it.id)}
                                >
                                  <Trash2 size={14} /> {ui.remove || "刪除"}
                                </button>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
                <div className="border-t border-black/10 lg:border-l lg:border-t-0">
                  <div className="sticky top-0 px-5 py-4">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="text-base font-semibold">
                        {ui.summary || "訂單摘要"}
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-black/70">
                            {ui.subtotal || "小計"}
                          </span>
                          <span className="font-medium">
                            CA$ {subtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/70">
                            {ui.shipping || "運費"}
                          </span>
                          <span className="text-black/60">
                            {ui.shipping_calc || "結帳計算"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-dashed border-black/10 pt-3">
                        <span className="font-semibold">
                          {ui.total || "總計"}
                        </span>
                        <span className="text-lg font-bold">
                          CA$ {subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2">
                        <button
                          className="rounded-xl bg-black px-4 py-3 text-white shadow-sm hover:opacity-90"
                          onClick={() => {
                            setCartOpen(false);
                            router.push("/checkout");
                          }}
                          disabled={cart.length === 0}
                        >
                          {ui.checkout || "前往結帳"} ({cartCount})
                        </button>
                        <button
                          className="rounded-xl border border-black/15 bg-white px-4 py-3 text-black hover:bg-black/5"
                          onClick={() => setCartOpen(false)}
                        >
                          {ui.continue || "繼續購物"}
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
            if (authMode === "login")
              await tryLoginFallback(authStore, payload);
            else {
              await authStore.register?.(payload);
              await tryLoginFallback(authStore, {
                username: payload.email || payload.phone || payload.name,
                password: payload.password,
              });
            }
            setShowAuthModal(false);
          } catch (e) {
            setAuthErr(String(e?.message || e || "登入失敗"));
          } finally {
            setAuthLoading(false);
          }
        }}
      />
      <MobileNavSheet
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        auth={auth}
        cartCount={cartCount}
        onLoginClick={() => {
          setShowAuthModal(true);
          setAuthMode("login");
        }}
        onLogoutClick={async () => {
          await authStore.logout?.();
          window.location.reload();
        }}
        onCartClick={() => setCartOpen(true)}
        onOrderClick={() => setShowOrderPopup(true)}
        t={t}
        locale={locale}
        onSwitchLocale={handleSwitchLocale}
      />
    </div>
  );
};

export default SlideTabsExample;

/* ===== EmptyCart ===== */
function EmptyCart({ t }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-black/15 bg-gray-50/60 text-center">
      <div>
        <ShoppingCart className="mx-auto mb-2 opacity-50" size={28} />
        <div className="text-sm text-black/60">
          {t?.cart_ui?.empty || "目前沒有商品"}
        </div>
      </div>
    </div>
  );
}
