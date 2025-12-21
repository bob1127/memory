// pages/account.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import "dayjs/locale/en";
import Layout from "../pages/Layout";
import { authStore } from "@/lib/authStore";

/* ========== 1. 設定網域 (使用環境變數) ========== */
const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* ========== 2. i18n 翻譯資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "我的帳戶 | 有香 Memory Corner",
      description: "管理您的個人資料、查看訂單紀錄與帳戶設定。",
    },
    auth: {
      title: "我的帳戶",
      not_logged_in: "請先登入以查看會員資料與訂單紀錄。",
      login_btn: "回首頁登入",
      hello: "嗨，",
    },
    profile: {
      title: "帳戶資料",
      id: "會員編號",
      email: "Email",
      save: "儲存變更",
      reset: "還原",
      success: "Email 已更新",
      error_update: "更新失敗",
    },
    billing: {
      title: "帳單/寄送地址",
      desc: "（此功能暫未開放編輯，請聯繫客服）",
    },
    orders: {
      title: "訂單紀錄",
      empty: "尚無訂單",
      total: "總計",
      status: {
        pending: "待付款",
        processing: "處理中",
        "on-hold": "保留中",
        completed: "已完成",
        cancelled: "已取消",
        refunded: "已退款",
        failed: "失敗",
      },
      unit_price: "單價：",
      billing_addr: "帳單地址",
      shipping_addr: "寄送地址",
      no_image: "No Image",
    },
    loading: "載入中...",
    error_fetch: "取得資料失敗",
  },
  en: {
    meta: {
      title: "My Account | Memory Corner",
      description:
        "Manage your profile, view order history and account settings.",
    },
    auth: {
      title: "My Account",
      not_logged_in: "Please log in to view your profile and orders.",
      login_btn: "Back to Home to Login",
      hello: "Hi, ",
    },
    profile: {
      title: "Account Details",
      id: "Member ID",
      email: "Email",
      save: "Save Changes",
      reset: "Reset",
      success: "Email updated",
      error_update: "Update failed",
    },
    billing: {
      title: "Billing / Shipping Address",
      desc: "(Editing is currently disabled, please contact support)",
    },
    orders: {
      title: "Order History",
      empty: "No orders found.",
      total: "Total",
      status: {
        pending: "Pending",
        processing: "Processing",
        "on-hold": "On Hold",
        completed: "Completed",
        cancelled: "Cancelled",
        refunded: "Refunded",
        failed: "Failed",
      },
      unit_price: "Price: ",
      billing_addr: "Billing Address",
      shipping_addr: "Shipping Address",
      no_image: "No Image",
    },
    loading: "Loading...",
    error_fetch: "Failed to fetch data",
  },
};

