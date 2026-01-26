import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

// 設定
const REVALIDATE_TIME = 10; // ISR 更新頻率 (秒)
const APPEAR_DELAY_MS = 800;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

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
      description: "線上訂購有香 Memory Corner 精選精釀啤酒。提供多種風味，適合搭配我們的經典台式料理。",
    },
    title: "精釀啤酒 ORDER",
    loading: "商品載入中...",
    add_to_cart: "加入購物車",
    unit: "箱",
    currency: "NT$",
    breadcrumb: "啤酒訂購",
    no_product: "此分類尚無產品。",
    add_success: "已加入購物車",
  },
  en: {
    seo: {
      title: "Craft Beer Order | Memory Corner",
      description: "Order selected craft beers online from Memory Corner. Various flavors available to pair with our authentic Taiwanese cuisine.",
    },
    title: "Craft Beer ORDER",
    loading: "Loading products...",
    add_to_cart: "Add to Cart",
    unit: "box(es)",
    currency: "NT$",
    breadcrumb: "Beer Order",
    no_product: "No products found in this category.",
    add_success: "has been added to cart",
  },
};

// 價格解析 Helper
const priceFromItem = (p) => {
  if (!p) return 0;
  // 處理 WooCommerce Store API 格式
  if (p.prices) {
    const rawPrice = p.prices.price || p.prices.sale_price || p.prices.regular_price;
    if (rawPrice) return Number(rawPrice) / 100;
  }
  // 處理 V3 API 或其他格式
  const raw = p.price || p.sale_price || p.regular_price || 0;
  if (typeof raw === "string") return parseFloat(raw);
  return Number(raw);
};

const stripHtml = (html) => (!html ? "" : html.replace(/<[^>]*>?/gm, ""));

/* =================================================================
   Main Page Component
   ================================================================= */
