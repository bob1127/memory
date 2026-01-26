"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

/* =========================================================
   1. HELPER FUNCTIONS & CONFIG
   ========================================================= */
function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}

const SITE_URL_RAW = process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const SITE_URL = ensureURL(SITE_URL_RAW);
const SITE_NAME = "Memory Corner";

const stripHtml = (html) => (!html ? "" : html.replace(/<[^>]*>?/gm, ""));

const formatTimeDisplay = (isoString) => {
  if (!isoString) return "TBA";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-CA", {timeZone:"America/Vancouver", hour12:false}); 
  } catch{return isoString;} 
};

function getActivePeriod(periods=[]) { const now=Date.now(); return periods.find(p=>now>=new Date(p.start).getTime()&&now<=new Date(p.end).getTime()); }
function getNextPeriod(periods=[]) { const now=Date.now(); return periods.filter(p=>new Date(p.start).getTime()>now).sort((a,b)=>new Date(a.start)-new Date(b.start))[0]||null; }

// 翻譯
const PAGE_TRANSLATIONS = {
  "zh-TW": { add_to_cart: "加入購物車", add_success_prefix: "「", add_success_suffix: "」已加入購物車", currency: "NT$", breadcrumb_home: "首頁", breadcrumb_groupbuy: "團購商品", unit: "份" },
  en: { add_to_cart: "Add to Cart", add_success_prefix: "", add_success_suffix: " has been added to cart", currency: "NT$", breadcrumb_home: "Home", breadcrumb_groupbuy: "Group Buy", unit: "item(s)" },
};

/* =========================================================
   2. MODAL COMPONENT (與列表頁共用邏輯)
   ========================================================= */
function GroupNoticeModal({ open, onClose, nextPeriod }) {
  const info = nextPeriod || { start: null, end: null, delivery_zh: "待定 (TBA)", delivery_en: "To be announced" };
  const timeRange = info.start && info.end ? `${formatTimeDisplay(info.start)} — ${formatTimeDisplay(info.end)}` : "Coming Soon";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{scale:0.95}} animate={{scale:1}} className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden">
             <div className="border-b px-6 py-4 flex items-center gap-3">
               <div className="bg-amber-100 text-amber-600 rounded-full h-10 w-10 grid place-items-center">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
               </div>
               <div><h3 className="text-lg font-bold">目前無法下單 (Group-Buy Closed)</h3><p className="text-xs text-gray-500">請等待下一次開團 (Please wait for the next group-buy window)</p></div>
             </div>
             <div className="p-6 space-y-4">
               <p className="text-gray-800 font-medium">很抱歉，本商品僅在<span className="font-bold mx-1">「開團期間」</span>開放下單。</p>
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                 <div className="font-bold text-sm text-gray-900">📅 下一次開團時間 (Next Group Buy)</div>
                 <div className="font-mono text-sm text-gray-800 mt-1">{timeRange}</div>
                 <div className="text-xs text-gray-500 mt-1">(Vancouver Time)</div>
               </div>
               <div className="border rounded-xl p-4 shadow-sm">
                 <div className="font-bold text-sm text-gray-900">📦 預計配送說明 (Delivery Info)</div>
                 <div className="text-sm text-gray-700 mt-1">{info.delivery_zh}</div>
               </div>
             </div>
             <div className="border-t px-6 py-4 flex justify-center bg-gray-50">
               <button onClick={onClose} className="border border-gray-300 bg-white px-6 py-2 rounded-full hover:bg-gray-100 text-sm font-medium">知道了 / Got it</button>
             </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* =========================================================
   3. MAIN COMPONENT (ProductInner)
   ========================================================= */
