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
   1. HELPER FUNCTIONS & CONFIG
   ========================================================= */

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}

const SITE_URL_RAW = process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const SITE_URL = ensureURL(SITE_URL_RAW);
const SITE_NAME = "Memory Corner";
const OG_IMAGE_DEFAULT = `${SITE_URL}/images/og-default.png`;
const ITEMS_PER_PAGE = 12; // 設定每頁 12 筆

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
  const isRoomTemp = cats.some(c => c.name === "常溫" || c.slug?.includes("room") || c.slug === "ambient");
  const isFrozen = cats.some(c => c.name === "冷凍" || c.slug?.includes("frozen"));

  if (isRoomTemp) {
    final = original * 0.88;
    label = "常溫優惠 88折";
  } else if (isFrozen) {
    final = original * 0.90;
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
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type) => parts.find((p) => p.type === type)?.value;
    return `${getPart("year")}/${getPart("month")}/${getPart("day")} ${getPart("hour")}:${getPart("minute")}`;
  } catch (e) { return isoString; }
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
  const upcoming = periods
    .filter((p) => new Date(p.start).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return upcoming[0] || null;
}

const PAGE_TRANSLATIONS = {
  "zh-TW": {
    seo: { title: "團購商品 | 有香 Memory Corner", description: "依分類瀏覽團購商品..." },
    title: "團購商品", loading: "商品載入中...", add_to_cart: "加入購物車", add_success_prefix: "「", add_success_suffix: "」已加入購物車", unit: "份", currency: "NT$", breadcrumb: "團購商品", empty: "此分類目前沒有商品", all: "全部",
    prev_page: "上一頁", next_page: "下一頁"
  },
  en: {
    seo: { title: "Group Buy | Memory Corner", description: "Browse products..." },
    title: "GROUP BUY", loading: "Loading products...", add_to_cart: "Add to Cart", add_success_prefix: "", add_success_suffix: " has been added to cart", unit: "item(s)", currency: "NT$", breadcrumb: "Group Buy", empty: "No products in this category", all: "All",
    prev_page: "Prev", next_page: "Next"
  },
};

function pickZhName(meta = []) {
  const keys = ["zh_product_name", "cn_name", "zh_name", "chinese_name", "cn_product_name", "中文產品名稱"];
  for (const k of keys) { 
    const row = meta.find((m) => m?.key === k && m?.value); 
    if (row?.value) return String(row.value); 
  }
  return "";
}

/* =========================================================
   2. MODAL COMPONENT
   ========================================================= */
