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
  Calendar,
  ChevronLeft,
  Store,
  MapPin,
} from "lucide-react";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";

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

// 🍺 判斷是否為啤酒商品
const isBeerProduct = (item) => {
  if (!item) return false;
  const n1 = String(item.name || "").toLowerCase();
  const n2 = String(item.name_zh || "").toLowerCase();
  const n3 = String(item.name_en || "").toLowerCase();
  const check = (str) =>
    str.includes("beer") ||
    str.includes("啤酒") ||
    str.includes("台啤") ||
    str.includes("生啤") ||
    str.includes("draft");
  return check(n1) || check(n2) || check(n3);
};

/* --- 日期產生器 (溫哥華時間) --- */
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

/* =================== 資料常數 =================== */
const CHECKOUT_TRANSLATIONS = {
  "zh-TW": {
    page_title: "啤酒結帳 (自取限定)",
    title_method: "取貨方式",
    change_method: "返回上一步",
    method_pickup: "來店自取",
    title_contact: "聯絡資訊",
    title_recipient: "訂購人",
    title_pickup_date: "自取日期",
    title_payment: "付款方式",
    title_summary: "啤酒訂單摘要",
    label_email: "Email",
    label_name: "姓名",
    label_phone: "電話",
    logged_in_as: "以",
    logged_in_suffix: "身份登入。",
    use_diff_contact: "使用不同聯絡人",
    subtotal: "小計",
    tax: "稅",
    total: "總計",
    empty_cart: "您的啤酒購物車目前為空",
    place_order: "確認自取下單",
    placing_order: "建立訂單中…",
    desc_pickup: "請於營業時間來店領取",
    pickup_location_title: "📍 啤酒專屬自取點",
    pickup_store: "憶點點 (Sweet Memory)",
    pickup_address: "8080 Leslie Rd #130, Richmond, BC V6X 4A8",
    alerts: {
      empty_cart: "購物車為空",
      email_required: "Email 必填",
      info_required: "請填寫姓名與電話",
      payment_required: "請選擇付款方式",
      date_required: "請選擇自取日期",
      error: "下單發生錯誤：",
    },
    payment_methods: {
      cod: "現場付款 (憶點點門店)",
    },
    currency: "CA$",
  },
  en: {
    page_title: "🍺 Beer Checkout (Pickup Only)",
    title_method: "Order Type",
    change_method: "Go Back",
    method_pickup: "Store Pickup",
    title_contact: "Contact Info",
    title_recipient: "Customer Info",
    title_pickup_date: "Pickup Date",
    title_payment: "Payment Method",
    title_summary: "Beer Order Summary",
    label_email: "Email",
    label_name: "Name",
    label_phone: "Phone",
    logged_in_as: "Logged in as",
    logged_in_suffix: ".",
    use_diff_contact: "Use different contact info",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    empty_cart: "Your beer cart is empty",
    place_order: "Place Pickup Order",
    placing_order: "Processing...",
    desc_pickup: "Pick up at our store during business hours",
    pickup_location_title: "📍 Beer Pickup Location",
    pickup_store: "Sweet Memory",
    pickup_address: "8080 Leslie Rd #130, Richmond, BC V6X 4A8",
    alerts: {
      empty_cart: "Cart is empty",
      email_required: "Email is required",
      info_required: "Name and Phone are required",
      payment_required: "Please select a payment method",
      date_required: "Please select a pickup date",
      error: "Order failed: ",
    },
    payment_methods: {
      cod: "Pay at Store (Sweet Memory)",
    },
    currency: "CA$",
  },
};

