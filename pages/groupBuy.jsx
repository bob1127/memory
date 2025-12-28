"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";

/**
 * ✅ SEO / Structured Data / SSG-ISR optimized version
 * - Client side 不再重新 setProducts（更接近靜態頁）
 * - JSON-LD：BreadcrumbList + ItemList + CollectionPage + WebSite + Organization
 * - SEO：canonical / hreflang / OG / Twitter / robots / theme-color
 * - ISR：getStaticProps + revalidate（更像靜態站：較長 revalidate）
 */

const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const SITE_URL = ensureURL(SITE_URL_RAW);
const SITE_NAME = "Memory Corner";
const OG_IMAGE_DEFAULT = `${SITE_URL}/images/og-default.png`; // 建議放一張，不然用 fallback

const PAGE_TRANSLATIONS = {
  "zh-TW": {
    seo: {
      title: "團購商品 | 有香 Memory Corner",
      description: "依分類瀏覽團購商品（不含啤酒），快速加入購物車。",
    },
    title: "團購商品",
    loading: "商品載入中...",
    add_to_cart: "加入購物車",
    add_success_prefix: "「",
    add_success_suffix: "」已加入購物車",
    unit: "份",
    currency: "NT$",
    breadcrumb: "團購商品",
    empty: "此分類目前沒有商品",
    all: "全部",
  },
  en: {
    seo: {
      title: "Group Buy | Memory Corner",
      description: "Browse products by categories (excluding beer).",
    },
    title: "GROUP BUY",
    loading: "Loading products...",
    add_to_cart: "Add to Cart",
    add_success_prefix: "",
    add_success_suffix: " has been added to cart",
    unit: "item(s)",
    currency: "NT$",
    breadcrumb: "Group Buy",
    empty: "No products in this category",
    all: "All",
  },
};

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

