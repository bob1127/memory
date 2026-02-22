import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

// 設定
const REVALIDATE_TIME = 10;
const APPEAR_DELAY_MS = 800;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const ITEMS_PER_PAGE = 12; // 每頁 12 筆

const MARQUEE_ITEMS = [
  { src: "/images/gif/output-onlinegiftools-25.gif", alt: "beer animation 1" },
  { src: "/images/gif/output-onlinegiftools-58.gif", alt: "beer animation 2" },
  { src: "/images/gif/output-onlinegiftools-52.gif", alt: "beer animation 3" },
  { src: "/images/gif/output-onlinegiftools-2.gif", alt: "beer animation 4" },
  { src: "/images/gif/output-onlinegiftools-5.gif", alt: "beer animation 5" },
];

/* =================================================================
   1. UI 翻譯設定
   ================================================================= */
const PAGE_TRANSLATIONS = {
  "zh-TW": {
    seo: {
      title: "精釀啤酒訂購 | 有香 Memory Corner",
      description:
        "線上訂購有香 Memory Corner 精選精釀啤酒。提供多種風味，適合搭配我們的經典台式料理。",
    },
    title: "精釀啤酒 ORDER",
    loading: "商品載入中...",
    add_to_cart: "加入購物車",
    unit: "箱",
    currency: "NT$",
    breadcrumb: "啤酒訂購",
    no_product: "此分類尚無產品。",
    add_success: "已加入購物車",
    prev_page: "上一頁",
    next_page: "下一頁",
    tab_all: "全部",
  },
  en: {
    seo: {
      title: "Craft Beer Order | Memory Corner",
      description:
        "Order selected craft beers online from Memory Corner. Various flavors available to pair with our authentic Taiwanese cuisine.",
    },
    title: "Craft Beer ORDER",
    loading: "Loading products...",
    add_to_cart: "Add to Cart",
    unit: "box(es)",
    currency: "NT$",
    breadcrumb: "Beer Order",
    no_product: "No products found in this category.",
    add_success: "has been added to cart",
    prev_page: "Prev",
    next_page: "Next",
    tab_all: "All",
  },
};

// 價格解析 Helper
const priceFromItem = (p) => {
  if (!p) return 0;
  if (p.prices) {
    const rawPrice =
      p.prices.price || p.prices.sale_price || p.prices.regular_price;
    if (rawPrice) return Number(rawPrice) / 100;
  }
  const raw = p.price || p.sale_price || p.regular_price || 0;
  if (typeof raw === "string") return parseFloat(raw);
  return Number(raw);
};

const stripHtml = (html) => (!html ? "" : html.replace(/<[^>]*>?/gm, ""));

/* =================================================================
   Main Page Component
   ================================================================= */
