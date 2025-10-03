// pages/thank-you.jsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "./Layout";

export default function ThankYouPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const resp = await fetch(`/api/wc/order?id=${id}`);
        const data = await resp.json();
        if (!resp.ok || !data?.id) {
          setError(data?.message || "讀取訂單失敗");
        } else {
          setOrder(data);
        }
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [id]);

  return (
    <Layout>
      <main className="max-w-4xl mx-auto py-16 px-6 text-center">
        <h1 className="text-3xl font-bold mb-6">感謝您的訂購！</h1>

        {!id && <p className="text-gray-500">缺少訂單編號</p>}
        {error && <p className="text-red-600">{error}</p>}

        {order ? (
          <div className="bg-white shadow rounded-lg p-6 mt-6 text-left">
            <h2 className="text-xl font-semibold mb-4">
              訂單編號：#{order.number || order.id}
            </h2>
            <p className="mb-2">下單日期：{order.date_created}</p>
            <p className="mb-2">付款方式：{order.payment_method_title}</p>
            <p className="mb-2">總金額：NT${order.total}</p>

            <h3 className="mt-6 font-bold">收件資訊</h3>
            <p>
              {order.billing.first_name} {order.billing.last_name}
            </p>
            <p>{order.billing.address_1}</p>
            <p>{order.billing.phone}</p>
            <p>{order.billing.email}</p>

            <h3 className="mt-6 font-bold">商品清單</h3>
            <ul className="list-disc ml-6">
              {order.line_items?.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity} — NT${item.total}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !error && <p className="text-gray-500">讀取中…</p>
        )}

        <div className="mt-12 text-lg text-gray-700">
          <p>我們已經收到您的訂單，將盡快為您處理。</p>
          <p className="mt-2">
            若有任何問題，請隨時聯絡我們的客服，或回到{" "}
            <a href="/" className="text-blue-600 underline">
              首頁
            </a>
            瀏覽更多商品。
          </p>
        </div>
      </main>
    </Layout>
  );
}
