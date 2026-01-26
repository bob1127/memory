import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { ChevronRight, Minus, Plus, ShoppingCart, Globe, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useNav } from "@/components/context/NavContext"; 

// 設定 ISR 更新時間 (秒)
const REVALIDATE_TIME = 60;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
// 🟢 設定主色系
const THEME_COLOR = "#e7a042";

/* =================================================================
   Helper Functions
   ================================================================= */
const stripHtml = (html) => {
  if (!html) return "";
  const noStyle = html.replace(/<style([\s\S]*?)<\/style>/gi, "");
  return noStyle.replace(/<[^>]*>?/gm, "");
};

const formatDescription = (html) => {
  if (!html) return "";
  let cleanHtml = html;
  // 1. 移除游標 span
  cleanHtml = cleanHtml.replace(/<span[^>]+(?:data-mce-type=["']bookmark["']|class=["'][^"']*mce_SELRES_start[^"']*["'])[^>]*>[\s\S]*?<\/span>/gi, "");
  cleanHtml = cleanHtml.replace(/\ufeff/g, "");
  // 2. 重建被 API 過濾掉的 Style
  if (!cleanHtml.includes("<style") && cleanHtml.includes("{") && cleanHtml.includes("}")) {
     const splitIndex = cleanHtml.indexOf("<div");
     if (splitIndex > 0) {
       const potentialCss = cleanHtml.substring(0, splitIndex);
       const htmlPart = cleanHtml.substring(splitIndex);
       if (potentialCss.includes(".honey-beer-wrapper") || potentialCss.includes("{")) {
          let cssCode = potentialCss
            .replace(/<\/?p[^>]*>/g, "")
            .replace(/<br\s*\/?>/g, "")
            .replace(/\n/g, " ");
          cleanHtml = `<style>${cssCode}</style>${htmlPart}`;
       }
     }
  }
  return cleanHtml;
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
    currency: "NT$", // 修正回 NT$
    switch_lang: "Switch to English",
    in_stock: "有庫存",
    out_of_stock: "缺貨中",
    related_products: "您可能也喜歡",
    view_details: "查看詳情"
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
    currency: "NT$", // 修正回 NT$
    switch_lang: "切換至中文",
    in_stock: "InStock",
    out_of_stock: "OutOfStock",
    related_products: "You Might Also Like",
    view_details: "View Details"
  },
};

/* =================================================================
   Main Component
   ================================================================= */
