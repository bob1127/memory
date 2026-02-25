"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "./Layout";
import {
  Minus,
  Plus,
  Trash2,
  Store,
  Truck,
  Calendar,
  ChevronLeft,
  Lock,
} from "lucide-react";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";
import { motion, AnimatePresence } from "framer-motion";

/* =================== 設定區 =================== */
const WORDPRESS_URL = "https://inf.fjg.mybluehost.me/website_da164f68";
/* ============================================== */

/* =================== Helper =================== */
const getCartName = (item, locale) => {
  if (!item) return "";
  const isEn = locale === "en";
  if (isEn && item.name_en) return item.name_en;
  if (!isEn && item.name_zh) return item.name_zh;
  return item.name || "";
};

const roundPrice = (num) => {
  const n = Number(num) || 0;
  return Math.round(n * 100) / 100;
};

const formatPrice = (num) => {
  return (Number(num) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* --- 日期產生器 --- */
const getNext7DaysCanada = (locale) => {
  const dates = [];
  const options = { timeZone: "America/Vancouver" };
  const now = new Date();
  const vancouverDateStr = now.toLocaleString("en-US", options);
  const baseDate = new Date(vancouverDateStr);

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dayName = d.toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
      weekday: "short",
    });
    const dateStr = d.toLocaleDateString(locale === "en" ? "en-US" : "zh-TW", {
      month: "short",
      day: "numeric",
    });
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push({
      labelDay: dayName,
      labelDate: dateStr,
      value: `${year}-${month}-${day}`,
      fullDate: d,
    });
  }
  return dates;
};

