"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "./Layout";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";

/* =================== Helper: 工具函式 =================== */

const getCartName = (item, locale) => {
  if (!item) return "";
  const isEn = locale === "en";
  if (isEn && item.name_en) return item.name_en;
  if (!isEn && item.name_zh) return item.name_zh;
  return item.name || "";
};

// --- [修改 1] 更新數學計算函式：保留兩位小數，而不是轉成整數 ---
const roundPrice = (num) => {
  const n = Number(num) || 0;
  return Math.round(n * 100) / 100;
};

// --- [修改 2] 新增顯示格式化函式：強制顯示兩位小數 (例如 100.00) ---
const formatPrice = (num) => {
  return (Number(num) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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
  // ... (翻譯內容保持不變，為節省篇幅省略)
  "zh-TW": {
    title_contact: "聯絡資訊",
    title_recipient: "收件人",
    title_area: "外送地區",
    title_payment: "付款方式",
    title_summary: "訂單摘要",
    label_email: "Email",
    label_name: "姓名",
    label_phone: "電話",
    label_address: "地址（街道、門牌、城市、郵遞區號）",
    logged_in_as: "以",
    logged_in_suffix: "身份登入。",
    use_diff_contact: "使用不同聯絡人（允許修改 Email）",
    shipping_fee: "運費",
    tax: "稅",
    free_shipping_over: "滿 CA$",
    free_shipping_suffix: " 免運",
    subtotal: "小計",
    total: "總計",
    empty_cart: "目前沒有商品",
    place_order: "確認下單",
    placing_order: "建立訂單中…",
    alerts: {
      empty_cart: "購物車為空",
      email_required: "Email 必填",
      info_required: "請填寫姓名與電話",
      payment_required: "請選擇付款方式",
      area_required: "請選擇外送地區",
      address_required: "請輸入詳細地址",
      min_order: "訂單必須滿 80 才能運送",
      error: "下單發生錯誤：",
    },
    payment_methods: {
      cod: "貨到付款",
      credit: "信用卡",
      transfer: "銀行轉帳",
      linepay: "LINE Pay",
    },
    currency: "CA$",
  },
  en: {
    title_contact: "Contact Info",
    title_recipient: "Recipient",
    title_area: "Delivery Area",
    title_payment: "Payment Method",
    title_summary: "Order Summary",
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
    alerts: {
      empty_cart: "Cart is empty",
      email_required: "Email is required",
      info_required: "Name and Phone are required",
      payment_required: "Please select a payment method",
      area_required: "Please select a delivery area",
      address_required: "Please enter detailed address",
      min_order: "Minimum order amount is $80",
      error: "Order failed: ",
    },
    payment_methods: {
      cod: "Cash on Delivery",
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

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    deliveryArea: "",
    deliveryAddress: "",
    payment: "",
  });

  /* ------------------ Subscriptions ------------------ */
  useEffect(() => {
    cartStore.init();
    const unsubCart = cartStore.subscribe((c) => setCart([...c]));
    authStore.init?.();
    const unsubAuth = authStore.subscribe((s) => setAuth({ ...s }));
    return () => {
      unsubCart();
      unsubAuth();
    };
  }, []);

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

  /* ------------------ Logic: 購物車操作 ------------------ */
  const updateCartStore = (newCart) => {
    if (cartStore.set) {
      cartStore.set(newCart);
    } else {
      console.warn("Please implement cartStore update logic here");
    }
  };

  const handleUpdateQty = (itemId, change) => {
    const newCart = cart.map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(1, (item.qty || 1) + change);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(newCart);
    updateCartStore(newCart);
  };

  const handleRemoveItem = (itemId) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    const newCart = cart.filter((item) => item.id !== itemId);
    setCart(newCart);
    updateCartStore(newCart);
  };

  /* ------------------ Logic: 金額計算 ------------------ */
  const orderSummary = useMemo(() => {
    // [修改 3] 計算時不先 Round 成整數，保留精度
    const rawSubtotal = cart.reduce(
      (sum, it) => sum + Number(it.price || 0) * (it.qty || 0),
      0
    );
    const subtotal = roundPrice(rawSubtotal); // 現在 roundPrice 會保留 2 位小數

    const selectedArea = AREAS.find((a) => a.value === form.deliveryArea);
    let shippingFee = selectedArea?.fee || 0;

    if (selectedArea && subtotal >= selectedArea.freeThreshold) {
      shippingFee = 0;
    }

    const taxRate = selectedArea?.tax || 0;
    const rawTax = (subtotal * taxRate) / 100;
    const taxAmount = roundPrice(rawTax);
    const total = roundPrice(subtotal + shippingFee + taxAmount);

    return { subtotal, shippingFee, taxAmount, total, selectedArea };
  }, [cart, form.deliveryArea]);

  /* ------------------ Logic: 下單 ------------------ */
  const handleChange = useCallback(
    (key) => (e) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
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
      if (!form.deliveryArea) return alert(t.alerts.area_required);
      if (!form.deliveryAddress.trim()) return alert(t.alerts.address_required);
      if (orderSummary.subtotal < 80) return alert(t.alerts.min_order);

      const areaLabel =
        orderSummary.selectedArea?.label || form.deliveryArea || "";
      const fullAddress = `${areaLabel} ${form.deliveryAddress}`.trim();

      setPlacing(true);

      const payload = {
        cart,
        shipping_fee: orderSummary.shippingFee,
        tax: orderSummary.taxAmount,
        form: { ...form, email: emailToUse, deliveryAddress: fullAddress },
        customerId: auth?.user?.id || auth?.user?.ID || 0,
      };

      const resp = await fetch("/api/wc/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(
          data?.detail?.message || data?.message || "Order Failed"
        );
      }

      const orderId = data.order?.id;
      if (!orderId) throw new Error("No Order ID returned");

      cartStore.clear?.();
      router.push(`/thank-you?id=${orderId}`);
    } catch (err) {
      console.error(err);
      alert(t.alerts.error + (err?.message || String(err)));
    } finally {
      setPlacing(false);
    }
  }, [cart, form, auth, useDifferentContact, orderSummary, router, t]);

  /* ------------------ Structured Data (JSON-LD) ------------------ */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.place_order,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: process.env.NEXT_PUBLIC_SITE_URL || "https://yourwebsite.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Checkout",
          item: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://yourwebsite.com"
          }/checkout`,
        },
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "Your Store Name",
      logo: {
        "@type": "ImageObject",
        url: "https://yourwebsite.com/logo.png",
      },
    },
  };

  return (
    <Layout>
      <Head>
        <title>{t.place_order} | Checkout</title>
        <meta name="robots" content="noindex, nofollow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <main className="min-h-screen py-10 bg-gray-50 pt-[100px]">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：表單區域 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

            <section className="mb-8">
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
                      className={`flex justify-between items-center gap-3 p-4 cursor-pointer transition-colors ${
                        isSelected ? "bg-amber-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-black" : "border-gray-300"
                          }`}
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
                          className={`font-medium ${
                            isSelected ? "text-black" : "text-gray-700"
                          }`}
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
                </div>
              )}
            </section>

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
                      className={`relative flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-black bg-gray-900 text-white shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                          isSelected ? "border-white" : "border-gray-400"
                        }`}
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
                            title="Remove item"
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

                          {/* [修改 4] 購物車單項金額顯示小數點兩位 */}
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

              {/* [修改 5] 價格計算區域：全部使用 formatPrice 顯示小數點兩位 */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal}</span>
                  <span className="font-medium text-gray-900">
                    {t.currency}
                    {formatPrice(orderSummary.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.shipping_fee}</span>
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
                className={`mt-8 w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg shadow-black/10 flex justify-center items-center gap-2
                  ${
                    placing
                      ? "bg-gray-800 cursor-wait opacity-80"
                      : "bg-black hover:bg-gray-800 hover:shadow-xl active:transform active:scale-[0.98]"
                  }`}
              >
                {placing && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
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
