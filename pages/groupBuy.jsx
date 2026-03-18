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
// 🟢 設定正式上線網址 (解決 Google Search Console 收錄問題)
const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.memorycorner8.com";
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
      c.name === "常溫" ||
      c.slug?.toLowerCase() === "normal" ||
      c.name?.toLowerCase() === "normal",
  );

  const isFrozen = cats.some(
    (c) =>
      c.name === "冷凍" ||
      c.slug?.toLowerCase() === "freezing" ||
      c.name?.toLowerCase() === "freezing",
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
      description:
        "線上訂購有香 Memory Corner 精選團購商品。各式經典台味料理、冷凍包、在地小吃與醬料，在家就能輕鬆享受台灣好滋味！",
    },
    title: "團購商品",
    loading: "商品載入中...",
    add_to_cart: "加入購物車",
    add_success_prefix: "「",
    add_success_suffix: "」已加入購物車",
    unit: "份",
    currency: "CA$",
    breadcrumb: "團購商品",
    empty: "此分類目前沒有商品",
    all: "全部",
    prev_page: "上一頁",
    next_page: "下一頁",
    faq_q1: "團購商品何時可以下單？",
    faq_a1:
      "團購商品僅在特定的「開團期間」開放下單，非開團期間無法加入購物車。您可以查看網頁上的下次開團時間。",
    faq_q2: "取貨方式有哪些？",
    faq_a2:
      "我們提供「來店自取」與「外送宅配」服務。自取請至『有香ㄟ灶腳』門市；宅配部分區域若滿額可享免運費優惠。",
  },
  en: {
    seo: {
      title: "Group Buy | Memory Corner Group",
      description:
        "Order selected group buy products online from Memory Corner. Enjoy authentic Taiwanese frozen meals, snacks, and sauces at home easily!",
    },
    title: "GROUP BUY",
    loading: "Loading products...",
    add_to_cart: "Add to Cart",
    add_success_prefix: "",
    add_success_suffix: " has been added to cart",
    unit: "item(s)",
    currency: "CA$",
    breadcrumb: "Group Buy",
    empty: "No products in this category",
    all: "All",
    prev_page: "Prev",
    next_page: "Next",
    faq_q1: "When can I order group buy items?",
    faq_a1:
      "Group buy items can only be ordered during specific 'Group Buy Periods'. You can check the next available time on the page.",
    faq_q2: "What are the pickup/delivery options?",
    faq_a2:
      "We offer both 'Store Pickup' at Old Memory Kitchen and 'Delivery'. Free delivery is available for certain areas if the minimum order amount is met.",
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
  const { locale, query, isReady, asPath } = router;
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";
  const products = initialItems;

  const [activeCat, setActiveCat] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isReady) return;

    if (query.cat) {
      setActiveCat(String(query.cat));
    }

    if (query.page) {
      const pageNum = parseInt(query.page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [isReady, query.cat, query.page]);

  const updateUrlState = (newCat, newPage) => {
    setActiveCat(newCat);
    setCurrentPage(newPage);

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, cat: newCat, page: newPage },
      },
      undefined,
      { shallow: true },
    );
  };

  const [activePeriod, setActivePeriod] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [cart, setCart] = useState([]);
  useEffect(() => {
    cartStore.init?.();
    const unsub = cartStore.subscribe?.((c) => setCart([...(c || [])]));
    return typeof unsub === "function" ? unsub : undefined;
  }, []);

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

  const handleQtyChange = (product, nextVal, maxStock) => {
    if (nextVal === "") {
      setQtyMap((m) => ({ ...m, [product.id]: 0 }));
      return;
    }

    let val = parseInt(nextVal, 10);
    if (isNaN(val)) val = 0;
    val = Math.max(0, val);

    if (product.manage_stock && maxStock !== Infinity) {
      val = Math.min(val, Math.max(0, maxStock));
    }

    setQtyMap((m) => ({ ...m, [product.id]: val }));
  };

  const addToCart = (product) => {
    if (!activePeriod) {
      setShowGroupModal(true);
      return;
    }
    const safeQty = Math.max(1, qtyMap[product.id] ?? 0);
    if (safeQty <= 0) return;

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
        img: product.img || "/images/placeholder.png",
        price: Number(final.toFixed(2)),
        store_type: "group_buy",
        sku: product.sku || "",
        manage_stock: product.manage_stock,
        stock_quantity: product.stock_quantity,
      },
      safeQty,
    );

    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("open-cart"));

    const msg = isEn
      ? `${t.add_success_prefix}${displayName}${t.add_success_suffix} (${safeQty} ${t.unit})`
      : `${t.add_success_prefix}${displayName}${t.add_success_suffix}（${safeQty} ${t.unit}）`;
    showToast(msg);

    setQtyMap((m) => ({ ...m, [product.id]: 0 }));
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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateUrlState(activeCat, page);
      requestAnimationFrame(() =>
        listTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  };

  const handleCategoryChange = (catId) => {
    updateUrlState(catId, 1);
  };

  /* =================================================================
     ⭐ SEO 與結構化資料 (Structured Data)
     ================================================================= */

  const currentPath = asPath.split("?")[0];
  const currentUrl = `${SITE_URL}${currentPath}`;
  const hrefLangZh = `${SITE_URL}/groupBuy`;
  const hrefLangEn = `${SITE_URL}/en/groupBuy`;

  // 1. 麵包屑導覽
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEn ? "Home" : "首頁",
        item: `${SITE_URL}${isEn ? "/en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.breadcrumb,
        item: currentUrl,
      },
    ],
  };

  // 2. CollectionPage 宣告
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.seo.title,
    description: t.seo.description,
    url: currentUrl,
  };

  // 3. ItemList (產品清單) - 動態對應當前頁面的商品
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: currentProducts.map((p, index) => {
      const { final } = getDiscountedPrice(p);
      const isOutOfStock =
        p.stock_status === "outofstock" ||
        (p.manage_stock && p.stock_quantity <= 0);
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: isEn ? p.name_en || p.name : p.name_zh || p.name,
          image: p.img || `${SITE_URL}/images/placeholder.png`,
          sku: p.sku || `${p.id}`,
          url: `${SITE_URL}${isEn ? "/en" : ""}/product/${p.slug}`,
          offers: {
            "@type": "Offer",
            price: final.toFixed(2),
            priceCurrency: "CAD",
            availability: isOutOfStock
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
            url: `${SITE_URL}${isEn ? "/en" : ""}/product/${p.slug}`,
          },
        },
      };
    }),
  };

  // 4. FAQ 常見問題
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t.faq_q1,
        acceptedAnswer: {
          "@type": "Answer",
          text: t.faq_a1,
        },
      },
      {
        "@type": "Question",
        name: t.faq_q2,
        acceptedAnswer: {
          "@type": "Answer",
          text: t.faq_a2,
        },
      },
    ],
  };

  // 5. 實體門店宣告
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Old Memory Kitchen 有香ㄟ灶腳",
    image: `${SITE_URL}/images/logo/有香餐飲集團-logo.png`,
    "@id": `${SITE_URL}/#oldmemorykitchen`,
    url: SITE_URL,
    telephone: "+1-778-723-1685",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "8080 Leslie Rd #150",
      addressLocality: "Richmond",
      addressRegion: "BC",
      postalCode: "V6X 4A8",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 49.1837,
      longitude: -123.1336,
    },
    servesCuisine: "Taiwanese, Taiwanese Groceries, Frozen Food",
  };

  return (
    <Layout>
      <Head>
        <title key="title">{t.seo.title}</title>
        <meta name="description" content={t.seo.description} />

        {/* Canonical 與多語系設定 */}
        <link rel="canonical" href={currentUrl} />
        <link rel="alternate" hrefLang="x-default" href={hrefLangZh} />
        <link rel="alternate" hrefLang="zh-Hant" href={hrefLangZh} />
        <link rel="alternate" hrefLang="en" href={hrefLangEn} />

        {/* Open Graph (FB/IG) */}
        <meta property="og:title" content={t.seo.title} />
        <meta property="og:description" content={t.seo.description} />
        <meta
          property="og:image"
          content={`${SITE_URL}/images/group-buy/2025-10--IG-1920x768px-01.webp`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.seo.title} />
        <meta name="twitter:description" content={t.seo.description} />
        <meta
          name="twitter:image"
          content={`${SITE_URL}/images/group-buy/2025-10--IG-1920x768px-01.webp`}
        />

        {/* JSON-LD 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionPageSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />

        {/* 隱藏數字輸入框預設箭頭的 CSS */}
        <style>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
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
                      onClick={() => handleCategoryChange(c.id)}
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

                        const cartItem = cart.find(
                          (c) =>
                            c.productId === p.id || c.id === (p.sku || p.id),
                        );
                        const inCartQty = cartItem ? cartItem.qty || 0 : 0;

                        const maxStock =
                          p.manage_stock && p.stock_quantity !== null
                            ? Math.max(0, p.stock_quantity - inCartQty)
                            : Infinity;

                        const isOutOfStock =
                          p.stock_status === "outofstock" ||
                          (p.manage_stock && maxStock <= 0);

                        return (
                          <motion.article
                            key={p.id}
                            className="flex flex-col bg-white rounded-xl p-2.5 sm:p-3 shadow-sm ring-1 ring-black/5 hover:shadow-md transition group"
                          >
                            <Link
                              href={`/product/${p.slug}?from=groupBuy`}
                              className="relative w-full aspect-square  rounded-lg overflow-hidden"
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
                              {p.manage_stock &&
                                maxStock !== Infinity &&
                                !isOutOfStock && (
                                  <div className="text-[12px] sm:text-[13px] text-gray-500 text-center mb-1.5 font-bold tracking-wide">
                                    {isEn
                                      ? `Stock: ${maxStock}`
                                      : `目前庫存: ${maxStock}`}
                                  </div>
                                )}

                              {isOutOfStock ? (
                                <div className="py-1.5 text-center text-sm font-bold text-red-600 bg-red-50 rounded-lg mb-2">
                                  {isEn ? "Sold Out" : "已售完 / 補貨中"}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleQtyChange(p, q - 1, maxStock)
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={q <= 0}
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min={0}
                                    max={
                                      maxStock !== Infinity
                                        ? maxStock
                                        : undefined
                                    }
                                    value={q === 0 ? "" : q}
                                    placeholder="0"
                                    onChange={(e) =>
                                      handleQtyChange(
                                        p,
                                        e.target.value,
                                        maxStock,
                                      )
                                    }
                                    className="w-12 text-center text-sm rounded-lg border border-gray-200 py-1.5 focus:outline-none focus:border-amber-400"
                                  />
                                  <button
                                    onClick={() =>
                                      handleQtyChange(p, q + 1, maxStock)
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={q >= maxStock}
                                  >
                                    +
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => addToCart(p)}
                                disabled={q <= 0 || isOutOfStock}
                                className={`mt-2 w-full rounded-lg py-1.5 text-sm font-medium text-white transition-all shadow-sm ${
                                  q > 0 && !isOutOfStock
                                    ? "bg-[#e7a042] hover:bg-[#d69035] active:scale-[0.98]"
                                    : "bg-gray-300 cursor-not-allowed"
                                }`}
                              >
                                {isOutOfStock
                                  ? isEn
                                    ? "Sold Out"
                                    : "已售完"
                                  : t.add_to_cart}
                              </button>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                    {/* 分頁按鈕 */}
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

// 🟢 [最終完美版] 伺服器端抓取邏輯不變
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

      if (!r.ok) break;

      const chunk = await r.json();

      if (Array.isArray(chunk) && chunk.length > 0) {
        rawProducts.push(...chunk);
      }

      if (!Array.isArray(chunk) || chunk.length < 100) {
        hasMoreProducts = false;
      } else {
        currentPageFetch++;
      }
    }

    log(1, `成功抓回無數量限制的所有商品，共 ${rawProducts.length} 筆`);

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
      displayProduct.sku = baseObj.sku || "";

      const priceSource = enObj || zhObj || p;
      displayProduct.regular_price = priceSource.regular_price;
      displayProduct.price = priceSource.price;
      displayProduct.sale_price = priceSource.sale_price;

      const stockSource =
        [zhObj, enObj, p].find((obj) => obj && obj.manage_stock) || priceSource;

      displayProduct.manage_stock = stockSource.manage_stock || false;
      displayProduct.stock_quantity =
        stockSource.stock_quantity !== null
          ? Number(stockSource.stock_quantity)
          : null;
      displayProduct.stock_status = stockSource.stock_status;

      let imgSrc = baseObj.images?.[0]?.src;
      if (imgSrc && !imgSrc.startsWith("http"))
        imgSrc = `${ensureURL(base)}${imgSrc}`;
      displayProduct.img = imgSrc || "/images/placeholder.png";

      displayProduct.categories = baseObj.categories || [];

      finalProducts.push(displayProduct);
    });

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