function GroupNoticeModal({ open, onClose, nextPeriod }) {
  const info = nextPeriod || { start: null, end: null, delivery_zh: "待定 (TBA)", delivery_en: "To be announced" };
  const timeRange = info.start && info.end ? `${formatTimeDisplay(info.start)} — ${formatTimeDisplay(info.end)}` : "Coming Soon";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <motion.div 
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
               <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600 shrink-0">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
               </div>
               <div>
                 <h3 className="text-lg font-bold text-gray-900">目前無法下單 (Group-Buy Closed)</h3>
                 <p className="text-xs text-gray-500">請等待下一次開團 (Please wait for the next group-buy window)</p>
               </div>
            </div>
            <div className="p-6 space-y-5">
               <div>
                 <p className="text-[15px] text-gray-800 leading-relaxed font-medium">
                   很抱歉，本商品僅在<span className="font-bold mx-1">「開團期間」</span>開放下單；目前非開團時段。
                 </p>
               </div>
               <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                    <span>📅 下一次開團時間 (Next Group Buy)</span>
                  </div>
                  <div className="text-sm font-mono text-gray-800 tracking-wide">{timeRange}</div>
                  <div className="text-xs text-gray-500 mt-1">(Vancouver Time)</div>
               </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
               <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition shadow-sm">
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
   3. MAIN COMPONENT (GroupBuyPage)
   ========================================================= */
export default function GroupBuyPage({ initialItems = [], periods = [] }) {
  const router = useRouter();
  const { locale, asPath } = router;
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";
  const products = initialItems;
  const [activeCat, setActiveCat] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1); // 分頁狀態

  const [activePeriod, setActivePeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // 時間檢查
  useEffect(() => {
    const checkTime = () => {
      setActivePeriod(getActivePeriod(periods));
      setNextPeriod(getNextPeriod(periods));
    };
    checkTime();
    const id = setInterval(checkTime, 30000); 
    return () => clearInterval(id);
  }, [periods]);

  // 購物車數量 Map
  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    (initialItems || []).forEach((p) => { if (p?.id != null) m[p.id] = 1; });
    return m;
  });

  // 當商品變更時更新 Map
  useEffect(() => {
    if (!products?.length) return;
    setQtyMap((prev) => {
      const next = { ...prev };
      products.forEach((p) => { if (next[p.id] === undefined) next[p.id] = 1; });
      return next;
    });
  }, [products]);

  const listTopRef = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, text });
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };
  useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);

  const setQty = (id, next) => setQtyMap((m) => ({ ...m, [id]: Math.max(0, Number.isFinite(+next) ? +next : 0) }));

  // 🟢 [修改重點] 加入購物車時，標記 store_type: 'group_buy'
  const addToCart = (product) => {
    if (!activePeriod) {
      setShowGroupModal(true);
      return;
    }
    const raw = qtyMap[product.id] ?? 0;
    if (raw <= 0) return;
    const safeQty = Math.max(1, raw);
    
    const { final } = getDiscountedPrice(product);
    const finalPriceToStore = Number(final.toFixed(2));
    const acfZhName = product.extensions?.custom_acf?.zh_product_name;
    const acfEnName = product.extensions?.custom_acf?.en_product_name;
    const defaultName = product.name;
    const displayName = isEn ? acfEnName || defaultName : acfZhName || defaultName;
    const cartId = product.linkedChineseId || product.id;

    cartStore.add({
        id: cartId, 
        productId: product.id, 
        name: displayName,
        name_zh: acfZhName || defaultName, 
        name_en: acfEnName || defaultName,
        img: product.img, 
        price: finalPriceToStore,

        // 👇👇👇 新增這行：標記為團購商品
        store_type: 'group_buy', 
    }, safeQty);

    if (typeof window !== "undefined") window.dispatchEvent(new Event("open-cart"));

    const msg = isEn
      ? `${t.add_success_prefix}${displayName}${t.add_success_suffix} (${safeQty} ${t.unit})`
      : `${t.add_success_prefix}${displayName}${t.add_success_suffix}（${safeQty} ${t.unit}）`;

    showToast(msg);
    setQty(product.id, 0);
  };

  // 生成 Tabs
  const tabs = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => { 
      (p.categories || []).forEach((c) => { 
        if (!c?.id) return; 
        if (!map.has(c.id)) {
          map.set(c.id, { id: c.id, name: c.name, slug: c.slug });
        }
      }); 
    });
    const localeForSort = isEn ? "en" : "zh-Hant";
    const arr = Array.from(map.values()).sort((a, b) => String(a.name).localeCompare(String(b.name), localeForSort));
    return [{ id: "ALL", name: t.all }, ...arr];
  }, [products, t.all, isEn]);

  // 過濾邏輯
  const filteredProducts = useMemo(() => {
    if (activeCat === "ALL") return products;
    return (products || []).filter((p) => (p.categories || []).some((c) => String(c.id) === String(activeCat)));
  }, [products, activeCat]);

  // 重置分頁當分類改變
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCat]);

  // 分頁計算
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      requestAnimationFrame(() => listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  // 動畫設定
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 // 卡片交錯出現，更絲滑
      }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -10 }
  };

  const ogTitle = t.seo.title;
  const ogDesc = t.seo.description;
  
  return (
    <Layout>
      <Head>
        <title key="title">{ogTitle}</title>
        <meta name="description" content={ogDesc} key="description" />
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen">
        <section className="pt-20 md:pt-0 max-h-screen overflow-hidden">
          <Image src="/images/group-buy/2025-10--IG-1920x768px-01.webp" alt="banner" priority width={1920} height={1080} className="w-full h-full object-cover" />
        </section>

        <GroupNoticeModal open={showGroupModal} onClose={() => setShowGroupModal(false)} nextPeriod={nextPeriod} />

        <div className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center">
          <AnimatePresence mode="wait">
            {toast && (
              <motion.div key={toast.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: -8 }} exit={{ opacity: 0 }} className="mb-8 rounded-xl bg-[#c1a46f] text-white px-4 py-2 shadow-lg">{toast.text}</motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 分類 Tabs */}
        <section className="pt-28 pb-6">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <h1 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold tracking-wider">{t.title}</h1>
            <div className="mt-5">
              <div className="-mx-2 px-2 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 w-max">
                  {tabs.map((c) => (
                    <button 
                      key={c.id} 
                      onClick={() => { setActiveCat(c.id); requestAnimationFrame(() => listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }} 
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

        {/* 產品列表 */}
        <section className="pb-24 min-h-[600px]">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <div ref={listTopRef} />
            
            <AnimatePresence mode="wait">
              {/* Key 加上 currentPage 確保切換頁面時也會觸發動畫 */}
              <motion.div 
                key={`${activeCat}-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {currentProducts.length === 0 ? <p className="text-center mt-10 text-gray-500">{t.empty}</p> : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                      {currentProducts.map((p) => {
                        const q = qtyMap[p.id] ?? 0;
                        const { original, final, hasDiscount } = getDiscountedPrice(p);
                        const acfZhName = p.extensions?.custom_acf?.zh_product_name;
                        const acfEnName = p.extensions?.custom_acf?.en_product_name;
                        const displayName = isEn ? acfEnName || p.name : acfZhName || p.name;

                        return (
                          <motion.article 
                            key={p.id} 
                            variants={cardVariants}
                            // Compact Design Adjustment: Reduced padding and tightened layout
                            className="flex flex-col bg-white rounded-xl p-2.5 sm:p-3 shadow-sm ring-1 ring-black/5 hover:shadow-md transition group"
                          >
                            <Link href={`/product/${p.slug}?from=groupBuy`} className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
                              <Image 
                                src={p.img} 
                                alt={displayName} 
                                fill 
                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.05]" 
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            </Link>

                            <div className="text-center px-1 mt-2 flex-grow flex flex-col">
                              {/* 標題高度與行高調整 */}
                              <h3 className="text-[13px] sm:text-[14px] font-bold leading-tight line-clamp-2 min-h-[2.4em] text-gray-800" title={displayName}>
                                {displayName}
                              </h3>
                              
                              {/* 價格區域更緊湊 */}
                              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2">
                                {hasDiscount ? (
                                  <>
                                    <span className="text-gray-400 line-through text-xs scale-90">CA${original.toFixed(2)}</span>
                                    <span className="text-red-700 font-bold text-sm">CA${final.toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span className="text-black/80 font-medium text-sm">CA${final.toFixed(2)}</span>
                                )}
                              </div>
                            </div>

                            {/* 控制區塊：高度壓縮 */}
                            <div className="mt-2.5">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setQty(p.id, q - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition" disabled={q <= 0}>−</button>
                                <input type="number" min={0} value={q} onChange={(e) => setQty(p.id, e.target.value)} className="w-12 text-center text-sm rounded-lg border border-gray-200 py-1.5 focus:outline-none focus:border-amber-400" />
                                <button onClick={() => setQty(p.id, q + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition">+</button>
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

                    {/* 分頁按鈕區域 */}
                    {totalPages > 1 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="mt-12 flex justify-center items-center gap-2"
                      >
                        <button 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-md border bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {t.prev_page}
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
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
                          className="px-3 py-1.5 rounded-md border bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {t.next_page}
                        </button>
                      </motion.div>
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

// getStaticProps 保持您原本的邏輯即可，無需變動
export async function getStaticProps({ locale }) {
    // ... (維持您原本的 getStaticProps 程式碼)
    const base = process.env.WC_URL;
   const ck = process.env.WC_CK;
   const cs = process.env.WC_CS;
   const langMap = { "zh-TW": "zh_TW", en: "en" };
   const wpLang = langMap[locale] || "zh_TW";
   let initialItems = [];
   let periods = [];

   try {
     const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
     storeURL.searchParams.set("per_page", "100");
     storeURL.searchParams.set("lang", wpLang);
     
     // 1. Fetch Store Products
     const r = await fetch(storeURL.toString(), { headers: { Accept: "application/json" } });
     if (!r.ok) return { props: { initialItems: [], periods: [] }, revalidate: 10 };
     
     const list = await r.json();
     
     const ids = list.map(p => p.id).slice(0, 200);
     const metaMap = new Map();

     // 2. Fetch V3 Products (for Meta Data & Correct Categories)
     if (ids.length && ck && cs) {
        const v3 = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
        v3.searchParams.set("include", ids.join(","));
        v3.searchParams.set("per_page", String(ids.length));
        v3.searchParams.set("_fields", "id,name,short_description,sku,translations,meta_data,categories");
        v3.searchParams.set("lang", wpLang); // 重要：請求對應語言的資料
        const vr = await fetch(v3.toString(), { headers: { Authorization: basicAuth(ck, cs) } });
        if (vr.ok) {
           const v3data = await vr.json();
           v3data.forEach(it => metaMap.set(it.id, it));
        }
     }

     // 3. Merge Data & Filter
     const mergedList = list.map(p => {
        const detail = metaMap.get(p.id) || {};
        
        // 🟢 強制使用 V3 API 的分類資料 (這樣能確保拿到翻譯後的分類名稱)
        if(detail.categories && detail.categories.length > 0) {
            p.categories = detail.categories; 
        }
        
        if (!p.extensions) p.extensions = {};
        if (!p.extensions.custom_acf) p.extensions.custom_acf = {};
        
        p.extensions.custom_acf.zh_product_name = pickZhName(detail.meta_data || []);
        p.extensions.custom_acf.en_product_name = detail.name || p.name;
        p.extensions.custom_acf.en_description = detail.short_description||"";
        
        let linkedChineseId = p.id;
        if (wpLang === "en") {
          const zhId = detail.translations?.zh || detail.translations?.zh_TW;
          if (zhId) linkedChineseId = zhId;
        }
        p.linkedChineseId = linkedChineseId;
        
        let imgSrc = p.images?.[0]?.src;
        if (imgSrc && !imgSrc.startsWith("http")) imgSrc = `${ensureURL(base)}${imgSrc}`;
        p.img = imgSrc || "/images/placeholder.png";
        return p;
     });

     // 🟢 最終過濾
     initialItems = mergedList.filter(p => {
        const cats = p.categories || [];
        const isBeer = cats.some(c => 
            (c.slug && c.slug.toLowerCase().includes('beer')) || 
            (c.name && c.name.includes('啤酒')) ||
            (c.slug && c.slug.toLowerCase().includes('alcohol'))
        );
        return !isBeer;
     });

     // 4. Fetch Periods
     try {
        const timeRes = await fetch(`${ensureURL(base)}/wp-json/custom/v1/group-buy`);
        if (timeRes.ok) periods = await timeRes.json();
     } catch(err) { console.error("Fetch periods failed", err); }

   } catch(e) { console.log(e); }
   
   return { props: { initialItems, periods }, revalidate: 10 };
}