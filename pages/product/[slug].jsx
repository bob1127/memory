"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import { ChevronRight, Minus, Plus, ShoppingCart, Globe } from "lucide-react";
import "swiper/css";
import "swiper/css/thumbs";

/* =========================================================
   1. CONFIG
   ========================================================= */
function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const SITE_URL = ensureURL(SITE_URL_RAW);
const SITE_NAME = "Memory Corner";

const stripHtml = (html) => (!html ? "" : html.replace(/<[^>]*>?/gm, ""));
const formatTimeDisplay = (isoString) => {
  if (!isoString) return "TBA";
  try {
    return new Date(isoString).toLocaleString("en-CA", {
      timeZone: "America/Vancouver",
      hour12: false,
    });
  } catch {
    return isoString;
  }
};

function getActivePeriod(periods = []) {
  const now = Date.now();
  return periods.find(
    (p) =>
      now >= new Date(p.start).getTime() && now <= new Date(p.end).getTime(),
  );
}
function getNextPeriod(periods = []) {
  const now = Date.now();
  return (
    periods
      .filter((p) => new Date(p.start).getTime() > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null
  );
}

const PAGE_TRANSLATIONS = {
  "zh-TW": {
    add_to_cart: "加入購物車",
    add_success_prefix: "「",
    add_success_suffix: "」已加入購物車",
    breadcrumb_home: "首頁",
    breadcrumb_groupbuy: "團購商品",
    unit: "份",
    switch_lang: "Switch to English",
  },
  en: {
    add_to_cart: "Add to Cart",
    add_success_prefix: "",
    add_success_suffix: " has been added to cart",
    breadcrumb_home: "Home",
    breadcrumb_groupbuy: "Group Buy",
    unit: "item(s)",
    switch_lang: "切換至中文",
  },
};

/* =========================================================
   2. MODAL & INNER COMPONENT
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
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="border-b px-6 py-4 flex items-center gap-3">
              <div className="bg-amber-100 text-amber-600 rounded-full h-10 w-10 grid place-items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  目前無法下單 (Group-Buy Closed)
                </h3>
                <p className="text-xs text-gray-500">請等待下一次開團</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-800 font-medium">
                很抱歉，本商品僅在
                <span className="font-bold mx-1">「開團期間」</span>開放下單。
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="font-bold text-sm text-gray-900">
                  📅 下一次開團時間
                </div>
                <div className="font-mono text-sm text-gray-800">
                  {timeRange}
                </div>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-center bg-gray-50">
              <button
                onClick={onClose}
                className="border border-gray-300 bg-white px-6 py-2 rounded-full hover:bg-gray-100 text-sm font-medium"
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

export default function ProductInner({
  product,
  periods = [],
  redirectDestination,
  zhSlug,
  enSlug,
}) {
  const router = useRouter();
  const { locale, asPath, replace, isReady } = router;
  const isEn = locale === "en";
  const t = isEn ? PAGE_TRANSLATIONS.en : PAGE_TRANSLATIONS["zh-TW"];
  const [activePeriod, setActivePeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [toast, setToast] = useState(false);

  // 🟢 狀態管理
  const [selectedImage, setSelectedImage] = useState(product?.img);
  const [qty, setQty] = useState(1);

  // 🌟 1. 完美同步：訂閱全域購物車狀態
  const [cart, setCart] = useState([]);
  useEffect(() => {
    cartStore.init?.();
    const unsub = cartStore.subscribe?.((c) => setCart([...(c || [])]));
    return typeof unsub === "function" ? unsub : undefined;
  }, []);

  // 當切換產品或語言時，重置主圖與數量
  useEffect(() => {
    if (product) {
      setSelectedImage(product.img);
      setQty(1);
    }
  }, [product]);

  useEffect(() => {
    const check = () => {
      setActivePeriod(getActivePeriod(periods));
      setNextPeriod(getNextPeriod(periods));
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [periods]);

  useEffect(() => {
    if (!isReady) return;
    if (redirectDestination) {
      replace(redirectDestination);
    }
  }, [redirectDestination, replace, isReady]);

  if (!product) return null;

  const targetLocalePrefix = isEn ? "" : "/en";
  const customSwitchHref =
    enSlug && zhSlug
      ? `${targetLocalePrefix}/product/${isEn ? zhSlug : enSlug}`
      : `${targetLocalePrefix}/groupBuy`;

  // 🌟 2. 完美同步庫存公式：後台真實庫存 - 購物車內已選數量
  // 尋找主商品在購物車內的數量
  const cartItem = cart.find(
    (c) => c.productId === product.id || c.id === (product.sku || product.id),
  );
  const inCartQty = cartItem ? cartItem.qty || 0 : 0;

  // 動態計算最新剩餘數量 (供畫面顯示與輸入框限制)
  const maxStock =
    product.manage_stock && product.stock_quantity !== null
      ? Math.max(0, product.stock_quantity - inCartQty)
      : Infinity;

  // 缺貨判定
  const isOutOfStock =
    product.stock_status === "outofstock" ||
    (product.manage_stock && maxStock <= 0);

  // 數量變更防呆
  const handleQtyChange = (nextVal) => {
    if (nextVal === "") {
      setQty("");
      return;
    }
    let val = parseInt(nextVal, 10);
    if (isNaN(val)) val = 1;
    val = Math.max(1, val);

    if (product.manage_stock && maxStock !== Infinity) {
      val = Math.min(val, Math.max(1, maxStock));
    }
    setQty(val);
  };

  // 顯示用的名稱與描述
  const displayName = isEn
    ? product.name_en || product.name
    : product.name_zh || product.name;
  const displayDesc = product.description;
  const originalPrice = Number(product.price || 0);
  let finalPrice = originalPrice;
  let discountLabel = "";
  const cats = product.categories || [];

  const isRoomTemp = cats.some(
    (c) =>
      c.name === "常溫" || c.slug?.includes("room") || c.slug === "ambient",
  );
  const isFrozen = cats.some(
    (c) => c.name === "冷凍" || c.slug?.includes("frozen"),
  );

  if (isRoomTemp) {
    finalPrice = originalPrice * 0.88;
    discountLabel = isEn ? "12% OFF" : "常溫 88折";
  } else if (isFrozen) {
    finalPrice = originalPrice * 0.9;
    discountLabel = isEn ? "10% OFF" : "冷凍 9折";
  }
  const hasDiscount = finalPrice < originalPrice;

  const imageList = (
    product.images?.length ? product.images : ["/images/placeholder.png"]
  ).map((s) =>
    s.startsWith("http") ? s : `${SITE_URL}/${s.replace(/^\//, "")}`,
  );
  const mainImage = imageList[0];
  const hrefLangZh = zhSlug ? `${SITE_URL}/product/${zhSlug}` : `${SITE_URL}/`;
  const hrefLangEn = enSlug
    ? `${SITE_URL}/en/product/${enSlug}`
    : `${SITE_URL}/en/`;

  // 🟢 3. 加入購物車邏輯
  const addToCart = () => {
    if (!activePeriod) {
      setShowModal(true);
      return;
    }

    const cartId = product.sku && product.sku !== "" ? product.sku : product.id;
    const safeQty = Math.max(1, Number(qty) || 1);

    cartStore.add(
      {
        id: cartId,
        productId: product.id,
        name: displayName,
        name_zh: product.name_zh || displayName,
        name_en: product.name_en || displayName,
        img: mainImage,
        price: Number(finalPrice.toFixed(2)),
        store_type: "group_buy",
        sku: product.sku,
        // 👇 將庫存資訊傳給 Navbar 的購物車做防呆
        manage_stock: product.manage_stock,
        stock_quantity: product.stock_quantity,
      },
      safeQty,
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }

    setToast(true);
    setQty(1); // 加完後恢復為 1
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <Layout>
      <Head>
        <title>{`${displayName} | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content={stripHtml(displayDesc).substring(0, 150)}
        />
        <link rel="canonical" href={`${SITE_URL}${asPath.split("?")[0]}`} />
        <link rel="alternate" hrefLang="zh-Hant" href={hrefLangZh} />
        <link rel="alternate" hrefLang="en" href={hrefLangEn} />
        <meta property="og:title" content={displayName} />
        <meta property="og:image" content={mainImage} />

        {/* 🌟 隱藏數字輸入框預設箭頭的 CSS */}
        <style>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </Head>
      <section className="w-full bg-white mx-auto px-4 sm:px-6 lg:px-8 py-[100px]">
        <nav className="max-w-[1200px] mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Link href={isEn ? "/en" : "/"} className="hover:text-black">
              {t.breadcrumb_home}
            </Link>{" "}
            <span className="mx-2">/</span>
            <Link
              href={isEn ? "/en/groupBuy" : "/groupBuy"}
              className="hover:text-black"
            >
              {t.breadcrumb_groupbuy}
            </Link>{" "}
            <span className="mx-2">/</span>
            <span className="text-black font-medium">{displayName}</span>
          </div>

          <Link
            href={customSwitchHref}
            className="flex items-center gap-1 text-[#e7a042] hover:text-[#c5853d] font-medium transition-colors whitespace-nowrap"
          >
            <Globe size={16} />
            {t.switch_lang}
          </Link>
        </nav>
        <GroupNoticeModal
          open={showModal}
          onClose={() => setShowModal(false)}
          nextPeriod={nextPeriod}
        />
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <Swiper
              modules={[Thumbs]}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              className="aspect-square rounded-xl border border-gray-100 mb-4 bg-gray-50 group"
            >
              {imageList.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={displayName}
                      fill
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      priority={i === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {imageList.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                slidesPerView={5}
                spaceBetween={10}
                watchSlidesProgress
              >
                {imageList.map((img, i) => (
                  <SwiperSlide key={i}>
                    <div className="relative aspect-square w-full rounded-lg border overflow-hidden cursor-pointer transition-all hover:opacity-100 opacity-60">
                      <Image
                        src={img}
                        alt="thumb"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {displayName}
            </h1>
            <div className="flex flex-col items-start gap-1">
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-red-700">
                      CA$ {finalPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                      {discountLabel}
                    </span>
                  </div>
                  <span className="text-gray-400 line-through text-lg">
                    CA$ {originalPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <div className="text-2xl font-bold text-black">
                  CA$ {finalPrice.toFixed(2)}
                </div>
              )}
            </div>

            <div
              className="prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: displayDesc }}
            />

            <div className="mt-4 pt-6 border-t border-gray-100">
              {/* 🌟 5. 新增：庫存即時顯示 */}
              {product.manage_stock &&
                maxStock !== Infinity &&
                !isOutOfStock && (
                  <div className="text-[14px] text-gray-500 font-bold tracking-wide mb-3">
                    {isEn ? `Stock: ${maxStock}` : `目前庫存: ${maxStock}`}
                  </div>
                )}

              {/* 🌟 6. 缺貨判定與數量選取器 */}
              {isOutOfStock ? (
                <div className="py-4 text-center text-lg font-bold text-red-600 bg-red-50 rounded-xl w-full mb-8">
                  {isEn ? "Sold Out" : "已售完 / 補貨中"}
                </div>
              ) : (
                <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                  <div className="flex h-14 items-center rounded-2xl border border-gray-300 bg-white px-2 shadow-sm focus-within:border-[#e7a042] focus-within:ring-1 focus-within:ring-[#e7a042] transition-all w-[140px] shrink-0">
                    <button
                      onClick={() => handleQtyChange(qty - 1)}
                      disabled={qty <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={18} />
                    </button>

                    <input
                      type="number"
                      value={qty === 0 ? "" : qty}
                      placeholder="1"
                      onChange={(e) => handleQtyChange(e.target.value)}
                      className="flex-1 w-full bg-transparent text-center text-lg font-medium outline-none border-none ring-0 p-0"
                    />

                    <button
                      onClick={() => handleQtyChange(qty + 1)}
                      disabled={qty >= maxStock}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={qty <= 0 || isOutOfStock}
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#e7a042] px-8 text-lg font-bold text-white transition-all active:scale-95 hover:bg-[#d69035] shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} /> {t.add_to_cart}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#c1a46f] text-white px-6 py-3 rounded-full shadow-lg z-50 whitespace-nowrap"
          >
            {t.add_success_prefix}
            {displayName}
            {t.add_success_suffix} ({qty} {t.unit})
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* =========================================================
   3. SERVER SIDE
   ========================================================= */

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

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

  try {
    let p = null;
    const res = await fetch(
      buildAuthUrl("/wp-json/wc/v3/products", {
        slug: encodeURIComponent(String(paramVal)),
      }),
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) p = data[0];

    if (!p || !p.id) return { notFound: true, revalidate: 10 };

    // 檢查語言正確性 (Redirect)
    const productLang =
      p.lang || p.meta_data?.find((m) => m.key === "lang")?.value;
    const targetPrefix = locale === "en" ? "en" : "zh";
    if (productLang && !productLang.startsWith(targetPrefix)) {
      const translations = p.translations || {};
      const relatedId =
        locale === "en"
          ? translations.en
          : translations.zh || translations.zh_TW || translations.zh_Hant;
      if (relatedId) {
        const relRes = await fetch(
          buildAuthUrl(`/wp-json/wc/v3/products/${relatedId}`),
        );
        if (relRes.ok) {
          const relP = await relRes.json();
          if (relP.slug) {
            return {
              redirect: {
                destination:
                  locale === "en"
                    ? `/en/product/${relP.slug}`
                    : `/product/${relP.slug}`,
                permanent: false,
              },
            };
          }
        }
      }
    }

    if (!p.meta_data) {
      const resMeta = await fetch(
        buildAuthUrl(`/wp-json/wc/v3/products/${p.id}`),
      );
      if (resMeta.ok) {
        const detailedP = await resMeta.json();
        p = { ...p, ...detailedP };
      }
    }

    // 🟢 抓取翻譯語言的「完整資料」(為了同步庫存與價格)
    const translations = p.translations || {};
    const otherLangId =
      locale === "en"
        ? translations.zh || translations.zh_TW || translations.zh_Hant
        : translations.en;

    let otherP = null;
    if (otherLangId) {
      try {
        const otherRes = await fetch(
          buildAuthUrl(`/wp-json/wc/v3/products/${otherLangId}`),
        );
        if (otherRes.ok) {
          otherP = await otherRes.json();
        }
      } catch (e) {}
    }

    // 🌟 [核心同步雷達] 定義中文與英文物件
    const isZhLocale = locale === "zh-TW";
    const zhObj = isZhLocale ? p : otherP;
    const enObj = isZhLocale ? otherP : p;

    // 確保價格與列表頁統一 (優先抓英文版)
    const priceSource = enObj || zhObj || p;
    // 確保庫存永遠抓取「有開管理庫存」的那一方 (通常是中文版)
    const stockSource =
      [zhObj, enObj, p].find((obj) => obj && obj.manage_stock) || priceSource;

    // 整合名稱
    const zhId =
      translations.zh ||
      translations.zh_TW ||
      (p.lang === "zh-TW" ? p.id : null);
    const linkedChineseId = locale === "en" ? zhId : p.id;
    const currentName = p.name;
    const finalNameZh = zhObj ? zhObj.name : currentName;
    const finalNameEn = enObj ? enObj.name : currentName;

    // 封裝最終傳給前端的資料
    const productData = {
      id: p.id,
      linkedChineseId: linkedChineseId || p.id,
      name: p.name,
      name_zh: finalNameZh,
      name_en: finalNameEn,
      description: p.description || "",
      // 套用同步鎖的資料
      price: priceSource.price || priceSource.regular_price || "0",
      regular_price: priceSource.regular_price || null,
      sale_price: priceSource.sale_price || null,
      manage_stock: stockSource.manage_stock || false,
      stock_quantity:
        stockSource.stock_quantity !== null
          ? Number(stockSource.stock_quantity)
          : null,
      stock_status: stockSource.stock_status || "instock",

      images: p.images?.map((i) => i.src) || [],
      sku: p.sku || "",
      categories: p.categories || [],
      lang: p.lang,
    };

    let periods = [];
    try {
      const timeRes = await fetch(
        `${String(base).replace(/\/+$/, "")}/wp-json/custom/v1/group-buy`,
      );
      if (timeRes.ok) periods = await timeRes.json();
    } catch (err) {}

    return {
      props: {
        product: productData,
        periods,
        zhSlug: p.slug,
        enSlug: p.slug,
        redirectDestination: null,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error(err);
    return { notFound: true, revalidate: 10 };
  }
}
