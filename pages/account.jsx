// pages/account.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import dayjs from "dayjs";
import Layout from "../pages/Layout";
import "dayjs/locale/zh-tw";
dayjs.locale("zh-tw");

// 你現有的 authStore，沿用它的 user 狀態（需含 email / id 等）
import { authStore } from "@/lib/authStore";

export default function AccountPage() {
  const [auth, setAuth] = useState(authStore.get());
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  // 表單（僅示範 email，可擴充 first_name/last_name/billing/shipping）
  const [email, setEmail] = useState("");

  useEffect(() => {
    authStore.init?.();
    const unsub = authStore.subscribe((s) => setAuth({ ...s }));
    return unsub;
  }, []);

  const emailFromAuth = auth?.user?.email || "";
  const idFromAuth = auth?.user?.id || auth?.user?.ID || "";

  async function fetchProfileAndOrders() {
    try {
      setErr("");
      setLoading(true);
      const q = idFromAuth
        ? `id=${encodeURIComponent(idFromAuth)}`
        : `email=${encodeURIComponent(emailFromAuth)}`;

      // GET Profile
      const pRes = await fetch(`/api/account/me?${q}`, { cache: "no-store" });
      const pJson = await pRes.json();
      if (!pJson.ok) throw new Error(pJson.error || "取得會員資料失敗");
      setProfile(pJson.data);
      setEmail(pJson.data?.email || emailFromAuth || "");

      // GET Orders
      const oRes = await fetch(
        `/api/account/orders?${
          idFromAuth
            ? `customerId=${idFromAuth}`
            : `email=${encodeURIComponent(emailFromAuth)}`
        }`,
        { cache: "no-store" }
      );
      const oJson = await oRes.json();
      if (!oJson.ok) throw new Error(oJson.error || "取得訂單失敗");
      setOrders(Array.isArray(oJson.data) ? oJson.data : []);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!emailFromAuth && !idFromAuth) {
      setLoading(false);
      return;
    }
    fetchProfileAndOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromAuth, idFromAuth]);

  async function saveEmail() {
    if (!profile?.id) return;
    try {
      setErr("");
      setLoading(true);
      const res = await fetch(`/api/account/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.id, email }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "更新失敗");
      setProfile(json.data);
      // 如果你希望 authStore 也同步：
      authStore.patch?.({
        user: { ...(auth.user || {}), email: json.data.email },
      });
      alert("Email 已更新");
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  if (!auth?.user) {
    return (
      <Layout className="">
        <div className="!bg-[#f6f1ec] min-h-screen flex justify-center items-center">
          <Head>
            <title>我的帳戶｜請先登入</title>
          </Head>
          <div className="max-w-3xl mx-auto !bg-[#f6f1ec] px-4 py-16">
            <h1 className="text-2xl font-bold mb-4">我的帳戶</h1>
            <p className="mb-6 text-gray-600">
              請先登入以查看會員資料與訂單紀錄。
            </p>
            <button
              className="rounded-xl bg-black px-4 py-2 text-white"
              onClick={() => {
                // 你 Navbar 已有彈窗，這裡可導向首頁叫他打開或你也可觸發全局事件
                window.location.href = "/";
              }}
            >
              回首頁登入
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="">
      <Head>
        <title>我的帳戶｜有香 Memory Corner</title>
      </Head>
      <div className="!bg-[#f6f1ec] min-h-screen flex justify-center items-center">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold">我的帳戶</h1>
          <p className="text-gray-600 mt-1">
            嗨，{auth.user.displayName || auth.user.name || auth.user.email}
          </p>

          {err && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-600">
              {err}
            </div>
          )}

          {loading ? (
            <div className="mt-8">載入中…</div>
          ) : (
            <>
              {/* 會員資料 */}
              <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">帳戶資料</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600">
                        會員編號
                      </label>
                      <div className="mt-1 font-mono text-sm">
                        {profile?.id ?? "-"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600">
                        Email
                      </label>
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
                        onClick={saveEmail}
                      >
                        儲存變更
                      </button>
                      <button
                        className="rounded-lg border px-4 py-2"
                        onClick={() => setEmail(profile?.email || "")}
                      >
                        還原
                      </button>
                    </div>
                  </div>
                </div>

                {/* 可擴充：寄送/帳單地址等 */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">帳單/寄送地址</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    （此範例先省略編輯；若要同步 WooCommerce，可用 PUT
                    /customers/
                    {`{id}`} 的 billing/shipping）
                  </p>
                </div>
              </section>

              {/* 訂單紀錄 */}
              <section className="mt-10">
                <h2 className="text-lg font-semibold">訂單紀錄</h2>

                {orders.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed p-6 text-gray-600">
                    尚無訂單
                  </div>
                ) : (
                  <div className="mt-4 space-y-6">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm"
                      >
                        {/* 訂單頭 */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="text-base font-semibold">
                              # {o.number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {dayjs(o.date_created).format("YYYY/MM/DD HH:mm")}
                            </div>
                            <span className="ml-2 rounded-full border px-2 py-0.5 text-xs capitalize">
                              {o.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">總計</div>
                            <div className="text-lg font-bold">
                              {o.total} {o.currency}
                            </div>
                          </div>
                        </div>

                        {/* 商品列 */}
                        <div className="divide-y">
                          {(o.line_items || []).map((li) => (
                            <div
                              key={li.id}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-white">
                                {/* 後端已補 .image，沒有就顯示占位 */}
                                {li.image ? (
                                  <img
                                    src={li.image}
                                    alt={li.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">
                                  {li.name}
                                </div>
                                {li.variation && (
                                  <div className="mt-0.5 text-xs text-gray-500">
                                    {Object.values(li.variation)
                                      .filter(Boolean)
                                      .join(" / ")}
                                  </div>
                                )}
                                <div className="mt-1 text-xs text-gray-600">
                                  單價：{li.price} {o.currency}
                                </div>
                              </div>

                              <div className="text-sm text-gray-600">
                                × {li.quantity}
                              </div>

                              <div className="w-24 text-right text-sm font-semibold">
                                {li.total} {o.currency}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 地址 / 備註（可選） */}
                        <div className="grid gap-4 border-t bg-gray-50 px-4 py-3 text-sm sm:grid-cols-2">
                          {/* 帳單地址 */}
                          <div>
                            <div className="text-gray-500">帳單地址</div>

                            <div className="text-gray-700">
                              {[
                                o?.billing?.address_1,
                                o?.billing?.address_2,
                                [o?.billing?.city, o?.billing?.state]
                                  .filter(Boolean)
                                  .join(" "),
                                o?.billing?.postcode,
                                o?.billing?.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                            <div className="text-gray-600">
                              {o?.billing?.email} ・ {o?.billing?.phone}
                            </div>
                          </div>

                          {/* 寄送地址 */}
                          <div>
                            <div className="text-gray-500">寄送地址</div>

                            <div className="text-gray-700">
                              {[
                                o?.shipping?.address_1,
                                o?.shipping?.address_2,
                                [o?.shipping?.city, o?.shipping?.state]
                                  .filter(Boolean)
                                  .join(" "),
                                o?.shipping?.postcode,
                                o?.shipping?.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
