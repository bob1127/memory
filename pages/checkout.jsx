"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { cartStore } from "@/lib/cartStore";
import Layout from "./Layout";
import { Minus, Plus, Trash2 } from "lucide-react";

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

  // 是否開啟偵錯面板（網址帶 ?debug=1）
  const DEBUG =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";
  const [logs, setLogs] = useState([]);
  const dlog = (label, obj) => {
    const item = { ts: new Date().toISOString(), label, data: obj };
    console.log("[CHECKOUT]", label, obj);
    setLogs((prev) => [...prev, item]);
  };

  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);

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
    deliveryAddress: "",
  });

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

  /* === 根據地區選擇計算運費＋稅金 === */
  const selectedArea = AREAS.find((a) => a.value === form.deliveryArea);
  let shippingFee = selectedArea?.fee || 0;
  const taxRate = selectedArea?.tax || 0;
  if (selectedArea && subtotal >= selectedArea.freeThreshold) shippingFee = 0;

  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + shippingFee + taxAmount;

  // onChange
  const onChange = (key) => (e) => {
    const v =
      e?.target?.type === "checkbox"
        ? !!e.target.checked
        : e?.target?.value ?? "";
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  async function handlePlaceOrder() {
    try {
      // === 前置驗證 ===
      if (!cart.length) return alert("購物車為空");
      if (!form.name || !form.phone || !form.email)
        return alert("請填寫姓名、電話、Email");
      if (!form.payment) return alert("請選擇付款方式");
      if (!form.deliveryArea) return alert("請選擇外送地區");
      if (!form.deliveryAddress.trim()) return alert("請輸入詳細地址");
      if (subtotal < 80) return alert("訂單必須滿 80 才能運送");

      const areaLabel = selectedArea?.label || form.deliveryArea || "";
      const fullAddress = `${areaLabel} ${form.deliveryAddress}`.trim();

      setPlacing(true);

      // === 呼叫 create-order（後端會負責送 WhatsApp 範本）===
      const t0 = performance.now();
      dlog("create-order.request", {
        cartCount: cart.length,
        formPreview: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          payment: form.payment,
          deliveryArea: form.deliveryArea,
        },
        shipping_fee: shippingFee,
        tax: taxAmount,
      });

      const resp = await fetch("/api/wc/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          form: { ...form, address: fullAddress, subtotal },
          shipping_fee: shippingFee,
          tax: taxAmount,
        }),
      }).catch((err) => {
        dlog("create-order.network-error", String(err));
        throw err;
      });

      const rawText = await resp.text(); // 先抓 raw 以便除錯
      let json = {};
      try {
        json = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        dlog("create-order.json-parse-failed", { rawText });
        throw new Error("create-order 回傳非 JSON，請看 console");
      }

      dlog("create-order.response", {
        status: resp.status,
        ok: resp.ok,
        elapsedMs: Math.round(performance.now() - t0),
        json,
      });

      if (!resp.ok || !json?.ok) {
        const msg =
          json?.detail?.message || json?.message || `HTTP ${resp.status}`;
        alert("下單失敗：" + msg);
        return;
      }

      // === 顯示 WA 發送結果（staff/customer）===
      if (json.whatsapp) {
        const report = JSON.stringify(json.whatsapp, null, 2);
        dlog("whatsapp.results", json.whatsapp);
        alert("WhatsApp 發送結果：\n" + report);
      } else {
        dlog("whatsapp.results", "後端未回傳 whatsapp 欄位");
      }

      const order = json.order;
      cartStore.clear?.();
      router.push(`/thank-you?id=${order.id}`);
    } catch (e) {
      console.error(e);
      dlog("handlePlaceOrder.error", String(e?.message || e));
      alert("下單發生錯誤：" + (e?.message || e));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <Layout>
      <main className="min-h-screen py-10 bg-gray-50 pt-[100px]">
        <div className="mx-auto w-[min(1200px,95vw)] grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：表單 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* 聯絡資訊 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">聯絡資訊</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange("email")}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/10"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.subscribe}
                    onChange={onChange("subscribe")}
                  />
                  訂閱最新優惠與消息
                </label>
              </div>
            </section>

            {/* 收件人 */}
            <section className="mb-8">
              <h3 className="font-semibold text-lg mb-3">收件人</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="姓名"
                  value={form.name}
                  onChange={onChange("name")}
                  className="border rounded-lg px-3 py-2 col-span-2 focus:ring-2 focus:ring-black/10"
                />
                <input
                  placeholder="電話"
                  value={form.phone}
                  onChange={onChange("phone")}
                  className="border rounded-lg px-3 py-2 col-span-2 focus:ring-2 focus:ring-black/10"
                />
                <input
                  placeholder="WeChat（選填）"
                  value={form.wechat}
                  onChange={onChange("wechat")}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/10"
                />
                <input
                  placeholder="其他聯絡資訊"
                  value={form.contactOther}
                  onChange={onChange("contactOther")}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black/10"
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
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 cursor-pointer transition ${
                      form.deliveryArea === a.value
                        ? "bg-yellow-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery-area"
                        checked={form.deliveryArea === a.value}
                        onChange={() =>
                          setForm((v) => ({ ...v, deliveryArea: a.value }))
                        }
                      />
                      <span className="text-[15px] font-medium">{a.label}</span>
                    </div>
                    <div className="ml-auto text-sm text-gray-600">
                      運費 NT${a.fee} ・ 稅 {a.tax}%
                      <span className="block text-xs text-gray-500">
                        滿 NT${a.freeThreshold} 免運
                      </span>
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
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition ${
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
                  <li key={it.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={it.img}
                        alt={it.name}
                        width={400}
                        height={400}
                        className="rounded max-w-[110px] border object-contain bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-2">
                          {it.name}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-black/5"
                            onClick={() =>
                              cartStore.setQty(
                                it.id,
                                Math.max(1, (it.qty || 1) - 1)
                              )
                            }
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            className="h-8 w-14 rounded-lg border text-center text-sm"
                            value={it.qty}
                            onChange={(e) =>
                              cartStore.setQty(
                                it.id,
                                Math.max(1, parseInt(e.target.value || "1"))
                              )
                            }
                          />
                          <button
                            className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-black/5"
                            onClick={() =>
                              cartStore.setQty(it.id, (it.qty || 1) + 1)
                            }
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            className="ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => cartStore.remove(it.id)}
                          >
                            <Trash2 size={14} />
                            刪除
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">
                        NT$
                        {(
                          Number(it.price || 0) * (it.qty || 0)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* 概覽 */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>小計</span>
                <span>NT$ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>運費</span>
                <span>NT$ {shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>稅金</span>
                <span>NT$ {taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>總計</span>
                <span>NT$ {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="mt-6 w-full bg-black text-white py-3 rounded-lg disabled:opacity-60 hover:opacity-90"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? "建立訂單中…" : "確認下單"}
            </button>
          </aside>
        </div>

        {/* 偵錯面板：網址加 ?debug=1 才會顯示 */}
        {DEBUG && (
          <div className="fixed bottom-2 left-2 right-2 max-h-[40vh] overflow-auto rounded-lg border bg-white/95 shadow-lg text-[12px]">
            <div className="px-3 py-2 font-semibold border-b bg-gray-50">
              Debug Logs
            </div>
            <pre className="p-3 whitespace-pre-wrap">
              {logs.map(
                (l, i) =>
                  `#${i + 1} [${l.ts}] ${l.label}\n${JSON.stringify(
                    l.data,
                    null,
                    2
                  )}\n\n`
              )}
            </pre>
          </div>
        )}
      </main>
    </Layout>
  );
}