export default function ProductInner({ product, periods=[], redirectDestination, zhSlug, enSlug }) {
  const { locale, asPath, replace, isReady } = useRouter();
  const isEn = locale === "en";
  const t = isEn ? PAGE_TRANSLATIONS.en : PAGE_TRANSLATIONS["zh-TW"];

  // 時間狀態
  const [activePeriod, setActivePeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const check = () => { setActivePeriod(getActivePeriod(periods)); setNextPeriod(getNextPeriod(periods)); };
    check(); const id = setInterval(check, 30000); return () => clearInterval(id);
  }, [periods]);

  // 顯示資料邏輯
  const displayName = isEn ? (product.name_en || product.name) : (product.name_zh || product.name);
  const displayDesc = isEn ? (product.description_en || product.description) : product.description;

  // 價格計算
  const originalPrice = Number(product.price || 0);
  let finalPrice = originalPrice;
  let discountLabel = "";
  const cats = product.categories || [];
  const isRoomTemp = cats.some(c => c.name === "常溫" || c.slug?.includes("room") || c.slug === "ambient");
  const isFrozen = cats.some(c => c.name === "冷凍" || c.slug?.includes("frozen"));
  if (isRoomTemp) { finalPrice = originalPrice * 0.88; discountLabel = isEn ? "12% OFF" : "常溫 88折"; } 
  else if (isFrozen) { finalPrice = originalPrice * 0.90; discountLabel = isEn ? "10% OFF" : "冷凍 9折"; }
  const hasDiscount = finalPrice < originalPrice;

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  useEffect(() => { if (!isReady) return; if (redirectDestination) { const q = window?.location?.search || ""; replace(`${redirectDestination}${q}`); } }, [redirectDestination, replace, isReady]);

  if (!product) return null;

  const imageList = (product.images?.length ? product.images : ["/images/placeholder.png"]).map(s => {
     if (s.startsWith("http")) return s; return `${SITE_URL}/${s.replace(/^\//, "")}`;
  });
  const mainImage = imageList[0];
  const canonical = `${SITE_URL}${asPath.split("?")[0]}`;
  const hrefLangZh = zhSlug ? `${SITE_URL}/product/${zhSlug}` : `${SITE_URL}/`;
  const hrefLangEn = enSlug ? `${SITE_URL}/en/product/${enSlug}` : `${SITE_URL}/en/`;

  const addToCart = () => {
    // 阻擋下單
    if (!activePeriod) { setShowModal(true); return; }

    // 價格修正 (四捨五入)
    const priceToStore = Number(finalPrice.toFixed(2));

    cartStore.add({
      id: product.linkedChineseId || product.id, productId: product.id, name: displayName,
      name_zh: product.name_zh || product.name, name_en: product.name_en || product.name,
      img: mainImage, price: priceToStore,
    }, qty);

    if (typeof window !== "undefined") window.dispatchEvent(new Event("open-cart"));
    setToast(true); setQty(1); setTimeout(() => setToast(false), 2000);
  };

  return (
    <Layout>
      <Head>
        <title>{`${displayName} | ${SITE_NAME}`}</title>
        <meta name="description" content={stripHtml(displayDesc).substring(0, 150)} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="zh-Hant" href={hrefLangZh} />
        <link rel="alternate" hrefLang="en" href={hrefLangEn} />
        <link rel="alternate" hrefLang="x-default" href={hrefLangZh} />
        <meta property="og:title" content={displayName} />
        <meta property="og:image" content={mainImage} />
      </Head>

      <section className="w-full bg-white mx-auto px-4 sm:px-6 lg:px-8 py-[100px]">
        <nav className="max-w-[1200px] mx-auto mb-6 text-sm text-gray-500">
            <Link href={isEn ? "/en" : "/"} className="hover:text-black">{t.breadcrumb_home}</Link>
            <span className="mx-2">/</span>
            <Link href={isEn ? "/en/groupBuy" : "/groupBuy"} className="hover:text-black">{t.breadcrumb_groupbuy}</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{displayName}</span>
        </nav>

        <GroupNoticeModal open={showModal} onClose={()=>setShowModal(false)} nextPeriod={nextPeriod} />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div>
             <Swiper modules={[Thumbs]} thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }} className="aspect-square rounded-xl border border-gray-100 mb-4 bg-gray-50">
                {imageList.map((img, i) => <SwiperSlide key={i}><div className="relative w-full h-full"><Image src={img} alt={displayName} fill className="object-contain p-4" priority={i===0}/></div></SwiperSlide>)}
             </Swiper>
             {imageList.length > 1 && <Swiper modules={[Thumbs]} onSwiper={setThumbsSwiper} slidesPerView={5} spaceBetween={10} watchSlidesProgress>{imageList.map((img, i) => <SwiperSlide key={i}><div className="relative aspect-square w-full rounded-lg border overflow-hidden cursor-pointer"><Image src={img} alt="thumb" fill className="object-cover"/></div></SwiperSlide>)}</Swiper>}
           </div>

           <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex flex-col items-start gap-1">
                 {hasDiscount ? (
                   <>
                     <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-red-700">CA$ {finalPrice.toFixed(2)}</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">{discountLabel}</span>
                     </div>
                     <span className="text-gray-400 line-through text-lg">CA$ {originalPrice.toFixed(2)}</span>
                   </>
                 ) : ( <div className="text-2xl font-bold text-black">CA$ {finalPrice.toFixed(2)}</div> )}
              </div>
              
              <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: displayDesc }} />
              
              <div className="flex items-center gap-4 mt-6">
                 <div className="flex items-center border border-gray-300 rounded-full h-12">
                    <button onClick={() => setQty(Math.max(1, qty-1))} className="px-4 h-full hover:bg-gray-100 rounded-l-full text-lg">-</button>
                    <span className="px-2 font-medium min-w-[2rem] text-center">{qty}</span>
                    <button onClick={() => setQty(qty+1)} className="px-4 h-full hover:bg-gray-100 rounded-r-full text-lg">+</button>
                 </div>
                 {/* 金色按鈕 */}
                 <button onClick={addToCart} className="bg-[#e7a042] text-white px-8 h-12 rounded-full hover:opacity-90 transition shadow-lg font-medium tracking-wide">
                    {t.add_to_cart}
                 </button>
              </div>
           </div>
        </div>
      </section>
      
      <AnimatePresence>
        {toast && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#c1a46f] text-white px-6 py-3 rounded-full shadow-lg z-50 whitespace-nowrap">
           {t.add_success_prefix}{displayName}{t.add_success_suffix} ({qty} {t.unit})
        </motion.div>}
      </AnimatePresence>
    </Layout>
  );
}