export default function BeerOrderPage({
  initialItems = [],
  categoryTabs = [],
}) {
  const { locale, asPath } = useRouter();
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const [products, setProducts] = useState(initialItems);
  const [qtyMap, setQtyMap] = useState({});
  const [toast, setToast] = useState(null);
  const [showMarquee, setShowMarquee] = useState(false);

  // 分類 Tabs 狀態
  const [activeTab, setActiveTab] = useState("all");

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);
  const toastTimerRef = useRef(null);

  // 初始化與延遲顯示跑馬燈
  useEffect(() => {
    if (initialItems) {
      setProducts(initialItems);
      setQtyMap(Object.fromEntries(initialItems.map((p) => [p.id, 1])));
    }
    const timer = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => {
      clearTimeout(timer);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [initialItems]);

  // 數量控制
  const setQty = (id, next) =>
    setQtyMap((m) => ({ ...m, [id]: Math.max(0, parseInt(next) || 0) }));

  // 加入購物車
  const addToCart = (product) => {
    const qty = Math.max(1, qtyMap[product.id] || 0);

    cartStore.add(
      {
        id: product.linkedChineseId || product.id,
        productId: product.id,
        name: product.name,
        name_zh: isEn ? product.name_zh || product.name : product.name,
        name_en: isEn ? product.name : product.name_en || product.name,
        img: product.img,
        price: priceFromItem(product),
        store_type: "beer", // 標記為啤酒商品
      },
      qty,
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }

    const msg = isEn
      ? `"${product.name}" ${t.add_success} (${qty} ${t.unit})`
      : `「${product.name}」${t.add_success} (${qty} ${t.unit})`;

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), text: msg });
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
    setQty(product.id, 0); // 加入後歸零
  };

  /* ----- 過濾與分頁邏輯 ----- */
  // 1. 先依據 Tab 過濾商品
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter(
      (p) => p.categories && p.categories.includes(activeTab),
    );
  }, [products, activeTab]);

  // 2. 再計算分頁
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1); // 切換分類時回到第一頁
  };

  /* ----- 動畫設定 ----- */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, y: -10 },
  };

  /* ----- SEO JSON-LD ----- */
  const currentUrl = `${SITE_URL}${asPath}`;
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

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.img,
        description: stripHtml(p.short_description),
        sku: p.sku || `${p.id}`,
        url: `${SITE_URL}/beer/${p.slug}`,
        offers: {
          "@type": "Offer",
          price: priceFromItem(p),
          priceCurrency: "TWD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/beer/${p.slug}`,
        },
      },
    })),
  };

  return (
    <Layout>
      <Head>
        <title>{t.seo.title}</title>
        <meta name="description" content={t.seo.description} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:title" content={t.seo.title} />
        <meta property="og:description" content={t.seo.description} />
        <meta
          property="og:image"
          content={products[0]?.img || `${SITE_URL}/images/logo-6.png`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0, y: -24 }}
              className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center mb-8"
            >
              <div className="rounded-full bg-[#e7a042] text-white px-6 py-2 shadow-lg text-sm sm:text-base font-bold">
                {toast.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Marquee (Top) */}
        <AnimatePresence>
          {showMarquee && (
            <motion.div
              className="pointer-events-none w-full py-6 overflow-hidden absolute z-30 left-0 top-20"
              initial={{ opacity: 0, y: 64 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <Marquee velocity={28} direction="rtl">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <div key={`m1-${idx}`} className="mx-6">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-[clamp(220px,60vw,420px)] sm:w-[clamp(260px,50vw,420px)] object-contain h-auto max-w-full"
                    />
                  </div>
                ))}
              </Marquee>
              <Marquee velocity={24} direction="ltr">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <div key={`m2-${idx}`} className="mx-6">
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-[clamp(220px,60vw,420px)] sm:w-[clamp(260px,50vw,420px)] object-contain h-auto max-w-full"
                    />
                  </div>
                ))}
              </Marquee>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden">
          <motion.div
            className="absolute right-10 top-20 md:right-20 md:top-20 z-20"
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src="/images/logo-6.png"
              alt="Logo"
              width={800}
              height={500}
              priority
              className="w-[150px] md:w-[200px]"
            />
          </motion.div>
          <motion.div
            className="absolute left-[-10%] sm:left-10 bottom-20 z-20"
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Image
              src="/images/beer02.png"
              alt="Beer"
              width={800}
              height={500}
              priority
              className="w-[300px] sm:w-[400px] lg:w-[700px]"
            />
          </motion.div>
          <h1 className="sr-only">{t.seo.title}</h1>
        </section>

        {/* Product List Section */}
        <section
          className="bg-white min-h-screen py-24 relative z-10"
          ref={listTopRef}
        >
          <div className="flex flex-col justify-center items-center pb-8 pt-4">
            <h2 className="text-[20px] md:text-[24px] font-bold tracking-wider uppercase border-b-2 border-[#e7a042] pb-2 mb-8">
              {t.title}
            </h2>

            {/* 🔥 分類 Tabs 區塊：把判斷條件從 > 1 改為 > 0 */}
            {categoryTabs.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-4 max-w-4xl w-full">
                <button
                  onClick={() => handleTabChange("all")}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeTab === "all"
                      ? "bg-[#e7a042] text-white shadow-md scale-105"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {t.tab_all}
                </button>
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-[#e7a042] text-white shadow-md scale-105"
                        : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="max-w-[1600px] mx-auto w-[90%] md:w-[86%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${currentPage}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {currentProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                      {currentProducts.map((p) => {
                        const q = qtyMap[p.id] ?? 0;
                        const displayPrice = priceFromItem(p);
                        return (
                          <motion.article
                            key={p.id}
                            variants={cardVariants}
                            className="flex flex-col bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm ring-1 ring-black/5 hover:shadow-md transition group"
                          >
                            <Link
                              href={`/beer/${p.slug}`}
                              className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden"
                            >
                              <Image
                                src={p.img}
                                alt={p.name}
                                fill
                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.05]"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            </Link>

                            <div className="text-center px-1 mt-2 flex-grow flex flex-col">
                              <h3
                                className="text-[13px] sm:text-[14px] font-bold leading-tight line-clamp-2 min-h-[2.4em] text-gray-800"
                                title={p.name}
                              >
                                {p.name}
                              </h3>
                              <div className="mt-1 flex items-center justify-center">
                                <span className="text-black/80 font-medium text-sm">
                                  CA$ {displayPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2.5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setQty(p.id, q - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                                  disabled={q <= 0}
                                >
                                  −
                                </button>
                                <input
                                  min={0}
                                  value={q}
                                  onChange={(e) => setQty(p.id, e.target.value)}
                                  className="w-10 text-center text-sm rounded-lg py-1.5 focus:outline-none text-gray-600 font-medium"
                                />
                                <button
                                  onClick={() => setQty(p.id, q + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => addToCart(p)}
                                disabled={q <= 0}
                                className={`mt-3 w-full rounded-full py-1.5 text-sm font-bold text-white transition-all shadow-sm ${q > 0 ? "bg-[#e7a042] hover:bg-[#d69035] active:scale-[0.98]" : "bg-gray-300 cursor-not-allowed"}`}
                              >
                                {t.add_to_cart}
                              </button>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12 flex justify-center items-center gap-2"
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                            className={`w-9 h-9 rounded-full text-sm font-bold transition flex items-center justify-center ${
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
                          className="px-4 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {t.next_page}
                        </button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-500 font-bold tracking-widest">
                    {t.no_product}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Footer Map Area */}
        <section className="bg-white pt-10 flex flex-col">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.353683838637!2d-123.12648792350726!3d49.17464097931885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486752605342a73%3A0x6b492376d8b28f7!2sMemory%20Corner!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
            className="w-full h-[400px] md:h-[500px] grayscale opacity-80 border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="py-4 bg-black overflow-hidden">
            <Marquee gradient={false} speed={40}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="text-[40px] md:text-[60px] mx-8 font-bold text-white/20 tracking-widest font-mono"
                >
                  MEMORY CORNER
                </span>
              ))}
            </Marquee>
          </div>
        </section>
      </main>
    </Layout>
  );
}

// Helper
function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}

export async function getStaticProps({ locale }) {
  const base = process.env.WC_URL;
  const wpLang = locale === "en" ? "en" : "zh_TW";

  // 依照語言設定尋找對應的父分類 Slug
  const targetSlugs =
    wpLang === "en"
      ? ["beer-series", "beer-en", "beer"]
      : ["beers", "啤酒系列", "beer-zh"];

  let initialItems = [];
  let categoryTabs = [];

  try {
    const catUrl = new URL(
      `${ensureURL(base)}/wp-json/wc/store/products/categories`,
    );
    catUrl.searchParams.set("per_page", "100");
    const catRes = await fetch(catUrl.toString());
    const categories = await catRes.json();

    // 尋找目標的父分類 (啤酒主分類)
    let targetCat = null;
    if (Array.isArray(categories)) {
      targetCat = categories.find(
        (c) =>
          targetSlugs.includes(c.slug) ||
          targetSlugs.includes(decodeURIComponent(c.slug)),
      );
    }
    const categoryId = targetCat?.id;

    if (categoryId) {
      // 抓出所有「父分類為 categoryId」的子分類做為 Tabs
      const childCats = categories.filter((c) => c.parent === categoryId);
      childCats.forEach((c) => {
        categoryTabs.push({ id: c.id, name: c.name });
      });

      const storeUrl = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
      storeUrl.searchParams.set("per_page", "100");
      storeUrl.searchParams.set("category", categoryId); // WooCommerce 抓取父分類會自動包含子分類商品

      const res = await fetch(storeUrl.toString());
      const rawList = await res.json();
      const list = Array.isArray(rawList) ? rawList : [];

      initialItems = list.map((p) => {
        let imgSrc = p.images?.[0]?.src;
        if (imgSrc && !imgSrc.startsWith("http"))
          imgSrc = `${ensureURL(base)}${imgSrc}`;
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          sku: p.sku || "",
          img: imgSrc || "/images/placeholder.png",
          linkedChineseId: p.id,
          prices: p.prices,
          short_description: p.short_description || "",
          categories: p.categories?.map((c) => c.id) || [], // 記錄商品所屬的分類 IDs (供前端過濾使用)
        };
      });
    }
  } catch (e) {
    console.error("SSG Error:", e);
  }

  return {
    props: {
      initialItems,
      categoryTabs,
    },
    revalidate: REVALIDATE_TIME,
  };
}
