"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "./Layout";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";

/* =================== Helper: 取得多語言商品名稱 =================== */
const getCartName = (item, locale) => {
  if (!item) return "";
  const isEn = locale === "en";
  if (isEn && item.name_en) return item.name_en;
  if (!isEn && item.name_zh) return item.name_zh;
  return item.name || "";
};

/* =================== 翻譯資料庫 =================== */
const CHECKOUT_TRANSLATIONS = {
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

/* === 固定加拿大地區、運費與稅率 === */
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

export default function CheckoutPage() {
  const router = useRouter();
  const { locale } = router;
  const t = CHECKOUT_TRANSLATIONS[locale] || CHECKOUT_TRANSLATIONS["zh-TW"];

  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);

  /* ------------------ 購物車 ------------------ */
  useEffect(() => {
    cartStore.init();
    const unsub = cartStore.subscribe((c) => setCart([...c]));
    return unsub;
  }, []);
  const subtotal = useMemo(
    () =>
      cart.reduce((sum, it) => sum + Number(it.price || 0) * (it.qty || 0), 0),
    [cart]
  );

  /* ------------------ 登入會員 ------------------ */
  const [auth, setAuth] = useState(authStore.get());
  useEffect(() => {
    authStore.init?.();
    const unsub = authStore.subscribe((s) => setAuth({ ...s }));
    return unsub;
  }, []);

  /* ------------------ 表單 ------------------ */
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    deliveryArea: "",
    deliveryAddress: "",
    payment: "",
  });

  const [useDifferentContact, setUseDifferentContact] = useState(false);

  // 登入時自動帶入會員資料
  useEffect(() => {
    if (!auth?.user) return;
    const firstName =
      auth.user.billing?.first_name ||
      auth.user.first_name ||
      auth.user.displayName ||
      auth.user.name ||
      "";
    const lastName = auth.user.billing?.last_name || auth.user.last_name || "";
    const phone = auth.user.billing?.phone || auth.user.phone || "";
    const email = auth.user.email || auth.user.user_email || "";
    const address = auth.user.billing?.address_1 || "";

    setForm((v) => ({
      ...v,
      name: [firstName, lastName].filter(Boolean).join(" "),
      phone,
      email,
      deliveryAddress: address || v.deliveryAddress,
    }));
  }, [auth?.user]);

  /* ------------------ 運費與稅 ------------------ */
  const selectedArea = AREAS.find((a) => a.value === form.deliveryArea);
  let shippingFee = selectedArea?.fee || 0;
  const taxRate = selectedArea?.tax || 0;
  if (selectedArea && subtotal >= selectedArea.freeThreshold) shippingFee = 0;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + shippingFee + taxAmount;

  const onChange = (key) => (e) => {
    const v =
      e?.target?.type === "checkbox"
        ? !!e.target.checked
        : e?.target?.value ?? "";
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  /* ------------------ 建立訂單 ------------------ */
  async function handlePlaceOrder() {
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
      if (subtotal < 80) return alert(t.alerts.min_order);

      const areaLabel = selectedArea?.label || form.deliveryArea || "";
      const fullAddress = `${areaLabel} ${form.deliveryAddress}`.trim();

      setPlacing(true);

      const customerId = auth?.user?.id || auth?.user?.ID || 0;

      const payload = {
        cart,
        shipping_fee: shippingFee,
        tax: taxAmount,
        form: {
          ...form,
          email: emailToUse,
          deliveryAddress: fullAddress,
        },
        customerId,
      };

      const resp = await fetch("/api/wc/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        const msg = data?.detail?.message || data?.message || "Order Failed";
        alert(msg);
        console.error("create-order failed:", data);
        return;
      }

      const orderId = data.order?.id;
      if (!orderId) throw new Error("No Order ID returned");
      cartStore.clear?.();
      router.push(`/thank-you?id=${orderId}`);
    } catch (err) {
      console.error(err);
      alert(t.alerts.error + (err?.message || err));
    } finally {
      setPlacing(false);
    }
  }

  /* ------------------ UI ------------------ */
  return (
    <Layout>
      <main className="min-h-screen py-10 bg-gray-50 pt-[100px]">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：表單 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {auth?.user && (
              <div className="mb-4 rounded-lg border bg-emerald-50 px-3 py-2 text-sm">
                {t.logged_in_as}{" "}
                <b>{auth.user.email || auth.user.user_email}</b>{" "}
                {t.logged_in_suffix}
                <label className="ml-3 inline-flex items-center gap-2 cursor-pointer mt-1 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={useDifferentContact}
                    onChange={(e) => setUseDifferentContact(e.target.checked)}
                  />
                  {t.use_diff_contact}
                </label>
              </div>
            )}

            {/* 聯絡資訊 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">{t.title_contact}</h3>
              <input
                type="email"
                placeholder={t.label_email}
                value={form.email}
                onChange={onChange("email")}
                className="w-full border rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                disabled={!!auth?.user && !useDifferentContact}
              />
            </section>

            {/* 收件人 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">
                {t.title_recipient}
              </h3>
              <div className="space-y-3">
                <input
                  placeholder={t.label_name}
                  value={form.name}
                  onChange={onChange("name")}
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  placeholder={t.label_phone}
                  value={form.phone}
                  onChange={onChange("phone")}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            </section>

            {/* 外送地區 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">{t.title_area}</h3>
              <div className="rounded-xl border divide-y overflow-hidden">
                {AREAS.map((a) => (
                  <label
                    key={a.value}
                    className={`flex justify-between items-center gap-2 p-3 cursor-pointer transition ${
                      form.deliveryArea === a.value
                        ? "bg-yellow-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="delivery-area"
                        checked={form.deliveryArea === a.value}
                        onChange={() =>
                          setForm((v) => ({ ...v, deliveryArea: a.value }))
                        }
                      />
                      {a.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t.shipping_fee} {t.currency}
                      {a.fee} ・ {t.tax} {a.tax}%
                      <div className="text-xs text-gray-500">
                        {t.free_shipping_over}
                        {a.freeThreshold}
                        {t.free_shipping_suffix}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {form.deliveryArea && (
                <input
                  placeholder={t.label_address}
                  value={form.deliveryAddress}
                  onChange={onChange("deliveryAddress")}
                  className="mt-3 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/10"
                />
              )}
            </section>

            {/* 付款方式 */}
            <section>
              <h3 className="font-semibold text-lg mb-3">{t.title_payment}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.keys(t.payment_methods).map((key) => {
                  const label = t.payment_methods[key];
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${
                        form.payment === label
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={form.payment === label}
                        onChange={() =>
                          setForm((v) => ({ ...v, payment: label }))
                        }
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* 右側：訂單摘要 */}
          <aside className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h3 className="font-semibold text-lg mb-4">{t.title_summary}</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">{t.empty_cart}</p>
            ) : (
              <ul className="divide-y mb-4">
                {cart.map((it) => (
                  <li
                    key={it.id}
                    className="py-3 flex justify-between items-center gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={it.img}
                        alt={it.name}
                        width={80}
                        height={80}
                        className="rounded border border max-w-[150px]"
                      />
                      <div>
                        {/* ✅ 顯示自動切換語言的名稱 */}
                        <div className="text-sm font-medium">
                          {getCartName(it, locale)}
                        </div>
                        <div className="text-xs text-gray-500">x {it.qty}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {t.currency}
                      {(Number(it.price || 0) * (it.qty || 0)).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>
                  {t.currency}
                  {subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.shipping_fee}</span>
                <span>
                  {t.currency}
                  {shippingFee}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.tax}</span>
                <span>
                  {t.currency}
                  {taxAmount}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>{t.total}</span>
                <span>
                  {t.currency}
                  {total}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="mt-6 w-full bg-black text-white py-3 rounded-lg disabled:opacity-60 hover:opacity-90"
            >
              {placing ? t.placing_order : t.place_order}
            </button>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
