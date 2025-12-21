"use client";

import { useState, useEffect } from "react"; // 1. 補上 useEffect
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

// 網站網址
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.memorycorner8.com";

const PAGE_TRANSLATIONS = {
  "zh-TW": {
    not_found: "找不到此商品",
    add_to_cart: "加入購物車",
    add_success_prefix: "已加入購物車：",
    currency: "NT$",
    breadcrumb_home: "首頁",
    breadcrumb_category: "啤酒訂購",
  },
  en: {
    not_found: "Product not found",
    add_to_cart: "Add to Cart",
    add_success_prefix: "Added to cart: ",
    currency: "NT$",
    breadcrumb_home: "Home",
    breadcrumb_category: "Beer Order",
  },
};

// 輔助函式：移除 HTML 標籤並處理換行
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .trim();
};

/* =================================================================
   Frontend Component
   ================================================================= */
// 2. 接收 redirectDestination prop
export default function BeerInner({
  product,
  linkedChineseId,
  names,
  redirectDestination,
}) {
  const { locale, asPath, replace } = useRouter(); // 3. 拿出 replace 方法

  // 4. 新增：客戶端轉址邏輯
  useEffect(() => {
    if (redirectDestination) {
      replace(redirectDestination);
    }
  }, [redirectDestination, replace]);

  // 如果需要轉址，先回傳 null 避免閃爍 (或顯示 Loading)
  if (redirectDestination) return null;

  if (!product) return null;

  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  // --- 顯示與 SEO 邏輯 ---

  // 1. 確保名稱符合當前語系
  const currentDisplayName = isEn
    ? names?.en || product.name
    : names?.zh || product.name;

  // 2. SEO Description 優先抓取「簡短說明 (short_description)」
  const rawSeoDesc = product.short_description || product.description;
  const cleanSeoDesc = stripHtml(rawSeoDesc).substring(0, 160);

  // 頁面顯示用的 HTML
  const displayDesc = product.description;
  const currentUrl = `${SITE_URL}${asPath.split("?")[0]}`;
  const mainImage = product.images?.[0] || `${SITE_URL}/images/placeholder.png`;

  /* ---------- 加入購物車 ---------- */
  const addToCart = () => {
    const zhName = names?.zh || product.name;
    const enName = names?.en || product.name;
    const cartId = linkedChineseId || product.id;

    cartStore.add(
      {
        id: cartId,
        name: currentDisplayName,
        name_zh: zhName,
        name_en: enName,
        img: mainImage,
        price: Number(product.price),
      },
      qty
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }

    setToast(true);
    setQty(1);
    setTimeout(() => setToast(false), 2000);
  };

  /* ... SEO Schema ... */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: currentDisplayName,
    image: product.images,
    description: cleanSeoDesc,
    brand: { "@type": "Brand", name: "Memory Corner" },
    sku: String(product.id),
    offers: {
      "@type": "Offer",
      url: currentUrl,
      priceCurrency: "TWD",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.breadcrumb_home,
        item: `${SITE_URL}${isEn ? "/en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.breadcrumb_category,
        item: `${SITE_URL}${isEn ? "/en/beer" : "/beer"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: currentDisplayName,
        item: currentUrl,
      },
    ],
  };

  return (
    <Layout>
      <Head>
        {/* 1. 基本 SEO - 加上 key 以覆蓋 Layout */}
        <title key="title">{`${currentDisplayName} | Memory Corner`}</title>
        <meta name="description" content={cleanSeoDesc} key="description" />

        {/* 2. Open Graph (Facebook/Line) - 加上 key 以覆蓋 Layout */}
        <meta property="og:title" content={currentDisplayName} key="og:title" />
        <meta
          property="og:description"
          content={cleanSeoDesc}
          key="og:description"
        />
        <meta property="og:image" content={mainImage} key="og:image" />
        <meta property="og:url" content={currentUrl} key="og:url" />
        <meta property="og:type" content="product" key="og:type" />
        <meta
          property="og:site_name"
          content="Memory Corner"
          key="og:site_name"
        />
        {isEn ? (
          <meta property="og:locale" content="en_US" key="og:locale" />
        ) : (
          <meta property="og:locale" content="zh_TW" key="og:locale" />
        )}

        {/* 3. Twitter Card (這段是剛剛漏掉的，必須加上才能覆蓋中文) */}
        <meta
          name="twitter:card"
          content="summary_large_image"
          key="twitter:card"
        />
        <meta
          name="twitter:title"
          content={currentDisplayName}
          key="twitter:title"
        />
        <meta
          name="twitter:description"
          content={cleanSeoDesc}
          key="twitter:description"
        />
        <meta name="twitter:image" content={mainImage} key="twitter:image" />

        {/* 4. Schema 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          key="product-schema"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="breadcrumb-schema"
        />
      </Head>

      <section className="w-full bg-white mx-auto px-4 sm:px-6 lg:px-8 py-[100px]">
        {/* Breadcrumb */}
        <nav className="max-w-[1200px] mx-auto mb-6 text-sm text-gray-500">
          <a href={isEn ? "/en" : "/"} className="hover:text-black transition">
            {t.breadcrumb_home}
          </a>
          <span className="mx-2">/</span>
          <a
            href={isEn ? "/en/beer" : "/beer"}
            className="hover:text-black transition"
          >
            {t.breadcrumb_category}
          </a>
          <span className="mx-2">/</span>
          <span className="text-black">{currentDisplayName}</span>
        </nav>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
          {/* 左側圖片區塊 */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100">
              <Swiper
                modules={[Thumbs]}
                spaceBetween={12}
                thumbs={{ swiper: thumbsSwiper }}
                className="w-full h-full"
              >
                {(product.images?.length
                  ? product.images
                  : ["/images/beer04.png"]
                ).map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`${currentDisplayName} - ${idx}`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 1024px) 100vw, 600px"
                        priority={idx === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            {product.images?.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={5}
                modules={[Thumbs]}
                className="mt-3"
              >
                {product.images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative aspect-square w-full cursor-pointer rounded-xl overflow-hidden border border-transparent hover:border-black/20 transition-all">
                      <Image
                        src={img}
                        alt={`Thumb ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* 右側資訊區塊 */}
          <div className="flex flex-col gap-6">
            <header className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {currentDisplayName}
              </h1>
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs sm:text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100">
              <p className="text-3xl font-bold text-gray-900">
                {t.currency} {product.price}
              </p>
              {Number(product.regular_price) > Number(product.price) && (
                <p className="text-gray-400 line-through text-lg">
                  {t.currency} {product.regular_price}
                </p>
              )}
            </div>

            <div
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: displayDesc }}
            />

            <div className="mt-4 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-4 border border-gray-300 rounded-full px-2 py-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="text-lg w-8 text-center font-medium">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
                <motion.button
                  onClick={addToCart}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 sm:flex-none rounded-full bg-black text-white py-3 px-10 font-bold text-lg hover:bg-neutral-800 transition shadow-lg"
                >
                  {t.add_to_cart}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="bg-[#c1a46f] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <span>
                {t.add_success_prefix} <strong>{currentDisplayName}</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* =================================================================
   Server Side Logic
   ================================================================= */

export async function getStaticPaths() {
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;
  try {
    const prodUrl = `${WC_URL}/wp-json/wc/v3/products?per_page=100&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`;
    const prodRes = await fetch(prodUrl);
    const products = await prodRes.json();
    const paths = [];
    if (Array.isArray(products)) {
      products.forEach((p) => {
        paths.push({ params: { slug: p.slug }, locale: "zh-TW" });
        paths.push({ params: { slug: p.slug }, locale: "en" });
      });
    }
    return { paths, fallback: "blocking" };
  } catch (err) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params, locale }) {
  const { slug } = params;
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;

  try {
    // 1. Fetch current product
    let res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?slug=${encodeURIComponent(
        slug
      )}&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
    );
    let data = await res.json();

    if (!data || data.length === 0) {
      return { notFound: true };
    }

    let p = data[0];

    // Detect language/features
    const isChineseSlug = /[^\x00-\x7F]+/.test(slug);
    let productLang = p.lang || "en";
    if (
      productLang === "zh" ||
      productLang === "zh-TW" ||
      productLang === "zh_TW" ||
      isChineseSlug
    ) {
      productLang = "zh-TW";
    }

    // 準備雙語名稱物件
    const names = {
      zh: null,
      en: null,
    };

    // 填充當前語言的名稱
    if (productLang === "zh-TW") {
      names.zh = p.name;
    } else {
      names.en = p.name;
    }

    // 尋找「中文版 ID」與「另一種語言的名稱」
    let linkedChineseId = null;
    let targetSlug = null;

    const zhId = p.translations?.zh || p.translations?.zh_TW;
    const enId = p.translations?.en;

    // --- 抓取另一種語言的資料 ---
    if (productLang === "zh-TW") {
      linkedChineseId = p.id;
      if (enId) {
        const resEn = await fetch(
          `${WC_URL}/wp-json/wc/v3/products/${enId}?consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
        );
        if (resEn.ok) {
          const pEn = await resEn.json();
          names.en = pEn.name;
          targetSlug = pEn.slug;
        }
      }
    } else {
      if (zhId) {
        const resZh = await fetch(
          `${WC_URL}/wp-json/wc/v3/products/${zhId}?consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
        );
        if (resZh.ok) {
          const pZh = await resZh.json();
          names.zh = pZh.name;
          linkedChineseId = pZh.id;
          targetSlug = pZh.slug;
        }
      } else if (p.sku) {
        const resSku = await fetch(
          `${WC_URL}/wp-json/wc/v3/products?sku=${p.sku}&lang=zh&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
        );
        if (resSku.ok) {
          const dataSku = await resSku.json();
          const found = dataSku.find((item) => item.id !== p.id);
          if (found) {
            names.zh = found.name;
            linkedChineseId = found.id;
            targetSlug = found.slug;
          }
        }
      }
    }

    // 5. 修改：移除 return redirect，改為設定變數
    let redirectDestination = null;

    if (locale === "en" && productLang === "zh-TW") {
      if (targetSlug && targetSlug !== slug) {
        redirectDestination = `/en/beer/${targetSlug}`;
      }
    }
    if (locale === "zh-TW" && productLang !== "zh-TW") {
      if (targetSlug && targetSlug !== slug) {
        redirectDestination = `/beer/${targetSlug}`;
      }
    }

    // 處理價格
    let finalPrice = p.price || p.sale_price || p.regular_price || "0";
    if (p.type === "variable" && (!p.price || p.price === "0")) {
      const varRes = await fetch(
        `${WC_URL}/wp-json/wc/v3/products/${p.id}/variations?consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
      );
      const varData = await varRes.json();
      if (Array.isArray(varData) && varData.length > 0) {
        finalPrice =
          varData[0].price ||
          varData[0].sale_price ||
          varData[0].regular_price ||
          finalPrice;
      }
    }

    const product = {
      id: p.id,
      name: p.name,
      description: p.description || "",
      short_description: p.short_description || "",
      price: finalPrice,
      regular_price: p.regular_price || "0",
      images: p.images?.map((img) => img.src) || ["/images/placeholder.png"],
      tags: p.tags?.map((t) => t.name) || [],
      translations: p.translations || null,
      lang: p.lang || "zh_TW",
      sku: p.sku || "",
    };

    return {
      props: {
        product,
        linkedChineseId: linkedChineseId || product.id,
        names: names,
        // 6. 將轉址目標傳給前端
        redirectDestination,
      },
      revalidate: 60,
    };
  } catch (err) {
    console.error("❌ getStaticProps Error:", err);
    return { notFound: true };
  }
}