export default function CheckoutBeerPage() {
  const router = useRouter();
  const { locale } = router;
  const t = CHECKOUT_TRANSLATIONS[locale] || CHECKOUT_TRANSLATIONS["zh-TW"];

  /* ------------------ State ------------------ */
  const [fulfillmentMethod, setFulfillmentMethod] = useState(null);
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [auth, setAuth] = useState(authStore.get());
  const [useDifferentContact, setUseDifferentContact] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    pickupDate: "",
    payment: "",
  });

  /* ------------------ Init ------------------ */
  useEffect(() => {
    cartStore.init();
    const unsubCart = cartStore.subscribe((c) => {
      setCart(c.filter(isBeerProduct));
    });

    authStore.init?.();
    const unsubAuth = authStore.subscribe((s) => setAuth({ ...s }));
    setAvailableDates(getNext7DaysCanada(locale));

    return () => {
      unsubCart();
      unsubAuth();
    };
  }, [locale]);

  // Auth 同步 & 自動預設唯一付款方式
  useEffect(() => {
    // 取得當前語系的唯一付款方式並預設勾選
    const defaultPayment = (
      CHECKOUT_TRANSLATIONS[locale] || CHECKOUT_TRANSLATIONS["zh-TW"]
    ).payment_methods.cod;

    if (!auth?.user) {
      setForm((prev) => ({ ...prev, payment: defaultPayment }));
      return;
    }

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
      payment: defaultPayment,
    }));
  }, [auth?.user, locale]);

  /* ------------------ Store Methods ------------------ */
  const handleUpdateQty = (itemId, change) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, (item.qty || 1) + change);
    if (cartStore.setQty) cartStore.setQty(itemId, newQty);
  };

  const handleRemoveItem = (itemId) => {
    if (!confirm("Are you sure?")) return;
    if (cartStore.remove) cartStore.remove(itemId);
  };

  /* ------------------ Order Summary 計算 ------------------ */
  const orderSummary = useMemo(() => {
    const rawSubtotal = cart.reduce(
      (sum, it) => sum + Number(it.price || 0) * (it.qty || 0),
      0,
    );
    const subtotal = roundPrice(rawSubtotal);
    const taxAmount = 0;
    const total = roundPrice(subtotal + taxAmount);
    return { subtotal, taxAmount, total };
  }, [cart]);

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
      if (!form.pickupDate) return alert(t.alerts.date_required);

      setPlacing(true);
      // 確保訂單備註帶有明確的取貨地點
      const fullAddress = `[Store Pickup] Sweet Memory 憶點點 | Date: ${form.pickupDate}`;

      const payload = {
        cart,
        shipping_fee: 0,
        tax: orderSummary.taxAmount,
        fulfillment_method: "pickup",
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

      if (cartStore.remove) {
        cart.forEach((item) => cartStore.remove(item.id));
      }

      router.push(`/thank-you?id=${data.order?.id}`);
    } catch (err) {
      console.error(err);
      alert(t.alerts.error + (err?.message || String(err)));
    } finally {
      setPlacing(false);
    }
  }, [cart, form, auth, useDifferentContact, orderSummary, router, t]);

  /* ------------------ Render 第一步：選擇取貨方式畫面 ------------------ */
  if (!fulfillmentMethod) {
    return (
      <Layout>
        <Head>
          <title>{t.page_title}</title>
        </Head>

        <main className="min-h-screen py-20 bg-gray-50 flex items-center justify-center pt-[100px]">
          <div className="w-full max-w-4xl px-4">
            <h1 className="text-3xl font-bold text-center mb-10 text-gray-900">
              {t.title_method}
            </h1>

            <div className="flex justify-center max-w-sm mx-auto">
              <button
                onClick={() => setFulfillmentMethod("pickup")}
                className="group relative rounded-2xl transition-all duration-300 w-full shadow-md hover:shadow-xl"
              >
                <div className="w-full aspect-[4/4] relative rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Store-Pickup.png"
                    alt={t.method_pickup}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </button>
            </div>

            <p className="text-center text-gray-500 mt-6 text-sm">
              *啤酒類商品依法規僅限來店自取
            </p>
          </div>
        </main>
      </Layout>
    );
  }

  /* ------------------ Render 第二步：結帳表單 ------------------ */
  return (
    <Layout>
      <Head>
        <title>{t.page_title}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen py-10 bg-gray-50 pt-[100px]">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：填寫資料區 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {t.page_title}
              </h1>
              <button
                onClick={() => {
                  setFulfillmentMethod(null);
                }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
              >
                <ChevronLeft size={16} />
                {t.change_method}
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
                <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                {t.title_contact}
              </h3>
              <input
                type="email"
                placeholder={t.label_email}
                value={form.email}
                onChange={handleChange("email")}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                disabled={!!auth?.user && !useDifferentContact}
              />
            </section>

            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                {t.title_recipient}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  placeholder={t.label_name}
                  value={form.name}
                  onChange={handleChange("name")}
                  className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
                <input
                  type="tel"
                  placeholder={t.label_phone}
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </section>

            {/* 自取日期與地點 */}
            <section className="mb-8 animate-in fade-in zoom-in duration-300">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
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
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-amber-500 text-white border-amber-500 shadow-md scale-105"
                          : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      <span className="text-xs opacity-80 mb-1">
                        {d.labelDay}
                      </span>
                      <span className="font-bold text-lg">
                        {d.labelDate.split(" ")[0]}
                      </span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 📍 醒目的取貨地點資訊框 */}
              <div className="mt-5 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
                  <Store size={20} className="text-amber-600" />
                  {t.pickup_location_title}
                </div>
                <div className="text-amber-950 font-bold text-lg mb-1">
                  {t.pickup_store}
                </div>
                <div className="flex items-start gap-2 text-amber-800 text-sm mb-3">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{t.pickup_address}</span>
                </div>
                <div className="pt-3 border-t border-amber-200/60 text-amber-800 text-sm flex items-center gap-2">
                  <Calendar size={16} className="shrink-0" />
                  <div>
                    {t.desc_pickup}
                    {form.pickupDate && (
                      <span className="font-bold ml-1 text-amber-900 bg-amber-200/50 px-2 py-0.5 rounded">
                        {form.pickupDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                {t.title_payment}
              </h3>
              <div className="grid sm:grid-cols-1 gap-4">
                {/* 限制只有一個現場付款選項，且自動預設選中 */}
                {Object.keys(t.payment_methods).map((key) => {
                  const label = t.payment_methods[key];
                  const isSelected = form.payment === label;
                  return (
                    <label
                      key={key}
                      className={`relative flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm"
                          : "border-gray-200 hover:border-amber-300 hover:bg-gray-50"
                      }`}
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
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-amber-500" : "border-gray-400"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        )}
                      </div>
                      <span className="font-bold text-lg">{label}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 右側：訂單摘要 */}
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
                      <div className="block relative w-[90px] h-[90px] aspect-square flex-shrink-0 rounded-lg hover:opacity-90 transition-opacity bg-gray-50 border border-gray-100">
                        <Image
                          src={it.img || "/images/placeholder.png"}
                          alt={it.name || "Beer"}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/product/${it.slug || it.id}`}
                            className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-amber-600 transition-colors"
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
                          <div className="flex items-center border border-gray-200 rounded-md bg-white">
                            <button
                              onClick={() => handleUpdateQty(it.id, -1)}
                              disabled={it.qty <= 1}
                              className="p-1 px-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-semibold px-2 min-w-[24px] text-center">
                              {it.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(it.id, 1)}
                              className="p-1 px-2 text-gray-600 hover:bg-gray-100 transition"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-sm font-bold text-gray-900">
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
                {/* 自取免運費 */}
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Shipping</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                      Pickup
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">Free</span>
                </div>
                {orderSummary.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t.tax}</span>
                    <span className="font-medium text-gray-900">
                      {t.currency}
                      {formatPrice(orderSummary.taxAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-gray-900">
                    {t.total}
                  </span>
                  <span className="font-bold text-2xl text-amber-600">
                    <span className="text-sm font-normal text-gray-500 mr-1">
                      {t.currency}
                    </span>
                    {formatPrice(orderSummary.total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || cart.length === 0}
                className={`mt-8 w-full py-4 rounded-xl font-bold text-white transition-all duration-200 shadow-lg shadow-amber-500/20 flex justify-center items-center gap-2 ${
                  placing || cart.length === 0
                    ? "bg-gray-400 cursor-not-allowed opacity-80"
                    : "bg-amber-500 hover:bg-amber-600 hover:shadow-xl active:transform active:scale-[0.98]"
                }`}
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
          </aside>
        </div>
      </main>
    </Layout>
  );
}