/* --- 時間格式化 --- */
const formatTimeDisplay = (isoString) => {
  if (!isoString) return "TBA";
  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type) => parts.find((p) => p.type === type)?.value;
    return `${getPart("year")}/${getPart("month")}/${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
  } catch (e) {
    return isoString;
  }
};

function getActivePeriod(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const now = Date.now();
  return periods.find((p) => {
    const start = new Date(p.start).getTime();
    const end = new Date(p.end).getTime();
    return now >= start && now <= end;
  });
}

function getNextPeriod(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const now = Date.now();
  const upcoming = periods
    .filter((p) => new Date(p.start).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return upcoming[0] || null;
}

/* =================== Modal =================== */
function GroupNoticeModal({ open, onClose, nextPeriod }) {
  const hasData = nextPeriod && nextPeriod.start;
  const timeRange = hasData
    ? `${formatTimeDisplay(nextPeriod.start)} — ${formatTimeDisplay(nextPeriod.end)}`
    : "Loading...";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  目前無法下單 (Group-Buy Closed)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  請等待下一次開團 (Please wait for the next group-buy window)
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-[15px] text-gray-800 leading-relaxed font-medium">
                  很抱歉，本商品僅在
                  <span className="font-bold mx-1">「開團期間」</span>
                  開放下單；目前非開團時段。
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1.5">
                  <span>📅 下一次開團時間 (Next Group Buy)</span>
                </div>
                <div className="text-sm font-mono text-gray-800 tracking-wide font-medium">
                  {timeRange}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (Vancouver Time)
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 transition shadow-sm"
              >
                知道了 / Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* =================== 資料常數 =================== */
const AREAS = [
  {
    label: "Vancouver City (including…)",
    value: "vancouver_city",
    fee: 12,
    tax: 5,
    freeThreshold: 120,
  },
  { label: "Burnaby", value: "burnaby", fee: 12, tax: 5, freeThreshold: 120 },
  {
    label: "White Rock / South Surrey / North Surrey",
    value: "surrey_whiterock",
    fee: 14,
    tax: 5,
    freeThreshold: 150,
  },
];

const CHECKOUT_TRANSLATIONS = {
  "zh-TW": {
    title_contact: "聯絡資訊",
    title_recipient: "收件人",
    title_area: "外送地區",
    title_pickup_date: "自取日期",
    title_payment: "付款方式",
    title_summary: "訂單摘要",
    title_method: "取貨方式",
    label_email: "Email",
    label_name: "姓名",
    label_phone: "電話",
    label_address: "地址（街道、門牌、城市、郵遞區號）",
    logged_in_as: "以",
    logged_in_suffix: "身份登入。",
    use_diff_contact: "使用不同聯絡人",
    shipping_fee: "運費",
    tax: "稅",
    free_shipping_over: "滿 CA$",
    free_shipping_suffix: " 免運",
    subtotal: "小計",
    total: "總計",
    empty_cart: "目前沒有商品",
    place_order: "確認下單",
    placing_order: "建立訂單中…",
    method_delivery: "外送宅配",
    method_pickup: "來店自取",
    desc_delivery: "我們將為您配送到府",
    desc_pickup: "請於營業時間來店領取",
    change_method: "更改取貨方式",
    delivery_closed: "非配送時段",
    delivery_closed_desc: "目前暫停配送",
    alerts: {
      empty_cart: "購物車為空",
      email_required: "Email 必填",
      info_required: "請填寫姓名與電話",
      payment_required: "請選擇付款方式",
      area_required: "請選擇外送地區",
      date_required: "請選擇自取日期",
      address_required: "請輸入詳細地址",
      min_order: "訂單必須滿 80 才能運送",
      error: "下單發生錯誤：",
    },
    payment_methods: {
      cod: "貨到付款/現場付款",
      credit: "信用卡",
    },
    currency: "CA$",
  },
  en: {
    title_contact: "Contact Info",
    title_recipient: "Recipient",
    title_area: "Delivery Area",
    title_pickup_date: "Pickup Date",
    title_payment: "Payment Method",
    title_summary: "Order Summary",
    title_method: "Order Type",
    label_email: "Email",
    label_name: "Name",
    label_phone: "Phone",
    label_address: "Address (Street, Unit, City, Postal Code)",
    logged_in_as: "Logged in as",
    logged_in_suffix: ".",
    use_diff_contact: "Use different contact info",
    shipping_fee: "Shipping",
    tax: "Tax",
    free_shipping_over: "Free shipping over CA$",
    free_shipping_suffix: "",
    subtotal: "Subtotal",
    total: "Total",
    empty_cart: "Cart is empty",
    place_order: "Place Order",
    placing_order: "Processing...",
    method_delivery: "Delivery",
    method_pickup: "Store Pickup",
    desc_delivery: "We deliver directly to you",
    desc_pickup: "Pick up at our store",
    change_method: "Change Method",
    delivery_closed: "Delivery Closed",
    delivery_closed_desc: "Currently unavailable",
    alerts: {
      empty_cart: "Cart is empty",
      email_required: "Email is required",
      info_required: "Name and Phone are required",
      payment_required: "Please select a payment method",
      area_required: "Please select a delivery area",
      date_required: "Please select a pickup date",
      address_required: "Please enter detailed address",
      min_order: "Minimum order amount is $80",
      error: "Order failed: ",
    },
    payment_methods: {
      cod: "Cash on Delivery / Pay at Store",
      credit: "Credit Card",
      transfer: "Bank Transfer",
      linepay: "LINE Pay",
    },
    currency: "CA$",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { locale } = router;
  const t = CHECKOUT_TRANSLATIONS[locale] || CHECKOUT_TRANSLATIONS["zh-TW"];

  /* ------------------ State ------------------ */
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [auth, setAuth] = useState(authStore.get());
  const [useDifferentContact, setUseDifferentContact] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  // --- 團購排程 ---
  const [periods, setPeriods] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    deliveryArea: "",
    deliveryAddress: "",
    pickupDate: "",
    payment: "",
  });

  /* ------------------ Init ------------------ */
  useEffect(() => {
    // 1. 初始化 Cart Store
    cartStore.init();

    // 2. 訂閱 Store 變更 (這是關鍵！當 Store 變更時，這裡會收到最新資料)
    const unsubCart = cartStore.subscribe((c) => setCart([...c]));

    authStore.init?.();
    const unsubAuth = authStore.subscribe((s) => setAuth({ ...s }));
    setAvailableDates(getNext7DaysCanada(locale));

    // 3. 抓取排程
    const fetchPeriods = async () => {
      try {
        let baseUrl = WORDPRESS_URL;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
        const API_URL = `${baseUrl}/wp-json/custom/v1/group-buy`;
        const res = await fetch(API_URL);
        if (res.ok) {
          const data = await res.json();
          setPeriods(data || []);
        }
      } catch (e) {
        console.error("Fetch Periods Error:", e);
      }
    };
    fetchPeriods();

    return () => {
      unsubCart();
      unsubAuth();
    };
  }, [locale]);

  // 時間檢查
  useEffect(() => {
    const checkTime = () => {
      setActivePeriod(getActivePeriod(periods));
      setNextPeriod(getNextPeriod(periods));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [periods]);

  // Auth 同步
  useEffect(() => {
    if (!auth?.user) return;
    const u = auth.user;
    const b = u.billing || {};
    const firstName =
      b.first_name || u.first_name || u.displayName || u.name || "";
    const lastName = b.last_name || u.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    setForm((prev) => ({
      ...prev,
      name: prev.name || fullName,
      phone: prev.phone || b.phone || u.phone || "",
      email: prev.email || u.email || u.user_email || "",
      deliveryAddress: prev.deliveryAddress || b.address_1 || "",
    }));
  }, [auth?.user]);

  /* ------------------ [修正] Logic: 使用 Store 方法直接操作 ------------------ */

  // 修正：刪除本地 setCart 操作，改為呼叫 cartStore.setQty
  // Store 更新後會觸發上方的 useEffect，自動更新頁面上的 cart 狀態
  const handleUpdateQty = (itemId, change) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, (item.qty || 1) + change);

    // 呼叫 Store 的方法 (會同步到 localStorage 和 Navbar)
    if (cartStore.setQty) {
      cartStore.setQty(itemId, newQty);
    }
  };

  // 修正：刪除本地 setCart 操作，改為呼叫 cartStore.remove
  const handleRemoveItem = (itemId) => {
    if (!confirm("Are you sure?")) return;

    // 呼叫 Store 的方法 (會同步到 localStorage 和 Navbar)
    if (cartStore.remove) {
      cartStore.remove(itemId);
    }
  };

  /* ------------------ Order Summary 計算 ------------------ */
  const orderSummary = useMemo(() => {
    const rawSubtotal = cart.reduce(
      (sum, it) => sum + Number(it.price || 0) * (it.qty || 0),
      0,
    );
    const subtotal = roundPrice(rawSubtotal);
    let shippingFee = 0;
    let selectedArea = null;
    if (fulfillmentMethod === "delivery") {
      selectedArea = AREAS.find((a) => a.value === form.deliveryArea);
      shippingFee = selectedArea?.fee || 0;
      if (selectedArea && subtotal >= selectedArea.freeThreshold)
        shippingFee = 0;
    }
    const taxRate = selectedArea?.tax || 0;
    const taxAmount = roundPrice((subtotal * taxRate) / 100);
    const total = roundPrice(subtotal + shippingFee + taxAmount);
    return { subtotal, shippingFee, taxAmount, total, selectedArea };
  }, [cart, form.deliveryArea, fulfillmentMethod]);

  const handleChange = useCallback(
    (key) => (e) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handlePlaceOrder = useCallback(async () => {
    try {
      if (!cart.length) return alert(t.alerts.empty_cart);
      const emailToUse =
        auth?.user && !useDifferentContact
          ? auth.user.email || auth.user.user_email
          : form.email;
      if (!emailToUse) return alert(t.alerts.email_required);
      if (!form.name || !form.phone) return alert(t.alerts.info_required);
      if (!form.payment) return alert(t.alerts.payment_required);
      if (fulfillmentMethod === "delivery") {
        if (!form.deliveryArea) return alert(t.alerts.area_required);
        if (!form.deliveryAddress.trim())
          return alert(t.alerts.address_required);
        if (orderSummary.subtotal < 80) return alert(t.alerts.min_order);
      } else if (fulfillmentMethod === "pickup") {
        if (!form.pickupDate) return alert(t.alerts.date_required);
      }
      setPlacing(true);
      let fullAddress =
        fulfillmentMethod === "delivery"
          ? `${orderSummary.selectedArea?.label || form.deliveryArea} ${form.deliveryAddress}`.trim()
          : `[Store Pickup] Date: ${form.pickupDate}`;

      const payload = {
        cart,
        shipping_fee: orderSummary.shippingFee,
        tax: orderSummary.taxAmount,
        fulfillment_method: fulfillmentMethod,
        pickup_date: form.pickupDate,
        form: { ...form, email: emailToUse, deliveryAddress: fullAddress },
        customerId: auth?.user?.id || 0,
      };
      const resp = await fetch("/api/wc/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok)
        throw new Error(
          data?.detail?.message || data?.message || "Order Failed",
        );

      // 清空購物車
      cartStore.clear?.();
      router.push(`/thank-you?id=${data.order?.id}`);
    } catch (err) {
      console.error(err);
      alert(t.alerts.error + (err?.message || String(err)));
    } finally {
      setPlacing(false);
    }
  }, [
    cart,
    form,
    auth,
    useDifferentContact,
    orderSummary,
    router,
    t,
    fulfillmentMethod,
  ]);

  /* ------------------ Render ------------------ */

  if (!fulfillmentMethod) {
    const isDeliveryAvailable = !!activePeriod;

    return (
      <Layout>
        <Head>
          <title>{t.place_order}</title>
        </Head>
        <GroupNoticeModal
          open={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          nextPeriod={nextPeriod}
        />

        <main className="min-h-screen py-20 bg-gray-50 flex items-center justify-center">
          <div className="w-full max-w-4xl px-4">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-900">
              {t.title_method}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* === 來店自取 圖片卡片 === */}
              <button
                onClick={() => setFulfillmentMethod("pickup")}
                className="group relative rounded-2xl   transition-all duration-300 w-full"
              >
                <div className="w-full aspect-[4/4] relative">
                  <Image
                    src="/images/Store-Pickup.png"
                    alt={t.method_pickup}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </button>

              {/* === 宅配 圖片卡片 === */}
              <button
                onClick={() => {
                  if (isDeliveryAvailable) {
                    setFulfillmentMethod("delivery");
                  } else {
                    setShowGroupModal(true);
                  }
                }}
                className={`group relative rounded-2xl  transition-all duration-300 w-full
                  ${
                    isDeliveryAvailable
                      ? " cursor-pointer"
                      : "opacity-60 cursor-pointer grayscale-[50%]"
                  }
                `}
              >
                <div className="w-full aspect-[4/4] relative">
                  <Image
                    src="/images/Scheduled-Delivery.png"
                    alt={t.method_delivery}
                    fill
                    className={`object-cover transition-transform duration-500 ${isDeliveryAvailable ? "group-hover:scale-105" : ""}`}
                  />
                </div>

                {/* 若暫停配送，顯示半透明遮罩與提示 */}
                {!isDeliveryAvailable && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                    <Lock size={40} className="mb-3" />
                    <span className="text-xl font-bold tracking-wider">
                      {t.delivery_closed}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </main>
      </Layout>
    );
  }
  return (
    <Layout>
      <Head>
        <title>{t.place_order} | Checkout</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen py-10 bg-gray-50 pt-[100px]">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <button
                onClick={() => {
                  setFulfillmentMethod(null);
                  setForm((f) => ({ ...f, deliveryArea: "", pickupDate: "" }));
                }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
              >
                <ChevronLeft size={16} />
                {t.change_method}{" "}
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-800 ml-1">
                  {fulfillmentMethod === "delivery"
                    ? t.method_delivery
                    : t.method_pickup}
                </span>
              </button>
            </div>

            {auth?.user && (
              <div className="mb-6 rounded-lg border bg-emerald-50 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  {t.logged_in_as}{" "}
                  <b>{auth.user.email || auth.user.user_email}</b>{" "}
                  {t.logged_in_suffix}
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-emerald-800 hover:text-emerald-950">
                  <input
                    type="checkbox"
                    checked={useDifferentContact}
                    onChange={(e) => setUseDifferentContact(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  {t.use_diff_contact}
                </label>
              </div>
            )}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-black rounded-full"></span>
                {t.title_contact}
              </h3>
              <input
                type="email"
                placeholder={t.label_email}
                value={form.email}
                onChange={handleChange("email")}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                disabled={!!auth?.user && !useDifferentContact}
              />
            </section>
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-black rounded-full"></span>
                {t.title_recipient}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  placeholder={t.label_name}
                  value={form.name}
                  onChange={handleChange("name")}
                  className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                />
                <input
                  type="tel"
                  placeholder={t.label_phone}
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>
            </section>

            {fulfillmentMethod === "delivery" ? (
              <section className="mb-8 animate-in fade-in zoom-in duration-300">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-black rounded-full"></span>
                  {t.title_area}
                </h3>
                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {AREAS.map((a) => {
                    const isSelected = form.deliveryArea === a.value;
                    return (
                      <label
                        key={a.value}
                        className={`flex justify-between items-center gap-3 p-4 cursor-pointer transition-colors ${isSelected ? "bg-amber-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-black" : "border-gray-300"}`}
                          >
                            {isSelected && (
                              <div className="w-3 h-3 bg-black rounded-full" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="delivery-area"
                            className="hidden"
                            checked={isSelected}
                            onChange={() =>
                              setForm((v) => ({ ...v, deliveryArea: a.value }))
                            }
                          />
                          <span
                            className={`font-medium ${isSelected ? "text-black" : "text-gray-700"}`}
                          >
                            {a.label}
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>
                            {t.shipping_fee} {t.currency}
                            {a.fee} / {t.tax} {a.tax}%
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {t.free_shipping_over}
                            {a.freeThreshold}
                            {t.free_shipping_suffix}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {form.deliveryArea && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                      placeholder={t.label_address}
                      value={form.deliveryAddress}
                      onChange={handleChange("deliveryAddress")}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                    />

                    {/* ====== 新增：宅配提醒區塊 ====== */}
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                      <div className="text-amber-600 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-amber-800 leading-relaxed w-full">
                        {/* 這裡動態抓取後台的配送說明 */}
                        {activePeriod &&
                          (activePeriod.delivery_zh ||
                            activePeriod.delivery_en) && (
                            <div className="mb-3 p-2.5 bg-amber-200/40 rounded border border-amber-200/60 flex items-center gap-2">
                              <span className="text-lg">🚚</span>
                              <div>
                                <div className="font-bold text-amber-900">
                                  {locale === "en"
                                    ? "Estimated Delivery:"
                                    : "預計配送時間："}
                                </div>
                                <div className="text-amber-800 font-bold text-base mt-0.5">
                                  {locale === "en"
                                    ? activePeriod.delivery_en ||
                                      activePeriod.delivery_zh
                                    : activePeriod.delivery_zh ||
                                      activePeriod.delivery_en}
                                </div>
                              </div>
                            </div>
                          )}

                        <p>＊訂單送出後，將由專人致電與您聯繫安排配送日</p>
                        <p className="mt-1">
                          ＊After your order is placed, we will call you to
                          schedule the delivery date.
                        </p>
                      </div>
                    </div>
                    {/* ================================= */}
                  </div>
                )}
              </section>
            ) : (
              <section className="mb-8 animate-in fade-in zoom-in duration-300">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-black rounded-full"></span>
                  {t.title_pickup_date}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((d) => {
                    const isSelected = form.pickupDate === d.value;
                    return (
                      <button
                        key={d.value}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, pickupDate: d.value }))
                        }
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${isSelected ? "bg-black text-white border-black shadow-md scale-105" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                      >
                        <span className="text-xs opacity-70 mb-1">
                          {d.labelDay}
                        </span>
                        <span className="font-bold text-lg">
                          {d.labelDate.split(" ")[0]}
                        </span>
                        {isSelected && (
                          <div className="w-1 h-1 bg-white rounded-full mt-1"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {form.pickupDate && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                    <Calendar size={16} />
                    {t.desc_pickup} :{" "}
                    <span className="font-semibold text-gray-900 ml-1">
                      {form.pickupDate}
                    </span>
                  </div>
                )}
              </section>
            )}
            <section>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-black rounded-full"></span>
                {t.title_payment}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.keys(t.payment_methods).map((key) => {
                  const label = t.payment_methods[key];
                  const isSelected = form.payment === label;
                  return (
                    <label
                      key={key}
                      className={`relative flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "border-black bg-gray-900 text-white shadow-md" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        className="hidden"
                        checked={isSelected}
                        onChange={() =>
                          setForm((v) => ({ ...v, payment: label }))
                        }
                      />
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-white" : "border-gray-400"}`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{label}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="h-fit lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-6 pb-4 border-b">
                {t.title_summary}
              </h3>
              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  {t.empty_cart}
                </div>
              ) : (
                <ul className="space-y-6 mb-6 pr-2 custom-scrollbar">
                  {cart.map((it) => (
                    <li key={it.id} className="flex gap-4 group relative">
                      <div className="block relative w-[100px] h-[100px] aspect-square flex-shrink-0 rounded-lg hover:opacity-90 transition-opacity">
                        <Image
                          src={it.img}
                          alt={it.name || "Product"}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/product/${it.slug || it.id}`}
                            className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-gray-600 transition-colors"
                          >
                            {getCartName(it, locale)}
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(it.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                            <button
                              onClick={() => handleUpdateQty(it.id, -1)}
                              disabled={it.qty <= 1}
                              className="p-1 px-2 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-semibold px-2 min-w-[20px] text-center">
                              {it.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(it.id, 1)}
                              className="p-1 px-2 text-gray-600 hover:bg-gray-200 transition"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {t.currency}
                            {formatPrice(Number(it.price || 0) * (it.qty || 0))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal}</span>
                  <span className="font-medium text-gray-900">
                    {t.currency}
                    {formatPrice(orderSummary.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>{t.shipping_fee}</span>
                    {fulfillmentMethod === "pickup" && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        Pickup
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {orderSummary.shippingFee === 0
                      ? "Free"
                      : `${t.currency}${formatPrice(orderSummary.shippingFee)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.tax}</span>
                  <span className="font-medium text-gray-900">
                    {t.currency}
                    {formatPrice(orderSummary.taxAmount)}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">{t.total}</span>
                  <span className="font-bold text-2xl">
                    <span className="text-sm font-normal text-gray-500 mr-1">
                      {t.currency}
                    </span>
                    {formatPrice(orderSummary.total)}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className={`mt-8 w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg shadow-black/10 flex justify-center items-center gap-2 ${placing ? "bg-gray-800 cursor-wait opacity-80" : "bg-black hover:bg-gray-800 hover:shadow-xl active:transform active:scale-[0.98]"}`}
              >
                {placing && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {placing ? t.placing_order : t.place_order}
              </button>
            </div>
            <div className="text-center text-xs text-gray-400 px-4">
              Secure Checkout powered by SSL encryption
            </div>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
