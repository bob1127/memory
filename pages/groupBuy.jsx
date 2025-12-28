"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import { cartStore } from "@/lib/cartStore";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

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
  const { locale, asPath } = useRouter();
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const [products, setProducts] = useState(initialItems);
  const [activeCat, setActiveCat] = useState("ALL");
  const [qtyMap, setQtyMap] = useState({});

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

  // 初始化 qty
  useEffect(() => {
    if (!products?.length) return;
    setQtyMap((m) => {
      const next = { ...m };
      products.forEach((p) => {
        if (next[p.id] === undefined) next[p.id] = 1;
      });
      return next;
    });
  }, [products]);

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
    products.forEach((p) => {
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
    return products.filter((p) =>
      (p.categories || []).some((c) => String(c.id) === String(activeCat))
    );
  }, [products, activeCat]);

  // SEO
  const currentUrl = `${SITE_URL}${asPath}`;
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
        item: currentUrl,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: seoProducts.map((p, index) => {
      const enName = p.extensions?.custom_acf?.en_product_name;
      const displayName = isEn && enName ? enName : p.name;
      const description =
        p.extensions?.custom_acf?.en_description || p.short_description || "";

      let fullImageUrl = p.img || "";
      if (fullImageUrl.startsWith("/"))
        fullImageUrl = `${SITE_URL}${fullImageUrl}`;

      const price = priceFromItem(p);

      const productUrl = `${SITE_URL}/product/${p.slug}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        url: productUrl,
        name: displayName,
        image: fullImageUrl,
        description: stripHtml(description),
        sku: p.sku,
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

  return (
    <Layout>
      <Head>
        <title key="title">{t.seo.title}</title>
        <meta
          name="description"
          content={t.seo.description}
          key="description"
        />
        <link rel="canonical" href={currentUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          key="breadcrumb-schema"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
          key="itemlist-schema"
        />
      </Head>

      <main className="bg-[#f9f6f3] min-h-screen">
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
                className="mb-8 rounded-xl bg-[#c1a46f] text-white px-4 py-2 shadow-lg text-sm sm:text-base"
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="pt-28 pb-6">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            <h1 className="text-[22px] font-bold tracking-wider">{t.title}</h1>

            {/* Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
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
                    className={`px-4 py-2 rounded-full border transition ${
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
        </section>

        <section className="pb-24">
          <div className="max-w-[1600px] mx-auto w-[86%]">
            {/* scroll anchor */}
            <div ref={listTopRef} />

            {/* ✅ 超絲滑 fade 切換 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCat}-${locale}`}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {filteredProducts.length === 0 ? (
                  <p className="text-center mt-10 text-gray-500">{t.empty}</p>
                ) : (
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10"
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
                          className="flex flex-col justify-start items-center group transition bg-white rounded-2xl p-4 shadow-sm"
                          itemScope
                          itemType="https://schema.org/Product"
                        >
                          <div className="mb-2 text-center px-2">
                            <h3
                              className="block min-h-[1.5em] text-lg font-bold"
                              itemProp="name"
                            >
                              {displayName}
                            </h3>

                            {displayPrice > 0 && (
                              <p
                                className="text-black font-medium text-sm mt-2"
                                itemProp="offers"
                                itemScope
                                itemType="https://schema.org/Offer"
                              >
                                <meta itemProp="priceCurrency" content="TWD" />
                                <span itemProp="price">
                                  {displayPrice}
                                </span>{" "}
                                {t.currency}
                              </p>
                            )}
                          </div>

                          <Link
                            href={`/product/${p.slug}?from=groupBuy`}
                            aria-label={`View details of ${displayName}`}
                            className="relative block w-[240px] h-[240px]"
                          >
                            <Image
                              src={p.img}
                              alt={displayName}
                              fill
                              sizes="(max-width: 768px) 100vw, 240px"
                              className="object-contain p-2 transition-transform group-hover:scale-[1.05]"
                              itemProp="image"
                            />
                          </Link>

                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => setQty(p.id, q - 1)}
                              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                              disabled={q <= 0}
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
                              className="w-20 rounded-xl border px-3 py-2 text-center"
                            />
                            <button
                              onClick={() => setQty(p.id, q + 1)}
                              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>

                          <motion.button
                            onClick={() => addToCart(p)}
                            disabled={q <= 0}
                            whileTap={{ scale: 0.98 }}
                            className={`mt-3 w-full rounded-xl px-4 py-2 text-white transition-colors ${
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
   SSG：抓「全部商品」，再從商品反推分類 tabs
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
    });

    if (!r.ok) {
      const text = await r.text();
      console.log("[groupBuy] store products not ok:", r.status, text);
      return { props: { initialItems: [] }, revalidate: 60 };
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

    // 2) v3 meta
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

    // 3) merge
    initialItems = filteredList.map((p) => {
      const detail = metaMap.get(p.id) || {};

      if (!p.extensions) p.extensions = {};
      if (!p.extensions.custom_acf) p.extensions.custom_acf = {};

      p.extensions.custom_acf.en_product_name = detail.name || p.name;
      p.extensions.custom_acf.en_description =
        detail.short_description || p.short_description || "";

      p.sku = detail.sku || "";

      let linkedChineseId = p.id;
      if (wpLang === "en") {
        const zhId = detail.translations?.zh || detail.translations?.zh_TW;
        if (zhId) linkedChineseId = zhId;
      }
      p.linkedChineseId = linkedChineseId;

      let imgSrc = p.images?.[0]?.src;
      if (imgSrc && !imgSrc.startsWith("http"))
        imgSrc = `${ensureURL(base)}${imgSrc}`;
      p.img = imgSrc || "/images/placeholder.png";

      return p;
    });
  } catch (e) {
    console.log("[groupBuy] getStaticProps error:", e);
  }

  return { props: { initialItems }, revalidate: 60 };
}

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
function basicAuth(ck, cs) {
  return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
}