/* =========================================================
   4. SERVER SIDE
   ========================================================= */
export async function getStaticPaths() { return { paths: [], fallback: "blocking" }; }

export async function getStaticProps({ params, locale }) {
  const paramVal = params?.slug; 
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;
  const base = WC_URL;

  if (!paramVal || !WC_URL) return { notFound: true, revalidate: 10 };

  const buildAuthUrl = (path, p = {}) => {
    const u = new URL(`${String(WC_URL).replace(/\/+$/, "")}${path}`);
    Object.entries(p).forEach(([k, v]) => u.searchParams.set(k, String(v)));
    u.searchParams.set("consumer_key", WC_CK);
    u.searchParams.set("consumer_secret", WC_CS);
    return u.toString();
  };
  const pickZhName = (meta = []) => { const keys = ["zh_product_name", "cn_name", "zh_name", "chinese_name", "cn_product_name", "中文產品名稱"]; for (const k of keys) { const row = meta.find((m) => m?.key === k && m?.value); if (row?.value) return String(row.value); } return ""; };
  const pickEnName = (meta = []) => { const keys = ["en_product_name", "english_name"]; for (const k of keys) { const row = meta.find((m) => m?.key === k && m?.value); if (row?.value) return String(row.value); } return ""; };
  const pickEnDesc = (meta = []) => { const keys = ["en_description", "english_description"]; for (const k of keys) { const row = meta.find((m) => m?.key === k && m?.value); if (row?.value) return String(row.value); } return ""; };

  try {
    let p = null;
    const isNumericId = /^\d+$/.test(String(paramVal));
    if (isNumericId) { const res = await fetch(buildAuthUrl(`/wp-json/wc/v3/products/${paramVal}`)); if (res.ok) p = await res.json(); } 
    else { const res = await fetch(buildAuthUrl("/wp-json/wc/v3/products", { slug: encodeURIComponent(String(paramVal)) })); const data = await res.json(); if (Array.isArray(data) && data.length > 0) p = data[0]; }
    
    if (!p || !p.id) return { notFound: true, revalidate: 10 };

    if (!p.meta_data) { const resMeta = await fetch(buildAuthUrl(`/wp-json/wc/v3/products/${p.id}`)); if (resMeta.ok) { const detailedP = await resMeta.json(); p.meta_data = detailedP.meta_data; p.translations = detailedP.translations; p.categories = detailedP.categories; } }

    const meta = p.meta_data || [];
    const acfZhName = pickZhName(meta);
    const acfEnName = pickEnName(meta);
    const acfEnDesc = pickEnDesc(meta);
    const translations = p.translations || {};
    const zhId = translations.zh || translations.zh_TW || (p.lang === 'zh-TW' ? p.id : null);
    let finalPrice = p.price || p.regular_price || "0";
    
    const productData = {
        id: p.id, linkedChineseId: zhId || p.id, name: p.name, 
        name_zh: acfZhName || p.name, name_en: acfEnName || p.name, 
        description: p.description || "", description_en: acfEnDesc || "", 
        price: finalPrice, images: p.images?.map(i => i.src) || [],
        sku: p.sku || "", categories: p.categories || []
    };

    // ✅ 抓取開團時間 (Periods)
    let periods = [];
    try { const timeRes = await fetch(`${String(base).replace(/\/+$/, "")}/wp-json/custom/v1/group-buy`); if (timeRes.ok) periods = await timeRes.json(); } catch (err) {}

    return {
      props: { product: productData, periods, zhSlug: p.slug, enSlug: p.slug, redirectDestination: null },
      revalidate: 10
    };
  } catch (err) { return { notFound: true, revalidate: 10 }; }
}