"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";

/* =========================================================
   1. CONFIG & HELPERS
   ========================================================= */

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const SITE_URL = ensureURL(SITE_URL_RAW);
const ITEMS_PER_PAGE = 12;

function basicAuth(ck, cs) {
  return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
}

const getBasePrice = (p) => {
  if (!p) return 0;
  if (p.prices) {
    const raw = p.prices.regular_price || p.prices.price;
    if (raw) return Number(raw) / 100;
  }
  const raw = p.regular_price || p.price || 0;
  if (typeof raw === "string") return parseFloat(raw);
  return Number(raw);
};

const getDiscountedPrice = (p) => {
  const original = getBasePrice(p);
  let final = original;
  let label = "";
  const cats = p.categories || [];
  const isRoomTemp = cats.some(
    (c) =>
      c.name === "常溫" || c.slug?.includes("room") || c.slug === "ambient",
  );
  const isFrozen = cats.some(
    (c) => c.name === "冷凍" || c.slug?.includes("frozen"),
  );

  if (isRoomTemp) {
    final = original * 0.88;
    label = "常溫優惠 88折";
  } else if (isFrozen) {
    final = original * 0.9;
    label = "冷凍優惠 9折";
  }

  return { original, final, hasDiscount: final < original, label };
};

const formatTimeDisplay = (isoString) => {
  if (!isoString) return "TBA";
  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Vancouver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type) => parts.find((p) => p.type === type)?.value;
    return `${getPart("year")}/${getPart("month")}/${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
  } catch (e) {
    return isoString;
  }
};

function getActivePeriod(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const now = Date.now();
  return periods.find((p) => {
    const start = new Date(p.start).getTime();
    const end = new Date(p.end).getTime();
    return now >= start && now <= end;
  });
}

function getNextPeriod(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const now = Date.now();
  return (
    periods
      .filter((p) => new Date(p.start).getTime() > now)
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      )[0] || null
  );
}

const PAGE_TRANSLATIONS = {
  "zh-TW": {
    seo: {
      title: "團購商品 | 有香 Memory Corner",
      description: "依分類瀏覽團購商品...",
    },
    title: "團購商品",
    loading: "商品載入中...",
    add_to_cart: "加入購物車",
    add_success_prefix: "「",
    add_success_suffix: "」已加入購物車",
    unit: "份",
    currency: "NT$",
    breadcrumb: "團購商品",
    empty: "此分類目前沒有商品",
    all: "全部",
    prev_page: "上一頁",
    next_page: "下一頁",
  },
  en: {
    seo: {
      title: "Group Buy | Memory Corner",
      description: "Browse products...",
    },
    title: "GROUP BUY",
    loading: "Loading products...",
    add_to_cart: "Add to Cart",
    add_success_prefix: "",
    add_success_suffix: " has been added to cart",
    unit: "item(s)",
    currency: "NT$",
    breadcrumb: "Group Buy",
    empty: "No products in this category",
    all: "All",
    prev_page: "Prev",
    next_page: "Next",
  },
};

/* =========================================================
   2. MODAL COMPONENT
   ========================================================= */
function GroupNoticeModal({ open, onClose, nextPeriod }) {
  const info = nextPeriod || {
    start: null,
    end: null,
    delivery_zh: "待定 (TBA)",
    delivery_en: "To be announced",
  };
  const timeRange =
    info.start && info.end
      ? `${formatTimeDisplay(info.start)} — ${formatTimeDisplay(info.end)}`
      : "Coming Soon";
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  目前無法下單 (Group-Buy Closed)
                </h3>
                <p className="text-xs text-gray-500">請等待下一次開團</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-[15px] text-gray-800 font-medium">
                很抱歉，本商品僅在
                <span className="font-bold mx-1">「開團期間」</span>開放下單。
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-sm font-bold text-gray-900 mb-1">
                  📅 下一次開團時間
                </div>
                <div className="text-sm font-mono text-gray-800">
                  {timeRange}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-100"
              >
                知道了 / Got it
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* =========================================================
   3. MAIN COMPONENT
   ========================================================= */
export default function GroupBuyPage({
  initialItems = [],
  periods = [],
  debugLogs = [],
}) {
  const router = useRouter();
  const { locale } = router;
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";
  const products = initialItems;

  const [activeCat, setActiveCat] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [activePeriod, setActivePeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      setActivePeriod(getActivePeriod(periods));
      setNextPeriod(getNextPeriod(periods));
    };
    checkTime();
    const id = setInterval(checkTime, 30000);
    return () => clearInterval(id);
  }, [periods]);

  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    (initialItems || []).forEach((p) => {
      if (p?.id != null) m[p.id] = 1;
    });
    return m;
  });

  useEffect(() => {
    if (!products?.length) return;
    setQtyMap((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (next[p.id] === undefined) next[p.id] = 1;
      });
      return next;
    });
  }, [products]);

  const listTopRef = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = (text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), text });
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };

  const setQty = (id, next) =>
    setQtyMap((m) => ({
      ...m,
      [id]: Math.max(0, Number.isFinite(+next) ? +next : 0),
    }));

  const addToCart = (product) => {
    if (!activePeriod) {
      setShowGroupModal(true);
      return;
    }
    const raw = qtyMap[product.id] ?? 0;
    if (raw <= 0) return;
    const safeQty = Math.max(1, raw);
    const { final } = getDiscountedPrice(product);

    const displayName = isEn
      ? product.name_en || product.name
      : product.name_zh || product.name;

    cartStore.add(
      {
        id: product.linkedChineseId || product.id,
        productId: product.id,
        name: displayName,
        name_zh: product.name_zh || displayName,
        name_en: product.name_en || displayName,
        img: product.img || "/images/placeholder.png", // 防護
        price: Number(final.toFixed(2)),
        store_type: "group_buy",
      },
      safeQty,
    );

    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("open-cart"));
    const msg = isEn
      ? `${t.add_success_prefix}${displayName}${t.add_success_suffix} (${safeQty} ${t.unit})`
      : `${t.add_success_prefix}${displayName}${t.add_success_suffix}（${safeQty} ${t.unit}）`;
    showToast(msg);
    setQty(product.id, 0);
  };

  const tabs = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      (p.categories || []).forEach((c) => {
        if (!c?.id) return;
        if (!map.has(c.id)) map.set(c.id, c);
      });
    });
    const localeForSort = isEn ? "en" : "zh-Hant";
    const arr = Array.from(map.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), localeForSort),
    );
    return [{ id: "ALL", name: t.all }, ...arr];
  }, [products, t.all, isEn]);

  const filteredProducts = useMemo(() => {
    if (activeCat === "ALL") return products;
    return (products || []).filter((p) =>
      (p.categories || []).some((c) => String(c.id) === String(activeCat)),
    );
  }, [products, activeCat]);

  // 切換分類時，把頁碼歸零回到第 1 頁
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCat]);

  // 分頁邏輯：計算總頁數，並切割出當前頁面要顯示的 12 個商品
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      requestAnimationFrame(() =>
        listTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  };

  return (
    <Layout>
      <Head>
        <title key="title">{t.seo.title}</title>
      </Head>
      <main className="bg-[#f9f6f3] min-h-screen">
        <section className="pt-20 md:pt-0 max-h-screen overflow-hidden">
          <Image
            src="/images/group-buy/2025-10--IG-1920x768px-01.webp"
            alt="banner"
            priority
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </section>

        <GroupNoticeModal
          open={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          nextPeriod={nextPeriod}
        />

        <div className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center">
          <AnimatePresence mode="wait">
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: -8 }}
                exit={{ opacity: 0 }}
                className="mb-8 rounded-xl bg-[#c1a46f] text-white px-4 py-2 shadow-lg"
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="pt-10 pb-6">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <h1 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold tracking-wider">
              {t.title}
            </h1>
            <div className="mt-5">
              <div className="-mx-2 px-2 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 w-max">
                  {tabs.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCat(c.id)}
                      className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition text-[13px] sm:text-[14px] whitespace-nowrap ${String(c.id) === String(activeCat) ? "bg-[#e7a042] text-white border-[#e7a042]" : "bg-white text-black hover:bg-gray-50"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 min-h-[600px]">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <div ref={listTopRef} />
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCat}-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {currentProducts.length === 0 ? (
                  <p className="text-center mt-10 text-gray-500">{t.empty}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                      {currentProducts.map((p) => {
                        const q = qtyMap[p.id] ?? 0;
                        const { original, final, hasDiscount } =
                          getDiscountedPrice(p);
                        const displayName = isEn
                          ? p.name_en || p.name
                          : p.name_zh || p.name;
                        return (
                          <motion.article
                            key={p.id}
                            className="flex flex-col bg-white rounded-xl p-2.5 sm:p-3 shadow-sm ring-1 ring-black/5 hover:shadow-md transition group"
                          >
                            <Link
                              href={`/product/${p.slug}?from=groupBuy`}
                              className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={p.img || "/images/placeholder.png"}
                                alt={displayName}
                                fill
                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.05]"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            </Link>
                            <div className="text-center px-1 mt-2 flex-grow flex flex-col">
                              <h3
                                className="text-[13px] sm:text-[14px] font-bold leading-tight line-clamp-2 min-h-[2.4em] text-gray-800"
                                title={displayName}
                              >
                                {displayName}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2">
                                {hasDiscount ? (
                                  <>
                                    <span className="text-gray-400 line-through text-xs scale-90">
                                      CA${original.toFixed(2)}
                                    </span>
                                    <span className="text-red-700 font-bold text-sm">
                                      CA${final.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-black/80 font-medium text-sm">
                                    CA${final.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2.5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setQty(p.id, q - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                                  disabled={q <= 0}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={q}
                                  onChange={(e) => setQty(p.id, e.target.value)}
                                  className="w-12 text-center text-sm rounded-lg border border-gray-200 py-1.5 focus:outline-none focus:border-amber-400"
                                />
                                <button
                                  onClick={() => setQty(p.id, q + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => addToCart(p)}
                                disabled={q <= 0}
                                className={`mt-2 w-full rounded-lg py-1.5 text-sm font-medium text-white transition-all shadow-sm ${q > 0 ? "bg-[#e7a042] hover:bg-[#d69035] active:scale-[0.98]" : "bg-gray-300 cursor-not-allowed"}`}
                              >
                                {t.add_to_cart}
                              </button>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                    {/* 👇 渲染分頁按鈕 (如果總頁數大於 1 才會顯示) */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex justify-center items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-md border bg-white text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          {t.prev_page}
                        </button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-md text-sm font-medium transition ${
                              currentPage === pageNum
                                ? "bg-[#e7a042] text-white shadow-md scale-110"
                                : "bg-white border hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-md border bg-white text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          {t.next_page}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>
    </Layout>
  );
}

// 🟢 [最終完美版] 無限制數量！自動迴圈抓取所有分頁商品，不再被 100 筆限制卡住！
export async function getStaticProps({ locale }) {
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;

  const langMap = { "zh-TW": "zh", en: "en" };
  const wpLang = langMap[locale] || "zh";

  let initialItems = [];
  let periods = [];
  let debugLogs = [];
  const log = (step, msg) => {
    console.log(`[DEBUG ${step}] ${msg}`);
    debugLogs.push({ step, msg });
  };

  try {
    const rawProducts = [];
    let currentPageFetch = 1;
    let hasMoreProducts = true;

    // ★ 關鍵突破：使用 while 迴圈抓取所有分頁商品，打破 100 筆的限制！
    while (hasMoreProducts) {
      const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
      storeURL.searchParams.set("per_page", "100");
      storeURL.searchParams.set("page", currentPageFetch.toString());
      storeURL.searchParams.set("status", "publish");
      storeURL.searchParams.set("lang", wpLang);

      const r = await fetch(storeURL.toString(), {
        headers: {
          Accept: "application/json",
          Authorization: basicAuth(ck, cs),
        },
      });

      if (!r.ok) break; // 若發生錯誤則跳出迴圈

      const chunk = await r.json();

      // 將這一批抓到的商品塞進總陣列裡
      if (Array.isArray(chunk) && chunk.length > 0) {
        rawProducts.push(...chunk);
      }

      // 如果抓回來的商品不到 100 個，代表已經到最後一頁了，停止迴圈
      if (!Array.isArray(chunk) || chunk.length < 100) {
        hasMoreProducts = false;
      } else {
        // 如果抓滿 100 個，代表後面還有，繼續抓下一頁！
        currentPageFetch++;
      }
    }

    log(1, `成功抓回無數量限制的所有商品，共 ${rawProducts.length} 筆`);

    // 1. 找出缺少對應語系的商品 ID
    const missingIds = new Set();
    rawProducts.forEach((p) => {
      const trans = p.translations || {};
      const zhId =
        trans.zh || trans["zh-hant"] || trans["zh-TW"] || trans.zh_TW;
      const enId = trans.en;
      if (zhId && !rawProducts.some((rp) => rp.id === zhId))
        missingIds.add(zhId);
      if (enId && !rawProducts.some((rp) => rp.id === enId))
        missingIds.add(enId);
    });

    // 2. 批次補抓「完整」的翻譯商品資料
    if (missingIds.size > 0) {
      const idsArray = Array.from(missingIds);
      const chunkSize = 50;
      for (let i = 0; i < idsArray.length; i += chunkSize) {
        const chunk = idsArray.slice(i, i + chunkSize);
        try {
          const transUrl = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
          transUrl.searchParams.set("include", chunk.join(","));
          transUrl.searchParams.set("per_page", "100");

          const tRes = await fetch(transUrl.toString(), {
            headers: { Authorization: basicAuth(ck, cs) },
          });
          if (tRes.ok) {
            const tData = await tRes.json();
            rawProducts.push(...tData);
          }
        } catch (e) {}
      }
    }

    // 3. 合併與變形
    const processedGroups = new Set();
    const finalProducts = [];

    rawProducts.forEach((p) => {
      const trans = p.translations || {};
      const pLang = (p.lang || "").toLowerCase();
      const isZhProduct =
        pLang.includes("zh") || pLang.includes("hant") || pLang.includes("tw");
      const isEnProduct = pLang.includes("en");

      const zhId = isZhProduct
        ? p.id
        : trans.zh || trans["zh-hant"] || trans["zh-TW"] || trans.zh_TW;
      const enId = isEnProduct ? p.id : trans.en;

      const groupId = zhId || enId || p.id;
      if (processedGroups.has(groupId)) return;
      processedGroups.add(groupId);

      const zhObj =
        rawProducts.find((rp) => rp.id === zhId) || (isZhProduct ? p : null);
      const enObj =
        rawProducts.find((rp) => rp.id === enId) || (isEnProduct ? p : null);

      const isZhLocale = locale === "zh-TW";

      const baseObj = isZhLocale ? zhObj || enObj || p : enObj || zhObj || p;

      const displayProduct = { ...baseObj };

      const finalZhName = zhObj ? zhObj.name : baseObj.name;
      const finalEnName = enObj ? enObj.name : baseObj.name;

      displayProduct.id = isZhLocale ? zhId || baseObj.id : enId || baseObj.id;
      displayProduct.name = isZhLocale ? finalZhName : finalEnName;
      displayProduct.name_zh = finalZhName;
      displayProduct.name_en = finalEnName;
      displayProduct.linkedChineseId = zhId || baseObj.id;

      let imgSrc = baseObj.images?.[0]?.src;
      if (imgSrc && !imgSrc.startsWith("http"))
        imgSrc = `${ensureURL(base)}${imgSrc}`;
      displayProduct.img = imgSrc || "/images/placeholder.png";

      displayProduct.categories = baseObj.categories || [];

      finalProducts.push(displayProduct);
    });

    // 4. 過濾無關商品
    initialItems = finalProducts.filter((p) => {
      const cats = p.categories || [];
      const productName = (p.name || "").toLowerCase();
      const productSlug = (p.slug || "").toLowerCase();

      const isBeer =
        cats.some(
          (c) =>
            (c.slug && c.slug.toLowerCase().includes("beer")) ||
            (c.name && c.name.includes("啤酒")),
        ) ||
        productName.includes("beer") ||
        productName.includes("啤酒") ||
        productSlug.includes("beer") ||
        productSlug.includes("啤酒");

      return !isBeer;
    });

    try {
      const timeRes = await fetch(
        `${ensureURL(base)}/wp-json/custom/v1/group-buy`,
      );
      if (timeRes.ok) periods = await timeRes.json();
    } catch (err) {}
  } catch (e) {
    log(99, `❌ 發生嚴重錯誤: ${e.message}`);
  }

  return { props: { initialItems, periods, debugLogs }, revalidate: 10 };
}