export default function GroupBuyPage({ initialItems = [] }) {
  const router = useRouter();
  const { locale, asPath } = router;

  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  // ✅ 更接近靜態：不再把 initialItems 放進 products state 再 set
  const products = initialItems;

  const [activeCat, setActiveCat] = useState("ALL");

  // ✅ qtyMap 直接用 initializer（避免先 render 空，再 useEffect 填）
  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    (initialItems || []).forEach((p) => {
      if (p?.id != null) m[p.id] = 1;
    });
    return m;
  });

  // ✅ 當 ISR 更新導致 initialItems 變動時，補上新商品的 qty 初始值
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

  // ✅ 切 tab 後 smooth scroll 回到列表頂
  const listTopRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, text });
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };

  useEffect(
    () => () => toastTimerRef.current && clearTimeout(toastTimerRef.current),
    []
  );

  const setQty = (id, next) =>
    setQtyMap((m) => ({
      ...m,
      [id]: Math.max(0, Number.isFinite(+next) ? +next : 0),
    }));

  const addToCart = (product) => {
    const raw = qtyMap[product.id] ?? 0;
    if (raw <= 0) return;

    const safeQty = Math.max(1, raw);
    const price = priceFromItem(product);

    const currentName = product.name;
    const customEnName = product.extensions?.custom_acf?.en_product_name;

    const nameZh = currentName;
    const nameEn = isEn ? currentName : customEnName || currentName;

    const cartId = product.linkedChineseId || product.id;

    cartStore.add(
      {
        id: cartId,
        productId: product.id,
        name: currentName,
        name_zh: nameZh,
        name_en: nameEn,
        img: product.img,
        price,
      },
      safeQty
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }

    const msg = isEn
      ? `${t.add_success_prefix}${currentName}${t.add_success_suffix} (${safeQty} ${t.unit})`
      : `${t.add_success_prefix}${currentName}${t.add_success_suffix}（${safeQty} ${t.unit}）`;

    showToast(msg);
    setQty(product.id, 0);
  };

  // ✅ 從 products 反推分類 tabs
  const tabs = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      (p.categories || []).forEach((c) => {
        if (!c?.id) return;
        map.set(c.id, { id: c.id, name: c.name, slug: c.slug });
      });
    });

    const arr = Array.from(map.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "zh-Hant")
    );

    return [{ id: "ALL", name: t.all }, ...arr];
  }, [products, t.all]);

  const filteredProducts = useMemo(() => {
    if (activeCat === "ALL") return products;
    return (products || []).filter((p) =>
      (p.categories || []).some((c) => String(c.id) === String(activeCat))
    );
  }, [products, activeCat]);

  // =========================
  // ✅ SEO / canonical / hreflang
  // =========================
  const currentUrl = `${SITE_URL}${asPath || ""}`;

  // 這裡用 /groupBuy 與 /en/groupBuy 做語系對應（依你的 routing）
  const canonicalZh = `${SITE_URL}/groupBuy`;
  const canonicalEn = `${SITE_URL}/en/groupBuy`;

  const canonical = isEn ? canonicalEn : canonicalZh;

  const ogTitle = t.seo.title;
  const ogDesc = t.seo.description;
  const ogImage =
    filteredProducts?.[0]?.img &&
    String(filteredProducts[0].img).startsWith("http")
      ? filteredProducts[0].img
      : OG_IMAGE_DEFAULT;

  // =========================
  // ✅ Structured data
  // =========================
  const seoProducts = filteredProducts;

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
        item: canonical,
      },
    ],
  };

  // ItemList (列表頁最合適)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (seoProducts || []).map((p, index) => {
      const enName = p.extensions?.custom_acf?.en_product_name;
      const displayName = isEn && enName ? enName : p.name;

      const description =
        p.extensions?.custom_acf?.en_description || p.short_description || "";

      let fullImageUrl = p.img || "";
      if (fullImageUrl.startsWith("/"))
        fullImageUrl = `${SITE_URL}${fullImageUrl}`;

      const price = priceFromItem(p);

      const productPath = `/product/${p.slug}`;
      const productUrl = `${SITE_URL}${isEn ? "/en" : ""}${productPath}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        url: productUrl,
        name: displayName,
        image: fullImageUrl || OG_IMAGE_DEFAULT,
        description: stripHtml(description),
        sku: p.sku || undefined,
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: "TWD",
          availability: "https://schema.org/InStock",
          url: productUrl,
        },
      };
    }),
  };

  // CollectionPage（更精準表達「這頁是商品集合」）
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ogTitle,
    description: ogDesc,
    url: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    breadcrumb: breadcrumbSchema,
    mainEntity: itemListSchema,
  };

  // WebSite + Organization（站點層級）
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
        {/* Basic SEO */}
        <title key="title">{ogTitle}</title>
        <meta name="description" content={ogDesc} key="description" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="theme-color" content="#f9f6f3" />

        {/* Canonical + hreflang */}
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="zh-Hant" href={canonicalZh} />
        <link rel="alternate" hrefLang="en" href={canonicalEn} />
        <link rel="alternate" hrefLang="x-default" href={canonicalZh} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogTitle} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD (結構化資料) */}
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
          key="schema-organization"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="schema-breadcrumb"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
          key="schema-itemlist"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionPageSchema),
          }}
          key="schema-collectionpage"
        />
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen">
        {/* Hero (更像靜態：不做 JS 依賴的高度計算) */}
        <section className="pt-20 md:pt-0 max-h-screen overflow-hidden">
          <Image
            src="/images/group-buy/2025-10--IG-1920x768px-01.webp"
            alt="group-buy-banner"
            priority
            placeholder="empty"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            sizes="100vw"
          />
        </section>

        {/* Toast */}
        <div className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center">
          <AnimatePresence mode="wait">
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: -8, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                transition={{ duration: 0.36 }}
                className="mb-8 rounded-xl bg-[#c1a46f] text-white px-4 py-2 shadow-lg text-xs sm:text-sm md:text-base"
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title + Tabs（tabs 不 fade） */}
        <section className="pt-28 pb-6">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <h1 className="text-[20px] sm:text-[22px] md:text-[26px] font-bold tracking-wider">
              {t.title}
            </h1>

            {/* Tabs：水平滑動（最穩） */}
            <div className="mt-5">
              <div className="-mx-2 px-2 overflow-x-auto">
                <div className="flex gap-2 w-max">
                  {tabs.map((c) => {
                    const active = String(c.id) === String(activeCat);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveCat(c.id);
                          requestAnimationFrame(() => {
                            listTopRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          });
                        }}
                        className={`shrink-0 px-3 sm:px-4 py-2 rounded-full border transition text-[12px] sm:text-[14px] whitespace-nowrap ${
                          active
                            ? "bg-black text-white border-black"
                            : "bg-white text-black hover:bg-gray-50"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 內容（只有內容 fade） */}
        <section className="pb-24">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <div ref={listTopRef} />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCat}-${locale}`}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {filteredProducts.length === 0 ? (
                  <p className="text-center mt-10 text-gray-500 text-sm sm:text-base">
                    {t.empty}
                  </p>
                ) : (
                  <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: {
                        transition: {
                          staggerChildren: 0.03,
                          delayChildren: 0.06,
                        },
                      },
                    }}
                  >
                    {filteredProducts.map((p) => {
                      const q = qtyMap[p.id] ?? 0;
                      const displayPrice = priceFromItem(p);
                      const enName = p.extensions?.custom_acf?.en_product_name;
                      const displayName = isEn && enName ? enName : p.name;

                      return (
                        <motion.article
                          key={p.id}
                          variants={{
                            hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
                            show: {
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: {
                                duration: 0.35,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            },
                          }}
                          className="flex flex-col bg-white rounded-2xl p-3 sm:p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition"
                          itemScope
                          itemType="https://schema.org/Product"
                        >
                          <div className="text-center px-1">
                            <h3
                              className="text-[13px] sm:text-[15px] md:text-[16px] font-bold leading-snug line-clamp-2 min-h-[2.6em]"
                              itemProp="name"
                              title={displayName}
                            >
                              {displayName}
                            </h3>

                            {displayPrice > 0 && (
                              <p
                                className="mt-1 sm:mt-2 text-black/80 font-medium text-[12px] sm:text-[13px]"
                                itemProp="offers"
                                itemScope
                                itemType="https://schema.org/Offer"
                              >
                                <meta itemProp="priceCurrency" content="TWD" />
                                <span itemProp="price">
                                  {Number(displayPrice).toLocaleString()}
                                </span>{" "}
                                {t.currency}
                              </p>
                            )}
                          </div>

                          <Link
                            href={`/product/${p.slug}?from=groupBuy`}
                            aria-label={`View details of ${displayName}`}
                            className="relative mt-2 sm:mt-3 w-full aspect-square"
                          >
                            <Image
                              src={p.img}
                              alt={displayName}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-contain p-2 transition-transform group-hover:scale-[1.05]"
                              itemProp="image"
                            />
                          </Link>

                          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                            <button
                              onClick={() => setQty(p.id, q - 1)}
                              className="rounded-xl border px-3 sm:px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                              disabled={q <= 0}
                              aria-label="decrease quantity"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={q}
                              onChange={(e) =>
                                setQty(
                                  p.id,
                                  Math.max(
                                    0,
                                    parseInt(e.target.value || "0", 10)
                                  )
                                )
                              }
                              className="w-14 sm:w-16 rounded-xl border px-2 py-2 text-center text-[13px] sm:text-[14px]"
                              inputMode="numeric"
                            />
                            <button
                              onClick={() => setQty(p.id, q + 1)}
                              className="rounded-xl border px-3 sm:px-4 py-2 hover:bg-gray-50"
                              aria-label="increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <motion.button
                            onClick={() => addToCart(p)}
                            disabled={q <= 0}
                            whileTap={{ scale: 0.98 }}
                            className={`mt-3 w-full rounded-xl px-3 sm:px-4 py-2 text-white transition-colors text-[12px] sm:text-[14px] whitespace-nowrap ${
                              q > 0
                                ? "bg-black hover:opacity-90"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {t.add_to_cart}
                          </motion.button>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>
    </Layout>
  );
}

