import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../Layout"; // 請確保路徑正確
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { ChevronRight, Minus, Plus, ShoppingCart, Globe } from "lucide-react";

const REVALIDATE_TIME = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* =================================================================
   Helper Functions
   ================================================================= */
// 移除 HTML 標籤並過濾掉內嵌的 CSS <style> 內容
const stripHtml = (html) => {
  if (!html) return "";
  // 先移除 style 標籤及其內容，再移除其他 HTML 標籤
  const noStyle = html.replace(/<style([\s\S]*?)<\/style>/gi, "");
  return noStyle.replace(/<[^>]*>?/gm, "");
};

// 專門過濾 Description 顯示用的 HTML
const formatDescription = (html) => {
  if (!html) return "";
  // 移除 WordPress 可能帶入的內嵌樣式表，避免前端出現 CSS 原始碼
  return html.replace(/<style([\s\S]*?)<\/style>/gi, "");
};

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

  // 【核心修正：切換路徑處理】
  // 構造目標語系的完整連結。若為預設語系(zh-TW)則路徑不帶 /en
  const targetLocalePrefix = isEn ? "" : "/en"; 
  const customSwitchHref = product.relatedSlug 
    ? `${targetLocalePrefix}/beer/${product.relatedSlug}` 
    : `${targetLocalePrefix}/beer`;

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
  const cleanDescription = formatDescription(product.description);

  return (
    <Layout customSwitchLink={customSwitchHref}>
      <Head>
        <title>{`${product.name} | ${isEn ? "Memory Corner" : "有香 Memory Corner"}`}</title>
        <meta name="description" content={stripHtml(product.short_description).slice(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={stripHtml(product.short_description)} />
        <meta property="og:image" content={product.img} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={currentUrl} />
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
              <Link href={isEn ? "/en" : "/"} className="hover:text-black">{t.home}</Link>
              <ChevronRight size={14} />
              <Link href={isEn ? "/en/beer" : "/beer"} className="hover:text-black">{t.beer_list}</Link>
              <ChevronRight size={14} />
              <span className="font-medium text-black line-clamp-1">{product.name}</span>
            </div>

            {/* 語系切換按鈕：直接指向拼接好的 customSwitchHref */}
            <Link 
              href={customSwitchHref} 
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

            {/* 右側：詳細資訊 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex flex-col"
            >
              <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{product.name}</h1>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#c1a46f]">{displayPrice} {t.currency}</span>
              </div>
              
              <div className="prose prose-stone mb-8 max-w-none text-gray-600" 
                   dangerouslySetInnerHTML={{ __html: formatDescription(product.short_description) }} />

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

              {product.description && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">{t.description}</h2>
                  {/* 使用 formatDescription 過濾掉 CSS 原始碼 */}
                  <div className="prose prose-sm max-w-none text-gray-600 overflow-hidden" 
                       dangerouslySetInnerHTML={{ __html: cleanDescription }} />
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
   getStaticPaths & getStaticProps (維持原邏輯，確保 Slug 抓取)
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

export async function getStaticProps({ params, locale }) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;
  const targetCatSlug = locale === "en" ? "beer-en" : "beer"; 

  try {
    // 1. 抓取分類 ID
    const catRes = await fetch(`${ensureURL(base)}/wp-json/wc/store/products/categories?slug=${targetCatSlug}`);
    const cats = await catRes.json();
    const catId = cats?.[0]?.id;
    if (!catId) return { notFound: true };

    // 2. 抓取當前產品
    const storeBase = `${ensureURL(base)}/wp-json/wc/store/products`;
    const res = await fetch(`${storeBase}?slug=${decodedSlug}`);
    const data = await res.json();
    const productData = data?.[0];
    if (!productData) return { notFound: true };

    // 3. 獲取翻譯資訊 (關鍵修正點)
    let relatedSlug = null;
    let altName = null;

    if (ck && cs) {
      const v3Res = await fetch(`${ensureURL(base)}/wp-json/wc/v3/products/${productData.id}`, {
        headers: { Authorization: basicAuth(ck, cs) }
      });
      
      if (v3Res.ok) {
        const v3Data = await v3Res.json();
        const translations = v3Data.translations || {};
        
        // 尋找「非當前語系」的 ID
        // 排除掉當前 locale 相關的 key，取剩下的第一個作為翻譯對象
        const otherLangEntry = Object.entries(translations).find(([lang]) => {
          if (locale === 'en') return lang.includes('zh'); // 找中文
          return lang === 'en'; // 找英文
        });

        const otherLangId = otherLangEntry ? otherLangEntry[1] : null;

        if (otherLangId) {
          const altRes = await fetch(`${ensureURL(base)}/wp-json/wc/v3/products/${otherLangId}`, {
            headers: { Authorization: basicAuth(ck, cs) }
          });
          if (altRes.ok) {
            const altData = await altRes.json();
            // 強制確保抓到對方的 slug (例如 golden-one)
            relatedSlug = altData.slug; 
            altName = altData.name;
          }
        }
      }
    }

    const product = {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        relatedSlug: relatedSlug, // 這裡現在應該是 "golden-one"
        sku: productData.sku || "",
        description: productData.description || "",
        short_description: productData.short_description || "",
        img: productData.images?.[0]?.src || "/images/placeholder.png",
        prices: productData.prices,
        name_zh: locale === 'en' ? altName : productData.name,
        name_en: locale === 'en' ? productData.name : altName,
    };
    
    return { props: { product }, revalidate: REVALIDATE_TIME };

  } catch (e) {
    console.error("[EXCEPTION]", e);
    return { notFound: true };
  }
}