export default function BeerDetailPage({ product, relatedProducts }) {
  const { setCustomSwitchLink } = useNav(); 
  const router = useRouter();
  const { locale, asPath, isFallback } = router;

  // 🟢 圖片狀態管理
  const [selectedImage, setSelectedImage] = useState(product?.img);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);

  // 輪播 Ref
  const carouselRef = useRef(null);

  // 當切換產品或語言時，重置主圖
  useEffect(() => {
    if (product?.img) {
      setSelectedImage(product.img);
      setQty(1); // 切換商品時重置數量
    }
  }, [product]);
  
  if (isFallback || !product) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e7a042] border-t-transparent" />
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      </Layout>
    );
  }

  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const targetLocalePrefix = isEn ? "" : "/en"; 
  const customSwitchHref = product.relatedSlug 
    ? `${targetLocalePrefix}/beer/${product.relatedSlug}` 
    : `${targetLocalePrefix}/beer`;

  useEffect(() => {
    setCustomSwitchLink(customSwitchHref);
    return () => {
      setCustomSwitchLink(null);
    };
  }, [customSwitchHref, setCustomSwitchLink]);

  const handleQtyChange = (val) => {
    const newQty = Math.max(1, parseInt(val) || 1);
    setQty(newQty);
  };

  // 加入購物車 (主商品)
  const addToCart = () => {
    const cartId = product.sku && product.sku !== "" ? product.sku : product.id;

    console.log("🛒 加入購物車 ID:", cartId, "原始 ID:", product.id, "SKU:", product.sku);

    cartStore.add(
      {
        id: cartId,
        productId: product.id,
        name: product.name,
        name_zh: isEn ? (product.name_zh || product.name) : product.name,
        name_en: isEn ? product.name : (product.name_en || product.name),
        img: product.img,
        price: priceFromItem(product),
        sku: product.sku,
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

  // 加入購物車 (推薦商品簡化版)
  const addRelatedToCart = (relatedItem) => {
    const cartId = relatedItem.sku || relatedItem.id;
    
    cartStore.add({
        id: cartId,
        productId: relatedItem.id,
        name: relatedItem.name,
        name_zh: relatedItem.name,
        name_en: relatedItem.name, 
        img: relatedItem.img,
        price: priceFromItem(relatedItem),
        sku: relatedItem.sku
    }, 1);

    if (typeof window !== "undefined") window.dispatchEvent(new Event("open-cart"));
    
    const msg = isEn ? `${t.add_success}: ${relatedItem.name}` : `${t.add_success}: ${relatedItem.name}`;
    setToast({ id: Date.now(), text: msg });
    setTimeout(() => setToast(null), 2500);
  };

  const scrollCarousel = (direction) => {
    if(carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentUrl = `${SITE_URL}${asPath}`;
  const displayPrice = priceFromItem(product);
  const cleanShortDescription = formatDescription(product.short_description);
  const cleanDescription = formatDescription(product.description);

  // SEO
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.galleryImages,
    "description": stripHtml(product.short_description),
    "sku": product.sku,
    "brand": { "@type": "Brand", "name": "Memory Corner" },
    "offers": {
      "@type": "Offer",
      "url": currentUrl,
      "priceCurrency": "TWD",
      "price": displayPrice,
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <Layout>
      <Head>
        <title>{`${product.name} | ${isEn ? "Memory Corner" : "有香 Memory Corner"}`}</title>
        <meta name="description" content={stripHtml(product.short_description).slice(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={stripHtml(product.short_description)} />
        <meta property="og:image" content={product.img} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={currentUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        <style>{`
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen pt-24 pb-20">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-10 left-1/2 z-[3000] -translate-x-1/2 rounded-xl bg-[#e7a042] px-6 py-3 text-white shadow-xl whitespace-nowrap"
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Link href={isEn ? "/en" : "/"} className="whitespace-nowrap hover:text-[#e7a042] transition-colors">{t.home}</Link>
              <ChevronRight size={14} className="flex-shrink-0" />
              <Link href={isEn ? "/en/beer" : "/beer"} className="whitespace-nowrap hover:text-[#e7a042] transition-colors">{t.beer_list}</Link>
              <ChevronRight size={14} className="flex-shrink-0" />
              <span className="font-medium text-black line-clamp-1 min-w-[50px]">{product.name}</span>
            </div>

            <Link 
              href={customSwitchHref} 
              className="flex items-center gap-1 text-[#e7a042] hover:text-[#c5853d] font-medium transition-colors whitespace-nowrap"
            >
              <Globe size={16} />
              {t.switch_lang}
            </Link>
          </nav>

          {/* Main Product Grid */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start mb-24">
            
            {/* Left: Images (Sticky) */}
            <div className="relative w-full lg:col-span-6 lg:sticky lg:top-32 z-10">
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white p-4 shadow-sm border border-gray-100 group">
                 <AnimatePresence mode="wait">
                   <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full"
                   >
                     <Image 
                      src={selectedImage} 
                      alt={product.name} 
                      fill 
                      className="object-contain transition-transform duration-700 group-hover:scale-105" 
                      priority 
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                   </motion.div>
                 </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="mt-4">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x pt-1">
                    {product.galleryImages.map((imgSrc, idx) => {
                      const isSelected = selectedImage === imgSrc;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(imgSrc)}
                          className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 snap-start ${
                            isSelected 
                              ? "border-[#e7a042] ring-2 ring-[#e7a042] ring-opacity-20 opacity-100 scale-95" 
                              : "border-transparent opacity-60 hover:opacity-100 hover:scale-100 grayscale hover:grayscale-0"
                          }`}
                        >
                          <Image 
                            src={imgSrc} 
                            alt={`Thumbnail ${idx + 1}`} 
                            fill 
                            className="object-cover" 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-col lg:col-span-6"
            >
              <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl leading-tight">{product.name}</h1>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#e7a042]">{displayPrice} {t.currency}</span>
              </div>
              
              <div className="prose prose-stone mb-8 max-w-none text-gray-600" 
                   dangerouslySetInnerHTML={{ __html: cleanShortDescription }} />

              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <div className="flex h-14 items-center rounded-2xl border border-gray-200 bg-white px-4 shadow-sm hover:border-[#e7a042]/50 transition-colors">
                  <button 
                    onClick={() => handleQtyChange(qty - 1)} 
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-[#e7a042]/10 hover:text-[#e7a042] transition-colors focus:outline-none active:scale-90"
                  >
                    <Minus size={18} />
                  </button>
                  
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={(e) => handleQtyChange(e.target.value)} 
                    className="w-16 bg-transparent text-center text-lg font-medium outline-none border-none ring-0 focus:ring-0" 
                  />
                  
                  <button 
                    onClick={() => handleQtyChange(qty + 1)} 
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-[#e7a042]/10 hover:text-[#e7a042] transition-colors focus:outline-none active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={addToCart} 
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#e7a042] px-8 text-lg font-bold text-white transition-all active:scale-95 hover:bg-[#c5853d] shadow-md hover:shadow-lg"
                >
                  <ShoppingCart size={20} /> {t.add_to_cart}
                </button>
              </div>

              {product.description && (
                <div className="mt-2 border-t border-gray-100 pt-8">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">{t.description}</h2>
                  <div className="prose prose-sm max-w-none text-gray-600 overflow-hidden" 
                       dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="border-t border-gray-200 pt-16 mb-12 relative">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">{t.related_products}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scrollCarousel('left')}
                      className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-[#e7a042] hover:text-white hover:border-[#e7a042] transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button 
                      onClick={() => scrollCarousel('right')}
                      className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-[#e7a042] hover:text-white hover:border-[#e7a042] transition-colors"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
               </div>
               
               <div 
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide snap-x pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
               >
                  {relatedProducts.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#e7a042]/50 hover:shadow-lg transition-all group"
                    >
                       <Link href={`/${locale === 'en' ? 'en/beer/' : 'beer/'}${item.slug}`}>
                         <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 mb-4">
                            <Image
                              src={item.img}
                              alt={item.name}
                              fill
                              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                            />
                         </div>
                       </Link>
                       <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">
                         <Link href={`/${locale === 'en' ? 'en/beer/' : 'beer/'}${item.slug}`} className="hover:text-[#e7a042] transition-colors">
                           {item.name}
                         </Link>
                       </h4>
                       <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-[#e7a042]">{priceFromItem(item)} {t.currency}</span>
                          <button 
                             onClick={() => addRelatedToCart(item)}
                             className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#e7a042] hover:text-white transition-colors"
                          >
                             <Plus size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
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
   getStaticProps (修正：增加數量、隨機洗牌、語言轉換)
   ================================================================= */
// 🟢 隨機洗牌函式
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function getStaticProps({ params, locale }) {
  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;

  // 1. 設定分類 Slug
  const targetCatSlug = locale === "en" ? "beer-en" : "beer"; 

  try {
    const catRes = await fetch(`${ensureURL(base)}/wp-json/wc/store/products/categories?slug=${targetCatSlug}`);
    const cats = await catRes.json();
    const catId = cats?.[0]?.id;
    if (!catId) return { notFound: true };

    const storeBase = `${ensureURL(base)}/wp-json/wc/store/products`;
    const res = await fetch(`${storeBase}?slug=${decodedSlug}`);
    const data = await res.json();
    const productData = data?.[0];
    if (!productData) return { notFound: true };

    // 2. 處理統一 ID
    let relatedSlug = null;
    let altName = null;
    let unifiedId = productData.id; 

    if (ck && cs) {
      const v3Res = await fetch(`${ensureURL(base)}/wp-json/wc/v3/products/${productData.id}`, {
        headers: { Authorization: basicAuth(ck, cs) }
      });
      
      if (v3Res.ok) {
        const v3Data = await v3Res.json();
        const translations = v3Data.translations || {};
        if (translations['zh-TW']) unifiedId = translations['zh-TW'];

        const currentId = productData.id;
        const otherLangEntry = Object.entries(translations).find(([lang, id]) => id !== currentId);
        const otherLangId = otherLangEntry ? otherLangEntry[1] : null;

        if (otherLangId) {
          const altRes = await fetch(`${ensureURL(base)}/wp-json/wc/v3/products/${otherLangId}`, {
            headers: { Authorization: basicAuth(ck, cs) }
          });
          if (altRes.ok) {
            const altData = await altRes.json();
            relatedSlug = altData.slug;
            altName = altData.name;
          }
        }
      }
    }

    // 🟢 3. 抓取相關商品 (使用修正後的 wpLang 與 per_page=40)
    let relatedProducts = [];
    try {
        // 修正：Next.js zh-TW 轉 WP zh
        const wpLang = locale === 'zh-TW' ? 'zh' : locale;
        
        const relatedRes = await fetch(`${storeBase}?category=${catId}&per_page=40&lang=${wpLang}`);
        const relatedData = await relatedRes.json();

        if (Array.isArray(relatedData)) {
            const filtered = relatedData.filter(p => p.id !== productData.id);
            const shuffled = shuffleArray(filtered);

            relatedProducts = shuffled.slice(0, 8).map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                img: p.images?.[0]?.src || "/images/placeholder.png",
                prices: p.prices,
                sku: p.sku || ""
            }));
        }
    } catch(err) {
        console.error("Related fetch error", err);
    }

    const mainImgSrc = productData.images?.[0]?.src || "/images/placeholder.png";
    const allGalleryImages = productData.images?.map(img => img.src) || [];
    const finalUnifiedId = productData.sku || unifiedId;

    const product = {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        relatedSlug: relatedSlug, 
        sku: productData.sku || "",
        unifiedId: finalUnifiedId,
        description: productData.description || "",
        short_description: productData.short_description || "",
        img: mainImgSrc,
        galleryImages: allGalleryImages,
        prices: productData.prices,
        name_zh: locale === 'en' ? altName : productData.name,
        name_en: locale === 'en' ? productData.name : altName,
    };
    
    return { 
      props: { product, relatedProducts }, 
      revalidate: REVALIDATE_TIME
    };

  } catch (e) {
    console.error("[EXCEPTION]", e);
    return { notFound: true };
  }
}