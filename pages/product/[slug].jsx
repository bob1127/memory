"use client";

import { useState, useEffect, useMemo } from "react";
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

/**
 * ✅ Export-safe SSG
 * - 不在 getStaticProps 回傳 redirect（避免 next export 爆）
 * - 用 redirectDestination 交給前端 router.replace
 * - revalidate: 10
 * - SEO: canonical / hreflang / OG / Twitter / JSON-LD
 */

const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.memorycorner8.com";
const SITE_URL = ensureURL(SITE_URL_RAW);

const SITE_NAME = "Memory Corner";
const BRAND_NAME = "Memory Corner";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`; // 建議你放一張

const PAGE_TRANSLATIONS = {
  "zh-TW": {
    not_found: "找不到此商品",
    add_to_cart: "加入購物車",
    add_success_prefix: "已加入購物車：",
    currency: "NT$",
    breadcrumb_home: "首頁",
    breadcrumb_groupbuy: "團購商品",
    breadcrumb_beer: "啤酒訂購",
  },
  en: {
    not_found: "Product not found",
    add_to_cart: "Add to Cart",
    add_success_prefix: "Added to cart: ",
    currency: "NT$",
    breadcrumb_home: "Home",
    breadcrumb_groupbuy: "Group Buy",
    breadcrumb_beer: "Beer Order",
  },
};

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .trim();
};

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}

function toAbsUrl(site, src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return `${site}${src}`;
  return `${site}/${src}`;
}

function detectLangFromProduct(p, slug) {
  const isChineseSlug = /[^\x00-\x7F]+/.test(String(slug || ""));
  const raw = (p?.lang || "").toString();
  if (isChineseSlug) return "zh-TW";
  if (raw === "zh" || raw === "zh-TW" || raw === "zh_TW") return "zh-TW";
  return "en";
}

function buildAuthUrl(path, paramsObj = {}) {
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;

  const url = new URL(`${ensureURL(WC_URL)}${path}`);
  Object.entries(paramsObj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });
  url.searchParams.set("consumer_key", WC_CK || "");
  url.searchParams.set("consumer_secret", WC_CS || "");
  return url.toString();
}

/* =================================================================
   Frontend Component
   ================================================================= */
export default function ProductInner({
  product,
  linkedChineseId,
  names,
  redirectDestination,
  zhSlug,
  enSlug,
}) {
  const { locale, asPath, replace, query, isReady } = useRouter();

  const from = (query?.from || "").toString(); // groupBuy | beer | ""
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);

  // ✅ 前端導向（兼容 next export）
  useEffect(() => {
    if (!isReady) return;
    if (redirectDestination) {
      // 保留 query（如 ?from=groupBuy）
      const q = window?.location?.search || "";
      replace(`${redirectDestination}${q}`);
    }
  }, [redirectDestination, replace, isReady]);

  // reset thumbs
  useEffect(() => {
    setThumbsSwiper(null);
  }, [locale, product?.id]);

  if (redirectDestination) return null;
  if (!product) return null;

  const currentDisplayName = isEn
    ? names?.en || product.name
    : names?.zh || product.name;

  const rawSeoDesc = product.short_description || product.description;
  const cleanSeoDesc =
    stripHtml(rawSeoDesc).substring(0, 160) ||
    (isEn ? "Product details" : "商品介紹");

  const displayDesc = product.description;

  // canonical 去 query
  const pathOnly = (asPath || "").split("?")[0];
  const canonical = `${SITE_URL}${pathOnly}`;

  // 圖片：轉絕對網址
  const imageList = (
    product.images?.length ? product.images : ["/images/placeholder.png"]
  ).map((s) => toAbsUrl(SITE_URL, s));

  const mainImage = imageList?.[0] || DEFAULT_OG_IMAGE;

  // breadcrumb 第二層
  const crumb2 =
    from === "beer"
      ? {
          label: t.breadcrumb_beer,
          href: isEn ? "/en/beer" : "/beer",
        }
      : {
          label: t.breadcrumb_groupbuy,
          href: isEn ? "/en/groupBuy" : "/groupBuy",
        };

  // hreflang（用 server 算好的 slug 更準）
  const hrefLangZh = zhSlug
    ? `${SITE_URL}/product/${zhSlug}`
    : canonical.replace(`${SITE_URL}/en/`, `${SITE_URL}/`);
  const hrefLangEn = enSlug
    ? `${SITE_URL}/en/product/${enSlug}`
    : canonical.includes(`${SITE_URL}/en/`)
    ? canonical
    : canonical.replace(`${SITE_URL}/`, `${SITE_URL}/en/`);

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
        price: Number(product.price || 0),
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

  /* ---------- JSON-LD ---------- */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: currentDisplayName,
    image: imageList,
    description: cleanSeoDesc,
    brand: { "@type": "Brand", name: BRAND_NAME },
    sku: product.sku ? String(product.sku) : String(product.id),
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "TWD",
      price: String(product.price || "0"),
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
        name: crumb2.label,
        item: `${SITE_URL}${crumb2.href}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: currentDisplayName,
        item: canonical,
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: isEn ? "en" : "zh-Hant",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/有香餐飲集團-logo.png`,
  };

  return (
    <Layout>
      <Head>
        <title key="title">{`${currentDisplayName} | ${SITE_NAME}`}</title>
        <meta name="description" content={cleanSeoDesc} key="description" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="theme-color" content="#ffffff" />

        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="zh-Hant" href={hrefLangZh} />
        <link rel="alternate" hrefLang="en" href={hrefLangEn} />
        <link rel="alternate" hrefLang="x-default" href={hrefLangZh} />

        {/* OG */}
        <meta property="og:title" content={currentDisplayName} key="og:title" />
        <meta property="og:description" content={cleanSeoDesc} key="og:desc" />
        <meta property="og:image" content={mainImage} key="og:image" />
        <meta property="og:url" content={canonical} key="og:url" />
        <meta property="og:type" content="product" key="og:type" />
        <meta property="og:site_name" content={SITE_NAME} key="og:site" />
        <meta
          property="og:locale"
          content={isEn ? "en_US" : "zh_TW"}
          key="og:locale"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" key="tw:card" />
        <meta
          name="twitter:title"
          content={currentDisplayName}
          key="tw:title"
        />
        <meta name="twitter:description" content={cleanSeoDesc} key="tw:desc" />
        <meta name="twitter:image" content={mainImage} key="tw:image" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          key="schema-website"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
          key="schema-org"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
          key="schema-product"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="schema-breadcrumb"
        />
      </Head>

      <section className="w-full bg-white mx-auto px-4 sm:px-6 lg:px-8 py-[100px]">
        {/* Breadcrumb */}
        <nav className="max-w-[1200px] mx-auto mb-6 text-sm text-gray-500">
          <Link
            href={isEn ? "/en" : "/"}
            className="hover:text-black transition"
          >
            {t.breadcrumb_home}
          </Link>
          <span className="mx-2">/</span>
          <Link href={crumb2.href} className="hover:text-black transition">
            {crumb2.label}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">{currentDisplayName}</span>
        </nav>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
          {/* 左側圖片 */}
          <div
            className="lg:sticky lg:top-24 self-start"
            key={`${product.id}-${locale}`}
          >
            <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100">
              <Swiper
                modules={[Thumbs]}
                spaceBetween={12}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                className="w-full h-full"
              >
                {imageList.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`${currentDisplayName} - ${idx + 1}`}
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

            {imageList.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={5}
                modules={[Thumbs]}
                className="mt-3"
                watchSlidesProgress
              >
                {imageList.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative aspect-square w-full cursor-pointer rounded-xl overflow-hidden border border-transparent hover:border-black/20 transition-all">
                      <Image
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* 右側資訊 */}
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
                    aria-label="decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-lg w-8 text-center font-medium">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 transition"
                    aria-label="increase quantity"
                  >
                    +
                  </button>
                </div>

                <motion.button
                  onClick={addToCart}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 sm:flex-none rounded-full bg-black text-white py-3 px-10 font-bold text-lg hover:bg-neutral-800 transition shadow-lg whitespace-nowrap"
                >
                  {t.add_to_cart}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
   Server Side Logic (SSG + ISR)
   ================================================================= */

export async function getStaticPaths() {
  try {
    const prodUrl = buildAuthUrl("/wp-json/wc/v3/products", {
      per_page: 100,
      page: 1,
    });

    const prodRes = await fetch(prodUrl);
    const products = await prodRes.json();

    const paths = [];
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (!p?.slug) return;
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
  const slug = params?.slug;

  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;

  if (!slug || !WC_URL || !WC_CK || !WC_CS) {
    return { notFound: true, revalidate: 10 };
  }

  try {
    // 1) 用 slug 找商品
    const findUrl = buildAuthUrl("/wp-json/wc/v3/products", {
      slug: encodeURIComponent(String(slug)),
    });

    const res = await fetch(findUrl);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { notFound: true, revalidate: 10 };
    }

    const p = data[0];

    // 2) 判斷商品語系
    const productLang = detectLangFromProduct(p, slug); // "zh-TW" | "en"

    // 3) 準備雙語名稱
    const names = { zh: null, en: null };
    if (productLang === "zh-TW") names.zh = p.name;
    else names.en = p.name;

    // 4) translations id
    const zhId = p.translations?.zh || p.translations?.zh_TW;
    const enId = p.translations?.en;

    let linkedChineseId = null;
    let targetSlug = null;

    let zhSlug = null;
    let enSlug = null;

    // 5) 抓另一語系商品
    if (productLang === "zh-TW") {
      linkedChineseId = p.id;
      zhSlug = p.slug;

      if (enId) {
        const resEn = await fetch(
          buildAuthUrl(`/wp-json/wc/v3/products/${enId}`)
        );
        if (resEn.ok) {
          const pEn = await resEn.json();
          names.en = pEn?.name || null;
          targetSlug = pEn?.slug || null;
          enSlug = pEn?.slug || null;
        }
      }
    } else {
      // en
      enSlug = p.slug;

      if (zhId) {
        const resZh = await fetch(
          buildAuthUrl(`/wp-json/wc/v3/products/${zhId}`)
        );
        if (resZh.ok) {
          const pZh = await resZh.json();
          names.zh = pZh?.name || null;
          linkedChineseId = pZh?.id || null;
          targetSlug = pZh?.slug || null;
          zhSlug = pZh?.slug || null;
        }
      } else if (p.sku) {
        // sku fallback
        const resSku = await fetch(
          buildAuthUrl("/wp-json/wc/v3/products", {
            sku: encodeURIComponent(String(p.sku)),
          })
        );
        if (resSku.ok) {
          const dataSku = await resSku.json();
          const found = (Array.isArray(dataSku) ? dataSku : []).find(
            (item) => item?.id && item.id !== p.id
          );
          if (found) {
            names.zh = found.name || null;
            linkedChineseId = found.id || null;
            targetSlug = found.slug || null;
            zhSlug = found.slug || null;
          }
        }
      }
    }

    // ✅ 6) 不用 redirect 回傳（避免 next export 爆），改回傳 redirectDestination
    let redirectDestination = null;
    if (locale === "en" && productLang === "zh-TW") {
      if (targetSlug && targetSlug !== slug) {
        redirectDestination = `/en/product/${targetSlug}`;
      }
    }
    if ((locale === "zh-TW" || !locale) && productLang !== "zh-TW") {
      if (targetSlug && targetSlug !== slug) {
        redirectDestination = `/product/${targetSlug}`;
      }
    }

    // 7) 價格處理（variable fallback）
    let finalPrice = p.price || p.sale_price || p.regular_price || "0";
    if (p.type === "variable" && (!finalPrice || finalPrice === "0")) {
      const varRes = await fetch(
        buildAuthUrl(`/wp-json/wc/v3/products/${p.id}/variations`, {
          per_page: 10,
          page: 1,
        })
      );
      const varData = await varRes.json();
      if (Array.isArray(varData) && varData.length > 0) {
        const v0 = varData[0];
        finalPrice =
          v0.price || v0.sale_price || v0.regular_price || finalPrice;
      }
    }

    // 8) 回傳乾淨 product
    const product = {
      id: p.id,
      name: p.name,
      description: p.description || "",
      short_description: p.short_description || "",
      price: finalPrice,
      regular_price: p.regular_price || "0",
      images: p.images?.map((img) => img?.src).filter(Boolean) || [
        "/images/placeholder.png",
      ],
      tags: p.tags?.map((t) => t?.name).filter(Boolean) || [],
      translations: p.translations || null,
      lang: p.lang || "zh_TW",
      sku: p.sku || "",
    };

    return {
      props: {
        product,
        linkedChineseId: linkedChineseId || product.id,
        names,
        redirectDestination,
        zhSlug: zhSlug || null,
        enSlug: enSlug || null,
      },
      revalidate: 10, // ✅ 你要的 10
    };
  } catch (err) {
    console.error("❌ getStaticProps Error:", err);
    return { notFound: true, revalidate: 10 };
  }
}