/* =========================
   ✅ SSG + ISR：最接近靜態的做法
   - getStaticProps 在 build 先產頁面（SSG）
   - revalidate 讓資料定期更新（ISR）
   - 你可以把 revalidate 拉長（更像靜態、也更省 API）
   ========================= */
export async function getStaticProps({ locale }) {
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;

  const langMap = { "zh-TW": "zh_TW", en: "en" };
  const wpLang = langMap[locale] || "zh_TW";

  let initialItems = [];

  try {
    // 1) store products
    const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
    storeURL.searchParams.set("per_page", "100");
    storeURL.searchParams.set("lang", wpLang);

    const r = await fetch(storeURL.toString(), {
      headers: { Accept: "application/json" },
      // Next.js pages router：這裡不能用 next: { revalidate }；ISR 由 return 的 revalidate 控制
    });

    if (!r.ok) {
      const text = await r.text();
      console.log("[groupBuy] store products not ok:", r.status, text);
      return { props: { initialItems: [] }, revalidate: 10 };
    }

    const rawList = await r.json();
    const list = Array.isArray(rawList) ? rawList : [];

    // ✅ 排除 beer 商品
    const isBeerProduct = (p) => {
      const cats = p?.categories || [];
      return cats.some((c) => {
        const slug = String(c?.slug || "").toLowerCase();
        const name = String(c?.name || "").toLowerCase();
        if (slug === "beer" || slug.startsWith("beer-")) return true;
        if (name.includes("啤酒")) return true;
        return false;
      });
    };

    const filteredList = list.filter((p) => !isBeerProduct(p));
    const ids = filteredList
      .map((p) => p?.id)
      .filter(Boolean)
      .slice(0, 200);

    // 2) v3 meta（拿翻譯、短描述、sku）
    const metaMap = new Map();

    if (ids.length && ck && cs) {
      const v3 = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
      v3.searchParams.set("include", ids.join(","));
      v3.searchParams.set("per_page", String(ids.length));
      v3.searchParams.set(
        "_fields",
        "id,name,short_description,sku,translations"
      );
      v3.searchParams.set("lang", wpLang);

      const vr = await fetch(v3.toString(), {
        headers: {
          Accept: "application/json",
          Authorization: basicAuth(ck, cs),
        },
      });

      if (vr.ok) {
        const v3data = await vr.json();
        (Array.isArray(v3data) ? v3data : []).forEach((it) => {
          metaMap.set(it.id, {
            name: it.name,
            short_description: it.short_description,
            sku: it.sku,
            translations: it.translations,
          });
        });
      }
    }

    // 3) merge（讓前端完全靠 initialItems 顯示，避免 CSR 再打 API）
    initialItems = filteredList.map((p) => {
      const detail = metaMap.get(p.id) || {};

      if (!p.extensions) p.extensions = {};
      if (!p.extensions.custom_acf) p.extensions.custom_acf = {};

      // 英文名稱/描述（依你原本邏輯）
      p.extensions.custom_acf.en_product_name = detail.name || p.name;
      p.extensions.custom_acf.en_description =
        detail.short_description || p.short_description || "";

      p.sku = detail.sku || "";

      // ✅ 英文站加入購物車時，對齊中文商品 id（避免同品兩個 id）
      let linkedChineseId = p.id;
      if (wpLang === "en") {
        const zhId = detail.translations?.zh || detail.translations?.zh_TW;
        if (zhId) linkedChineseId = zhId;
      }
      p.linkedChineseId = linkedChineseId;

      // 圖片
      let imgSrc = p.images?.[0]?.src;
      if (imgSrc && !imgSrc.startsWith("http"))
        imgSrc = `${ensureURL(base)}${imgSrc}`;
      p.img = imgSrc || "/images/placeholder.png";

      return p;
    });
  } catch (e) {
    console.log("[groupBuy] getStaticProps error:", e);
  }

  // ✅ ISR：建議 15 分鐘更新一次（更像靜態頁、又不會太舊）
  return { props: { initialItems }, revalidate: 10 };
}

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
function basicAuth(ck, cs) {
  return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
}
