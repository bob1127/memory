"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "./Layout";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartStore } from "@/lib/cartStore";
import { authStore } from "@/lib/authStore";

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
      if (!cart.length) return alert("購物車為空");
      const emailToUse =
        auth?.user && !useDifferentContact
          ? auth.user.email || auth.user.user_email
          : form.email;

      if (!emailToUse) return alert("Email 必填");
      if (!form.name || !form.phone) return alert("請填寫姓名與電話");
      if (!form.payment) return alert("請選擇付款方式");
      if (!form.deliveryArea) return alert("請選擇外送地區");
      if (!form.deliveryAddress.trim()) return alert("請輸入詳細地址");
      if (subtotal < 80) return alert("訂單必須滿 80 才能運送");

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
        const msg = data?.detail?.message || data?.message || "下單失敗";
        alert(msg);
        console.error("create-order failed:", data);
        return;
      }

      const orderId = data.order?.id;
      if (!orderId) throw new Error("未取得 WooCommerce 訂單 ID");
      cartStore.clear?.();
      router.push(`/thank-you?id=${orderId}`);
    } catch (err) {
      console.error(err);
      alert("下單發生錯誤：" + (err?.message || err));
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
                以 <b>{auth.user.email || auth.user.user_email}</b> 身份登入。
                <label className="ml-3 inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useDifferentContact}
                    onChange={(e) => setUseDifferentContact(e.target.checked)}
                  />
                  使用不同聯絡人（允許修改 Email）
                </label>
              </div>
            )}

            {/* 聯絡資訊 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">聯絡資訊</h3>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange("email")}
                className="w-full border rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-black/10 disabled:opacity-60"
                disabled={!!auth?.user && !useDifferentContact}
              />
            </section>

            {/* 收件人 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">收件人</h3>
              <div className="space-y-3">
                <input
                  placeholder="姓名"
                  value={form.name}
                  onChange={onChange("name")}
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  placeholder="電話"
                  value={form.phone}
                  onChange={onChange("phone")}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            </section>

            {/* 外送地區 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">外送地區</h3>
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
                      運費 NT${a.fee} ・ 稅 {a.tax}%
                      <div className="text-xs text-gray-500">
                        滿 NT${a.freeThreshold} 免運
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {form.deliveryArea && (
                <input
                  placeholder="地址（街道、門牌、城市、郵遞區號）"
                  value={form.deliveryAddress}
                  onChange={onChange("deliveryAddress")}
                  className="mt-3 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/10"
                />
              )}
            </section>

            {/* 付款方式 */}
            <section>
              <h3 className="font-semibold text-lg mb-3">付款方式</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {["貨到付款", "信用卡", "銀行轉帳", "LINE Pay"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${
                      form.payment === opt ? "border-black" : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={form.payment === opt}
                      onChange={() => setForm((v) => ({ ...v, payment: opt }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* 右側：訂單摘要 */}
          <aside className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h3 className="font-semibold text-lg mb-4">訂單摘要</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">目前沒有商品</p>
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
                        <div className="text-sm font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">x {it.qty}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      NT$
                      {(Number(it.price || 0) * (it.qty || 0)).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>小計</span>
                <span>NT${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>運費</span>
                <span>NT${shippingFee}</span>
              </div>
              <div className="flex justify-between">
                <span>稅金</span>
                <span>NT${taxAmount}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>總計</span>
                <span>NT${total}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="mt-6 w-full bg-black text-white py-3 rounded-lg disabled:opacity-60 hover:opacity-90"
            >
              {placing ? "建立訂單中…" : "確認下單"}
            </button>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
