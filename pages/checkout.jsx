// pages/checkout/index.jsx  或 pages/CheckoutPage.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { cartStore } from "@/lib/cartStore";
import Layout from "./Layout";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);

  const [areas, setAreas] = useState([]); // 外送地區
  const [slots, setSlots] = useState([]); // 外送時段
  const [loadErr, setLoadErr] = useState("");

  const [form, setForm] = useState({
    email: "",
    subscribe: false,
    name: "",
    phone: "",
    address: "",
    wechat: "",
    contactOther: "",
    payment: "",
    deliveryArea: "",
    deliverySlot: "",
  });

  useEffect(() => {
    cartStore.init();
    const unsub = cartStore.subscribe((c) => setCart([...c]));
    return unsub;
  }, []);

  // 讀地區/時段
  useEffect(() => {
    (async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          fetch("/api/memory/delivery-areas"),
          fetch("/api/memory/delivery-slots"),
        ]);
        const [aData, sData] = await Promise.all([aRes.json(), sRes.json()]);

        if (Array.isArray(aData)) setAreas(aData);
        if (Array.isArray(sData)) setSlots(sData);
        if (!Array.isArray(aData) || !Array.isArray(sData)) {
          setLoadErr("外送地區/時段載入失敗，將使用預設選項。");
        }
      } catch (e) {
        setLoadErr("外送地區/時段載入失敗（網路錯誤）。");
      }
    })();
  }, []);

  const subtotal = cart.reduce(
    (sum, it) => sum + Number(it.price || 0) * (it.qty || 0),
    0
  );

  const onChange = (key) => (e) =>
    setForm((v) => ({
      ...v,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  async function handlePlaceOrder() {
    if (!cart.length) return alert("購物車為空");
    if (!form.name || !form.phone || !form.address || !form.email)
      return alert("請填寫姓名、電話、地址、Email");
    if (!form.payment) return alert("請選擇付款方式");
    // 必填可自行調整
    if (!form.deliveryArea) return alert("請選擇外送地區");
    if (!form.deliverySlot) return alert("請選擇外送日期/時段");

    setPlacing(true);
    try {
      const resp = await fetch("/api/wc/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, form }),
      });
      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        const msg = json?.detail?.message || json?.message || "Woo 無回應";
        return alert("下單失敗：" + msg);
      }

      const order = json.order;
      cartStore.clear && cartStore.clear();
      router.push(`/thank-you?id=${order.id}`);
    } catch (e) {
      console.error(e);
      alert("下單發生錯誤，請稍後再試");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <Layout>
      <main className="min-h-screen py-20 bg-gray-50">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左：表單 */}
          <div className="bg-white p-6 shadow-sm">
            {loadErr && (
              <p className="mb-3 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                {loadErr}
              </p>
            )}

            {/* 聯絡資訊 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">聯絡資訊</h3>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange("email")}
                className="w-full border rounded-lg px-3 py-2 mb-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.subscribe}
                  onChange={onChange("subscribe")}
                />
                訂閱最新優惠與消息
              </label>
            </div>

            {/* 收件資訊 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">收件資訊</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="姓名"
                  value={form.name}
                  onChange={onChange("name")}
                  className="border rounded-lg px-3 py-2 col-span-2"
                />
                <input
                  placeholder="電話"
                  value={form.phone}
                  onChange={onChange("phone")}
                  className="border rounded-lg px-3 py-2 col-span-2"
                />
                <input
                  placeholder="地址"
                  value={form.address}
                  onChange={onChange("address")}
                  className="border rounded-lg px-3 py-2 col-span-2"
                />
                <input
                  placeholder="WeChat（選填）"
                  value={form.wechat}
                  onChange={onChange("wechat")}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  placeholder="其他聯絡資訊"
                  value={form.contactOther}
                  onChange={onChange("contactOther")}
                  className="border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* 外送地區 / 日期時段 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">外送地區 / 日期時段</h3>

              <select
                value={form.deliveryArea}
                onChange={onChange("deliveryArea")}
                className="mb-3 w-full rounded-lg border px-3 py-2"
              >
                <option value="">選擇外送地區</option>
                {areas.map((a, i) => (
                  <option key={i} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <select
                value={form.deliverySlot}
                onChange={onChange("deliverySlot")}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">近期外送日期</option>
                {slots.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                若列表為空，請回後台「外送時段 / 地區」填寫，或重新整理以載入。
              </p>
            </div>

            {/* 付款方式 */}
            <div>
              <h3 className="font-semibold mb-2">付款方式</h3>
              <div className="flex flex-col gap-2">
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
            </div>
          </div>

          {/* 右：摘要 */}
          <aside className="bg-white p-6 shadow-sm h-fit">
            <h3 className="font-semibold mb-4">訂單摘要</h3>

            {cart.length === 0 ? (
              <p className="text-gray-500">目前沒有商品</p>
            ) : (
              <ul className="divide-y mb-4">
                {cart.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 py-3">
                    <Image
                      src={it.img}
                      alt={it.name}
                      width={400}
                      height={400}
                      className="rounded max-w-[150px] border object-contain"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">
                        數量：{it.qty}
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

            {/* 總價 + 額外資訊 */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>小計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>運費</span>
                <span>依配送計算</span>
              </div>
              <div className="flex justify-between">
                <span>外送地區</span>
                <span>{form.deliveryArea || "尚未選擇"}</span>
              </div>
              <div className="flex justify-between">
                <span>外送日期/時段</span>
                <span>{form.deliverySlot || "尚未選擇"}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>總計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="mt-6 w-full bg-black text-white py-3 rounded-lg disabled:opacity-60"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? "建立訂單中…" : "確認下單"}
            </button>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
