import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { ChevronRight, Minus, Plus, ShoppingCart, Globe } from "lucide-react";

const REVALIDATE_TIME = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* =================================================================
   Helper Functions
   ================================================================= */
// 只移除 HTML 標籤供 SEO 使用
const stripHtml = (html) => (!html ? "" : html.replace(/<[^>]*>?/gm, ""));

const priceFromItem = (p) => {
  if (!p) return 0;
  if (p.prices) {
    const raw = p.prices.price || p.prices.sale_price || p.prices.regular_price;
    return Number(raw) / 100;
  }
  const raw = p.price || p.sale_price || p.regular_price || 0;
  return parseFloat(raw);
};

function ensureURL(u = "") { return String(u).replace(/\/+$/, ""); }
function basicAuth(ck, cs) { return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64"); }

/* =================================================================
   UI 翻譯
   ================================================================= */
const TRANSLATIONS = {
  "zh-TW": {
    add_to_cart: "加入購物車",
    quantity: "數量",
    description: "商品描述",
    category: "分類",
    sku: "貨號",
    back: "返回列表",
    home: "首頁",
    beer_list: "啤酒訂購",
    add_success: "已加入購物車",
    unit: "箱",
    currency: "NT$",
    switch_lang: "Switch to English",
  },
  en: {
    add_to_cart: "Add to Cart",
    quantity: "Quantity",
    description: "Description",
    category: "Category",
    sku: "SKU",
    back: "Back to List",
    home: "Home",
    beer_list: "Beer Order",
    add_success: "Added to cart",
    unit: "box(es)",
    currency: "NT$",
    switch_lang: "切換至中文",
  },
};

/* =================================================================
   Main Component
   ================================================================= */
export default function BeerDetailPage({ product }) {
  const router = useRouter();
  const { locale, asPath, isFallback } = router;
  
  // === [DEBUG] 前端頁面除錯 ===
  useEffect(() => {
    if (product) {
      console.log(`[DEBUG UI] 目前頁面 Slug: ${product.slug}`);
      console.log(`[DEBUG UI] 抓到的對應 Slug (relatedSlug):`, product.relatedSlug);
    }
  }, [product]);

  if (isFallback || !product) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      </Layout>
    );
  }

  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);

  const handleQtyChange = (val) => {
    const newQty = Math.max(1, parseInt(val) || 1);
    setQty(newQty);
  };

  const addToCart = () => {
    cartStore.add(
      {
        id: product.linkedChineseId || product.id,
        productId: product.id,
        name: product.name,
        name_zh: isEn ? (product.name_zh || product.name) : product.name,
        name_en: isEn ? product.name : (product.name_en || product.name),
        img: product.img,
        price: priceFromItem(product),
      },
      qty
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }

    const msg = isEn
      ? `${t.add_success}: ${product.name} (${qty})`
      : `${t.add_success}: ${product.name} (${qty}${t.unit})`;
    
    setToast({ id: Date.now(), text: msg });
    setTimeout(() => setToast(null), 2500);
  };

  const currentUrl = `${SITE_URL}${asPath}`;
  const displayPrice = priceFromItem(product);

  const targetLocale = isEn ? "zh-TW" : "en";
  // 決定傳給 Layout 的連結
  const customSwitchHref = product.relatedSlug 
    ? `/beer/${product.relatedSlug}` 
    : `/beer`; // 沒抓到就回列表

  // === [DEBUG] 確認連結是否有產生 ===
  // console.log(`[DEBUG UI] 計算出的切換連結:`, customSwitchHref);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.img,
    description: stripHtml(product.description || product.short_description),
    sku: product.sku || `${product.id}`,
    offers: {
      "@type": "Offer",
      url: currentUrl,
      priceCurrency: "TWD",
      price: displayPrice,
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.home, item: `${SITE_URL}${isEn ? "/en" : ""}` },
      { "@type": "ListItem", position: 2, name: t.beer_list, item: `${SITE_URL}${isEn ? "/en" : ""}/beer` },
      { "@type": "ListItem", position: 3, name: product.name, item: currentUrl },
    ],
  };

  return (
    // 【關鍵】這裡把計算好的正確網址 customSwitchLink 傳給 Layout
    <Layout customSwitchLink={customSwitchHref}>
      <Head>
        <title>{`${product.name} | ${isEn ? "Memory Corner" : "有香 Memory Corner"}`}</title>
        <meta name="description" content={stripHtml(product.short_description).slice(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={stripHtml(product.short_description)} />
        <meta property="og:image" content={product.img} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={currentUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen pt-24 pb-20">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#c1a46f] px-6 py-3 text-white shadow-xl"
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-black">{t.home}</Link>
              <ChevronRight size={14} />
              <Link href="/beer" className="hover:text-black">{t.beer_list}</Link>
              <ChevronRight size={14} />
              <span className="font-medium text-black line-clamp-1">{product.name}</span>
            </div>

            {/* 頁面內的備用切換按鈕 */}
            <Link 
              href={customSwitchHref} 
              locale={targetLocale}
              className="flex items-center gap-1 text-[#c1a46f] hover:text-[#a08655] font-medium transition-colors"
            >
              <Globe size={16} />
              {t.switch_lang}
            </Link>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            {/* 左側：圖片 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white p-8 shadow-sm"
            >
              <Image 
                src={product.img} 
                alt={product.name} 
                fill 
                className="object-contain transition-transform duration-500 hover:scale-105" 
                priority 
              />
            </motion.div>

            {/* 右側：詳細資訊 + 描述 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex flex-col"
            >
              <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{product.name}</h1>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#c1a46f]">{displayPrice} {t.currency}</span>
              </div>
              
              <div className="prose prose-stone mb-8 max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.short_description }} />

              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <div className="flex h-14 items-center rounded-2xl border border-gray-200 bg-white px-4">
                  <button onClick={() => handleQtyChange(qty - 1)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Minus size={18} /></button>
                  <input type="number" value={qty} onChange={(e) => handleQtyChange(e.target.value)} className="w-16 bg-transparent text-center text-lg font-medium outline-none" />
                  <button onClick={() => handleQtyChange(qty + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Plus size={18} /></button>
                </div>
                <button onClick={addToCart} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-8 text-lg font-bold text-white transition-transform active:scale-95 hover:bg-gray-800">
                  <ShoppingCart size={20} /> {t.add_to_cart}
                </button>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-6 text-sm text-gray-500">
                {product.sku && <div className="flex gap-2"><span className="font-medium text-gray-900">{t.sku}:</span><span>{product.sku}</span></div>}
              </div>

              {product.description && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">{t.description}</h2>
                  <div className="prose prose-sm max-w-none text-gray-600 overflow-hidden" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

/* =================================================================
   getStaticPaths
   ================================================================= */
export async function getStaticPaths({ locales }) {
  const base = process.env.WC_URL;
  let paths = [];
  const strategies = [
    { lang: 'zh-TW', catSlug: 'beer' },
    { lang: 'en', catSlug: 'beer-en' }
  ];

  try {
    for (const strat of strategies) {
      const catRes = await fetch(`${ensureURL(base)}/wp-json/wc/store/products/categories?slug=${strat.catSlug}`);
      const cats = await catRes.json();
      const catId = cats?.[0]?.id;

      if (catId) {
        const prodRes = await fetch(`${ensureURL(base)}/wp-json/wc/store/products?category=${catId}&per_page=100`);
        const products = await prodRes.json();
        if (Array.isArray(products)) {
          const localePaths = products.map((p) => ({
            params: { slug: decodeURIComponent(p.slug) },
            locale: strat.lang,
          }));
          paths = [...paths, ...localePaths];
        }
      }
    }
  } catch (e) {
    console.error("getStaticPaths Error:", e);
  }
  return { paths, fallback: "blocking" };
}

/* =================================================================
   getStaticProps (後端資料抓取除錯)
   ================================================================= */
export async function getStaticProps({ params, locale }) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  const rawSlug = slug;
  
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;
  const wpLang = locale === "en" ? "en" : "zh_TW";
  const targetCatSlug = wpLang === "en" ? "beer-en" : "beer-zh"; 

  console.log("----------------------------------------------------------------");
  console.log(`[DEBUG START] Page Lang: ${wpLang}`);
  console.log(`[DEBUG START] Target Product Slug: ${decodedSlug}`);

  try {
    const catUrl = `${ensureURL(base)}/wp-json/wc/store/products/categories?slug=${targetCatSlug}`;
    const catRes = await fetch(catUrl);
    const cats = await catRes.json();
    const catId = cats?.[0]?.id;

    if (!catId) {
        console.error(`[DEBUG ERROR] 找不到分類 ID: ${targetCatSlug}`);
        return { notFound: true };
    }

    let productData = null;
    const storeBase = `${ensureURL(base)}/wp-json/wc/store/products`;
    
    // 優先嘗試解碼後的 slug
    let fetchUrl = new URL(storeBase);
    fetchUrl.searchParams.set("slug", decodedSlug);
    let res = await fetch(fetchUrl.toString());
    let data = await res.json();
    
    if (Array.isArray(data) && data.length > 0) {
      productData = data[0];
    } else {
      fetchUrl = new URL(storeBase);
      fetchUrl.searchParams.set("slug", rawSlug);
      res = await fetch(fetchUrl.toString());
      data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        productData = data[0];
      }
    }

    if (!productData) {
        console.error(`[DEBUG ERROR] 找不到產品: ${decodedSlug}`);
        return { notFound: true };
    }

    console.log(`[DEBUG PROD] Found ID: ${productData.id}, Name: ${productData.name}`);

    // === 除錯翻譯抓取 ===
    let linkedChineseId = productData.id;
    let relatedSlug = null;
    let altName = null;

    if (ck && cs) {
        const v3Res = await fetch(`${ensureURL(base)}/wp-json/wc/v3/products/${productData.id}`, {
            headers: { Authorization: basicAuth(ck, cs) }
        });
        
        if (v3Res.ok) {
            const v3Data = await v3Res.json();
            const translations = v3Data.translations || {};
            
            console.log(`[DEBUG TRANS] API 回傳 translations:`, JSON.stringify(translations));

            let otherLangId = null;
            // 尋找對應語言 ID
            for (const [langKey, id] of Object.entries(translations)) {
                if (wpLang === 'en' && langKey !== 'en') {
                    otherLangId = id; break;
                }
                if (wpLang !== 'en' && langKey === 'en') {
                    otherLangId = id; break;
                }
            }
            
            console.log(`[DEBUG TRANS] 對應語言 ID (otherLangId): ${otherLangId}`);

            if (wpLang === 'en' && otherLangId) {
                linkedChineseId = otherLangId;
            }

            if (otherLangId) {
                const altRes = await fetch(`${ensureURL(base)}/wp-json/wc/v3/products/${otherLangId}`, {
                    headers: { Authorization: basicAuth(ck, cs) }
                });
                if (altRes.ok) {
                    const altData = await altRes.json();
                    altName = altData.name;
                    relatedSlug = altData.slug; 
                    console.log(`[DEBUG TRANS] 成功抓到翻譯 Slug: ${relatedSlug}`);
                } else {
                    console.error(`[DEBUG TRANS] 抓取翻譯產品 ${otherLangId} 失敗`);
                }
            } else {
                console.warn(`[DEBUG TRANS] 此產品沒有連結翻譯`);
            }
        }
    }

    let imgSrc = productData.images?.[0]?.src;
    if (imgSrc && !imgSrc.startsWith("http")) imgSrc = `${ensureURL(base)}${imgSrc}`;

    const product = {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        relatedSlug: relatedSlug, 
        sku: productData.sku || "",
        description: productData.description || "",
        short_description: productData.short_description || "",
        img: imgSrc || "/images/placeholder.png",
        prices: productData.prices,
        price: productData.prices?.price, 
        linkedChineseId: linkedChineseId,
        name_zh: wpLang === 'zh_TW' ? productData.name : altName,
        name_en: wpLang === 'en' ? productData.name : altName,
    };
    
    console.log(`[DEBUG END] relatedSlug 傳給 Props: ${product.relatedSlug}`);
    console.log("----------------------------------------------------------------");

    return { props: { product }, revalidate: REVALIDATE_TIME };

  } catch (e) {
    console.error("[EXCEPTION]", e);
    return { notFound: true };
  }
}