/* ========== 3. 子組件：會員資料區塊 ========== */
function ProfileSection({ t, profile, email, setEmail, saveEmail }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{t.profile.title}</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600">{t.profile.id}</label>
          <div className="mt-1 font-mono text-sm">{profile?.id ?? "-"}</div>
        </div>

        <div>
          <label className="block text-sm text-gray-600">
            {t.profile.email}
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
            className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 transition-opacity"
            onClick={saveEmail}
          >
            {t.profile.save}
          </button>
          <button
            className="rounded-lg border px-4 py-2 hover:bg-gray-50 transition-colors"
            onClick={() => setEmail(profile?.email || "")}
          >
            {t.profile.reset}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== 4. 子組件：訂單紀錄區塊 ========== */
function OrdersSection({ t, orders, locale }) {
  // 設定 dayjs 語系
  dayjs.locale(locale === "en" ? "en" : "zh-tw");

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{t.orders.title}</h2>

      {orders.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-6 text-gray-600 text-center">
          {t.orders.empty}
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* 訂單頭 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="text-base font-semibold"># {o.number}</div>
                  <div className="text-sm text-gray-500">
                    {dayjs(o.date_created).format("YYYY/MM/DD HH:mm")}
                  </div>
                  <span
                    className={`ml-2 rounded-full border px-2 py-0.5 text-xs capitalize 
                    ${
                      o.status === "completed"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : o.status === "processing"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {t.orders.status[o.status] || o.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {t.orders.total}
                  </div>
                  <div className="text-lg font-bold text-stone-800">
                    {o.currency_symbol || "$"} {o.total} {o.currency}
                  </div>
                </div>
              </div>

              {/* 商品列 */}
              <div className="divide-y divide-gray-100">
                {(o.line_items || []).map((li) => (
                  <div
                    key={li.id}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                      {li.image?.src ? (
                        <img
                          src={li.image.src}
                          alt={li.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[10px] text-gray-400 bg-gray-50">
                          {t.orders.no_image}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {li.name}
                      </div>
                      {li.variation_id !== 0 && li.meta_data && (
                        <div className="mt-0.5 text-xs text-gray-500">
                          {li.meta_data
                            .map((meta) => `${meta.key}: ${meta.value}`)
                            .join(" / ")}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-600">
                        {t.orders.unit_price} {o.currency_symbol || "$"}{" "}
                        {li.price}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 font-medium">
                      × {li.quantity}
                    </div>

                    <div className="w-24 text-right text-sm font-semibold text-gray-900">
                      {o.currency_symbol || "$"} {li.total}
                    </div>
                  </div>
                ))}
              </div>

              {/* 地址區塊 */}
              <div className="grid gap-6 border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm sm:grid-cols-2">
                {/* 帳單地址 */}
                <div>
                  <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.orders.billing_addr}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
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
                  <div className="mt-1 text-gray-600 text-xs">
                    {o?.billing?.email} <br /> {o?.billing?.phone}
                  </div>
                </div>

                {/* 寄送地址 */}
                <div>
                  <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.orders.shipping_addr}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
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
  );
}

/* ========== 5. 主頁面元件 ========== */
export default function AccountPage() {
  const router = useRouter();
  const { locale } = router;

  // 取得對應翻譯
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];

  // 狀態管理
  const [auth, setAuth] = useState(authStore.get());
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");

  // 初始化 Auth Store
  useEffect(() => {
    authStore.init?.();
    const unsub = authStore.subscribe((s) => setAuth({ ...s }));
    return unsub;
  }, []);

  const emailFromAuth = auth?.user?.email || "";
  const idFromAuth = auth?.user?.id || auth?.user?.ID || "";

  // 取得資料
  useEffect(() => {
    if (!emailFromAuth && !idFromAuth) {
      setLoading(false);
      return;
    }

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
        if (!pJson.ok) throw new Error(pJson.error || t.error_fetch);
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
        if (!oJson.ok) throw new Error(oJson.error || t.error_fetch);
        setOrders(Array.isArray(oJson.data) ? oJson.data : []);
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndOrders();
  }, [emailFromAuth, idFromAuth, t.error_fetch]);

  // 更新 Email
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
      if (!json.ok) throw new Error(json.error || t.profile.error_update);

      setProfile(json.data);
      authStore.patch?.({
        user: { ...(auth.user || {}), email: json.data.email },
      });
      alert(t.profile.success);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  /* ----- SEO URL 處理 ----- */
  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;
  const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
  // 假設本頁路徑為 /account
  const path = pathWithoutLocale === "/" ? "/account" : pathWithoutLocale;
  const zhUrl = `${SITE_DOMAIN}${path}`;
  const enUrl = `${SITE_DOMAIN}/en${path}`;

  // 未登入狀態
  if (!auth?.user) {
    return (
      <Layout className="">
        <Head>
          <title>{t.meta.title}</title>
          <meta name="description" content={t.meta.description} />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="!bg-[#f6f1ec] min-h-screen flex justify-center items-center">
          <div className="max-w-md mx-auto !bg-[#f6f1ec] px-6 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4 text-stone-800">
              {t.auth.title}
            </h1>
            <p className="mb-8 text-gray-600 leading-relaxed">
              {t.auth.not_logged_in}
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl bg-black px-8 py-3 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm"
            >
              {t.auth.login_btn}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // 已登入狀態
  return (
    <Layout className="">
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />
      </Head>

      <div className="!bg-[#f6f1ec] min-h-screen pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
              {t.auth.title}
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {t.auth.hello}{" "}
              <span className="font-medium text-stone-700">
                {auth.user.displayName || auth.user.name || auth.user.email}
              </span>
            </p>
          </header>

          {err && (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {err}
            </div>
          )}

          {loading ? (
            <div className="mt-12 text-center text-gray-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
              {t.loading}
            </div>
          ) : (
            <>
              {/* 會員資料 & 地址區塊 (Grid Layout) */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* 左：會員資料 */}
                <ProfileSection
                  t={t}
                  profile={profile}
                  email={email}
                  setEmail={setEmail}
                  saveEmail={saveEmail}
                />

                {/* 右：帳單地址 (唯讀) */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">{t.billing.title}</h2>
                  <p className="text-sm text-gray-500 mt-2 max-w-xs">
                    {t.billing.desc}
                  </p>
                </div>
              </section>

              {/* 訂單紀錄區塊 */}
              <OrdersSection t={t} orders={orders} locale={locale} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
