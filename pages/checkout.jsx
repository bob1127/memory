"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cartStore } from "@/lib/cartStore";
import Layout from "./Layout";
export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    email: "",
    subscribe: false,
    name: "",
    phone: "",
    address: "",
    wechat: "",
    contactOther: "",
    payment: "",
  });

  useEffect(() => {
    cartStore.init();
    const unsub = cartStore.subscribe((c) => setCart([...c]));
    return unsub;
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

  return (
    <Layout>
      <main className="min-h-screen py-20 bg-gray-50 ">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：資訊 */}
          <div className="bg-white p-6  shadow-sm">
            {/* 快速付款 */}

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

          {/* 右側：訂單摘要 */}
          <aside className="bg-white p-6  shadow-sm h-fit">
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
                      NT${" "}
                      {(Number(it.price || 0) * (it.qty || 0)).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* 總價 */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>小計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>運費</span>
                <span>依配送計算</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>總計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button className="mt-6 w-full bg-black text-white py-3 rounded-lg">
              確認下單
            </button>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