export default function BeerOrderPage({ initialItems = [] }) {
  const { locale, asPath } = useRouter();
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const [products, setProducts] = useState(initialItems);
  const [qtyMap, setQtyMap] = useState({});
  const [toast, setToast] = useState(null);
  const [showMarquee, setShowMarquee] = useState(false);

  // 初始化數量狀態
  useEffect(() => {
    if (initialItems) {
      setProducts(initialItems);
      setQtyMap(Object.fromEntries(initialItems.map((p) => [p.id, 1])));
    }
  }, [initialItems]);

  // 延遲顯示跑馬燈
  useEffect(() => {
    const timer = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // 數量控制
  const setQty = (id, next) =>
    setQtyMap((m) => ({ ...m, [id]: Math.max(0, parseInt(next) || 0) }));

  // 加入購物車
  const addToCart = (product) => {
    const qty = Math.max(1, qtyMap[product.id] || 0);
    
    cartStore.add({
      id: product.linkedChineseId || product.id, // 優先使用中文 ID 以便庫存同步(若有設定)
      productId: product.id,
      name: product.name,
      // 這裡傳入中英文名稱，方便購物車顯示
      name_zh: isEn ? (product.name_zh || product.name) : product.name,
      name_en: isEn ? product.name : (product.name_en || product.name),
      img: product.img,
      price: priceFromItem(product),
    }, qty);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }

    // 按鈕動畫
    const btn = document.getElementById(`btn-${product.id}`);
    if (btn) btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 300 });

    // Toast 提示
    const msg = isEn 
      ? `"${product.name}" ${t.add_success} (${qty} ${t.unit})`
      : `「${product.name}」${t.add_success} (${qty} ${t.unit})`;
      
    setToast({ id: Date.now(), text: msg });
    setTimeout(() => setToast(null), 2000);
    setQty(product.id, 0); // 重置數量
  };

  /* ----- SEO JSON-LD ----- */
  const currentUrl = `${SITE_URL}${asPath}`;
  
  // 1. 麵包屑結構
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isEn ? "Home" : "首頁", item: `${SITE_URL}${isEn ? "/en" : ""}` },
      { "@type": "ListItem", position: 2, name: t.breadcrumb, item: currentUrl },
    ],
  };

  // 2. 產品列表結構 (ItemList)
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
          url: `${SITE_URL}/beer/${p.slug}`
        }
      }
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
        <meta property="og:image" content={products[0]?.img || `${SITE_URL}/images/logo-6.png`} />
        {/* SEO Scripts */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: -8 }} exit={{ opacity: 0, y: -24 }} className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center mb-8">
              <div className="rounded-xl bg-[#c1a46f] text-white px-4 py-2 shadow-lg text-sm sm:text-base">{toast.text}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Marquee */}
        <AnimatePresence>
          {showMarquee && (
            <motion.div className="pointer-events-none w-full py-6 overflow-hidden absolute z-50 left-0 top-20" initial={{ opacity: 0, y: 64 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
              <Marquee velocity={28} direction="rtl">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <div key={`m1-${idx}`} className="mx-6"><img src={item.src} alt={item.alt} className="w-[clamp(220px,60vw,420px)] sm:w-[clamp(260px,50vw,420px)] object-contain h-auto max-w-full" /></div>
                ))}
              </Marquee>
              <Marquee velocity={24} direction="ltr">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <div key={`m2-${idx}`} className="mx-6"><img src={item.src} alt={item.alt} className="w-[clamp(220px,60vw,420px)] sm:w-[clamp(260px,50vw,420px)] object-contain h-auto max-w-full" /></div>
                ))}
              </Marquee>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <section className="relative h-screen overflow-hidden">
          <motion.div className="absolute right-20 top-20 z-20" animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 1 }}>
            <Image src="/images/logo-6.png" alt="Logo" width={800} height={500} priority className="w-[200px]" />
          </motion.div>
          <motion.div className="absolute left-[-10%] sm:left-10 bottom-20 z-20" animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <Image src="/images/beer02.png" alt="Beer" width={800} height={500} priority className="w-[400px] lg:w-[700px]" />
          </motion.div>
          <h1 className="sr-only">{t.seo.title}</h1>
        </section>

        {/* Product List */}
        <section className="bg-white min-h-screen py-24">
          <div className="flex justify-center pt-20 items-center">
            <h2 className="text-[22px] font-bold tracking-wider">{t.title}</h2>
          </div>

          <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-8">
            {products.length > 0 ? products.map((p) => {
              const q = qtyMap[p.id] ?? 0;
              const displayPrice = priceFromItem(p);
              return (
                <article key={p.id} className="flex flex-col justify-start items-center group transition">
                  <div className="mb-2 text-center px-2">
                    <h3 className="block min-h-[1.5em] text-lg font-bold">{p.name}</h3>
                    <p className="text-black font-medium text-sm mt-2">{displayPrice} {t.currency}</p>
                  </div>
                  <Link href={`/beer/${p.slug}`} className="relative block w-[240px] h-[240px]">
                    <Image src={p.img} alt={p.name} fill className="object-contain p-2 transition-transform group-hover:scale-[1.05]" />
                  </Link>
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={() => setQty(p.id, q - 1)} className="rounded-xl border px-4 py-2 hover:bg-gray-50" disabled={q <= 0}>−</button>
                    <input type="number" min={0} value={q} onChange={(e) => setQty(p.id, Math.max(0, parseInt(e.target.value || "0", 10)))} className="w-20 rounded-xl border px-3 py-2 text-center" />
                    <button onClick={() => setQty(p.id, q + 1)} className="rounded-xl border px-4 py-2 hover:bg-gray-50">+</button>
                  </div>
                  <button onClick={() => addToCart(p)} id={`btn-${p.id}`} disabled={q <= 0} className={`mt-3 rounded-xl px-4 py-2 text-white transition-colors ${q > 0 ? "bg-black hover:opacity-90" : "bg-gray-400 cursor-not-allowed"}`}>
                    {t.add_to_cart}
                  </button>
                </article>
              );
            }) : (
              <div className="col-span-full text-center py-10 text-gray-500">{t.no_product}</div>
            )}
          </div>
        </section>

        <section className="bg-white pt-20 flex flex-col">
          <iframe src="https://googleusercontent.com/maps.google.com/0" className="w-full h-[500px]" allowFullScreen loading="lazy" />
          <Marquee>
            {[1, 2, 3, 4].map((i) => <span key={i} className="text-[70px] mx-3 font-bold text-gray-200">MEMORY CORNER</span>)}
          </Marquee>
        </section>
      </main>
    </Layout>
  );
}
export async function getStaticProps({ locale }) {
  const base = process.env.WC_URL;
  const wpLang = locale === "en" ? "en" : "zh_TW";
  
  // 請確認這裡的 Slug 跟你在 WordPress 後台 -> 商品分類 -> 代稱 一模一樣
// 配合 WordPress 現在的設定
const targetSlug = wpLang === "en" ? "beer-en" : "beer-zh";

  let initialItems = [];

  console.log(`[BeerList] 開始抓取: 語言=${wpLang}, 目標分類Slug=${targetSlug}`);

  try {
    // 1. 取得分類 ID
    const catUrl = new URL(`${ensureURL(base)}/wp-json/wc/store/products/categories`);
    // 注意：有時候直接用 slug search 會抓到相似的，所以我們抓全部再來 filter 比較保險
    // 或者直接用 slug 參數
    catUrl.searchParams.set("slug", targetSlug);
    
    const catRes = await fetch(catUrl.toString());
    const categories = await catRes.json();
    
    // 找出完全匹配 slug 的分類 ID
    const targetCat = Array.isArray(categories) ? categories.find(c => c.slug === targetSlug) : null;
    const categoryId = targetCat?.id;

    if (!categoryId) {
        console.error(`[BeerList] 找不到分類! Slug: ${targetSlug}. API 回傳:`, categories.length > 0 ? categories[0].slug : "空陣列");
    } else {
        console.log(`[BeerList] 找到分類 ID: ${categoryId} (Slug: ${targetCat.slug})`);

        // 2. 取得產品
        const storeUrl = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
        storeUrl.searchParams.set("per_page", "100");
        storeUrl.searchParams.set("category", categoryId);
        // storeUrl.searchParams.set("lang", wpLang); // 有些環境不需要這行，如果分類 ID 正確的話

        const res = await fetch(storeUrl.toString());
        const rawList = await res.json();
        
        console.log(`[BeerList] 抓到產品數量: ${rawList.length}`);

        const list = Array.isArray(rawList) ? rawList : [];

        // 3. 格式化
        initialItems = list.map((p) => {
            let imgSrc = p.images?.[0]?.src;
            if (imgSrc && !imgSrc.startsWith("http")) imgSrc = `${ensureURL(base)}${imgSrc}`;
            
            // 這裡如果是中文 Slug，不需要特別處理，前端 Link 會自動編碼，後端 [slug].js 負責解碼即可
            return {
            id: p.id,
            slug: p.slug, 
            name: p.name,
            sku: p.sku || "",
            img: imgSrc || "/images/placeholder.png",
            linkedChineseId: p.id, 
            prices: p.prices,
            short_description: p.short_description || "",
            };
        });
    }
  } catch (e) {
    console.error("SSG Error:", e);
  }

  return { props: { initialItems }, revalidate: REVALIDATE_TIME };
}

function ensureURL(u = "") { return String(u).replace(/\/+$/, ""); }