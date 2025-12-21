"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "react-marquee-slider";
import { cartStore } from "@/lib/cartStore";

/* ... (保留上面的 const 設定, MARQUEE_ITEMS 等，不需改變) ... */
const APPEAR_DELAY_MS = 800;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
// ... 省略 MARQUEE_ITEMS 定義 ...

/* ... (保留 PAGE_TRANSLATIONS, priceFromItem, stripHtml) ... */

// ... PAGE_TRANSLATIONS ...
const PAGE_TRANSLATIONS = {
  "zh-TW": {
    seo: {
      title: "精釀啤酒訂購 | 有香 Memory Corner",
      description:
        "線上訂購有香 Memory Corner 精選精釀啤酒。提供多種風味，適合搭配我們的經典台式料理。立即選購，享受微醺時光。",
    },
    title: "精釀啤酒 ORDER",
    loading: "商品載入中...",
    add_to_cart: "加入購物車",
    add_success_prefix: "「",
    add_success_suffix: "」已加入購物車",
    unit: "箱",
    currency: "NT$",
    breadcrumb: "啤酒訂購",
  },
  en: {
    seo: {
      title: "Craft Beer Order | Memory Corner",
      description:
        "Order selected craft beers online from Memory Corner. Various flavors available to pair with our authentic Taiwanese cuisine. Shop now.",
    },
    title: "Craft Beer ORDER",
    loading: "Loading products...",
    add_to_cart: "Add to Cart",
    add_success_prefix: "",
    add_success_suffix: " has been added to cart",
    unit: "box(es)",
    currency: "NT$",
    breadcrumb: "Beer Order",
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

export default function BeerOrderPage({ initialItems = [] }) {
  const { locale, asPath } = useRouter();
  const t = PAGE_TRANSLATIONS[locale] || PAGE_TRANSLATIONS["zh-TW"];
  const isEn = locale === "en";

  const [products, setProducts] = useState(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [qtyMap, setQtyMap] = useState({});

  useEffect(() => {
    if (initialItems.length > 0) {
      setQtyMap(Object.fromEntries(initialItems.map((p) => [p.id, 1])));
      setLoading(false);
    }
  }, [initialItems]);

  // Client Fetch Fallback
  useEffect(() => {
    if (initialItems.length > 0) return;
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products/beer");
        const data = await res.json();
        if (data.ok && Array.isArray(data.items)) {
          setProducts(data.items);
          setQtyMap(Object.fromEntries(data.items.map((p) => [p.id, 1])));
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [initialItems]);

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

  /* ---------- 關鍵修正區：addToCart ---------- */
  const addToCart = (product) => {
    const raw = qtyMap[product.id] ?? 0;
    if (raw <= 0) return;
    const safeQty = Math.max(1, raw);
    const price = priceFromItem(product);

    // 取得當前頁面顯示的名稱
    const currentName = product.name;
    // 取得後台設定的自訂英文名稱 (若有的話)
    const customEnName = product.extensions?.custom_acf?.en_product_name;

    // 決定雙語名稱
    // 1. 如果在中文頁：name_zh 就是 currentName，name_en 優先抓 customEnName，沒有就用 currentName
    // 2. 如果在英文頁：name_en 就是 currentName，name_zh 這裡暫時沒有資料(因為是英文API)，只好暫填 currentName
    //    (但在中文頁加入時，我們會修正回來)
    const nameZh = isEn ? currentName : currentName;
    const nameEn = isEn ? currentName : customEnName || currentName;

    // 使用 linkedChineseId 進行合併 (這是解決分開問題的關鍵)
    const cartId = product.linkedChineseId || product.id;

    cartStore.add(
      {
        id: cartId,
        productId: product.id,

        name: currentName, // 這是給如果不支援多語系的購物車用的預設值

        // 這是給聰明的購物車組件用的
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

    // 動畫與 Toast
    const btn = document.getElementById(`btn-${product.id}`);
    if (btn) {
      btn.animate(
        [
          { transform: "scale(1)", filter: "brightness(1)" },
          { transform: "scale(1.06)", filter: "brightness(1.15)" },
          { transform: "scale(1)", filter: "brightness(1)" },
        ],
        { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }

    const msg = isEn
      ? `${t.add_success_prefix}${currentName}${t.add_success_suffix} (${safeQty} ${t.unit})`
      : `${t.add_success_prefix}${currentName}${t.add_success_suffix}（${safeQty} ${t.unit}）`;
    showToast(msg);
    setQty(product.id, 0);
  };
  /* ------------------------------------------- */

  const [showMarquee, setShowMarquee] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMarquee(true), APPEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  /* ... (SEO Schema 相關代碼保持不變) ... */
  const seoProducts = initialItems.length > 0 ? initialItems : products;
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
    itemListElement: seoProducts.map((p, index) => {
      const enName = p.extensions?.custom_acf?.en_product_name;
      const displayName = isEn && enName ? enName : p.name;
      const description =
        p.extensions?.custom_acf?.en_description || p.short_description || "";

      let fullImageUrl = p.img || "";
      if (fullImageUrl.startsWith("/")) {
        fullImageUrl = `${SITE_URL}${fullImageUrl}`;
      }

      const price = priceFromItem(p);
      const productUrl = `${SITE_URL}/beer/${p.slug}`;

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
          price: price,
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
        {/* ... Meta Tags ... */}
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

        {/* 跑馬燈部分保持不變 */}
        {/* ... Marquee ... */}

        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden">
          <motion.div
            className="absolute right-20 top-20 z-20"
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src="/images/logo-6.png"
              alt="Memory Corner Logo"
              width={800}
              height={500}
              priority
              className="w-[200px]"
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
              alt="Craft Beer"
              width={800}
              height={500}
              priority
              className="w-[400px] lg:w-[700px]"
            />
          </motion.div>
          <h1 className="sr-only">{t.seo.title}</h1>
        </section>

        {/* 商品列表 */}
        <section className="bg-white min-h-screen py-24">
          <div className="flex justify-center pt-20 items-center">
            <h2 className="text-[22px] font-bold tracking-wider">{t.title}</h2>
          </div>

          {loading ? (
            <p className="text-center mt-10 text-gray-500">{t.loading}</p>
          ) : (
            <div className="grid max-w-[1600px] mx-auto w-[80%] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-8">
              {products.map((p) => {
                const q = qtyMap[p.id] ?? 0;
                const displayPrice = priceFromItem(p);
                const enName = p.extensions?.custom_acf?.en_product_name;
                const displayName = isEn && enName ? enName : p.name;

                return (
                  <article
                    key={p.id}
                    className="flex flex-col justify-center items-center group transition"
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
                          <span itemProp="price">{displayPrice}</span>{" "}
                          {t.currency}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/beer/${p.slug}`}
                      className="relative block w-[240px] h-[240px]"
                    >
                      <Image
                        src={p.img}
                        alt={displayName}
                        fill
                        className="object-contain p-2 transition-transform group-hover:scale-[1.05]"
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
                            Math.max(0, parseInt(e.target.value || "0", 10))
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

                    <button
                      onClick={() => addToCart(p)}
                      id={`btn-${p.id}`}
                      disabled={q <= 0}
                      className={`mt-3 rounded-xl px-4 py-2 text-white transition-colors ${
                        q > 0
                          ? "bg-black hover:opacity-90"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {t.add_to_cart}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ... (下方 Google Map 和 Marquee 保持不變) ... */}
        <section className="bg-white pt-20 flex flex-col">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2608.125676211783!2d-123.1274940232461!3d49.17920177807608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548675082541f249%3A0x87d1f92d1d46df5f!2zTWVtb3J5IENvcm5lciDmnInpppk!5e0!3m2!1szh-TW!2stw!4v1759130334759!5m2!1szh-TW!2stw"
            className="w-full h-[500px]"
            allowFullScreen
            loading="lazy"
          />
          <Marquee>
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="text-[70px] mx-3 font-bold text-gray-200"
              >
                MEMORY CORNER
              </span>
            ))}
          </Marquee>
        </section>
      </main>
    </Layout>
  );
}

// ... getStaticProps 保持和你上一次成功的一樣 (有 linkedChineseId 邏輯) ...
export async function getStaticProps({ locale }) {
  const base = process.env.WC_URL;
  const ck = process.env.WC_CK;
  const cs = process.env.WC_CS;

  let initialItems = [];

  const langMap = { "zh-TW": "zh_TW", en: "en" };
  const wpLang = langMap[locale] || "zh_TW";

  try {
    const categoryURL = new URL(
      `${ensureURL(base)}/wp-json/wc/store/products/categories`
    );
    categoryURL.searchParams.set("slug", "beer");
    categoryURL.searchParams.set("lang", wpLang);

    const categoryRes = await fetch(categoryURL.toString(), {
      headers: { Accept: "application/json" },
    });
    const categories = await categoryRes.json();
    let categoryId = categories?.[0]?.id;

    if (categoryId) {
      const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
      storeURL.searchParams.set("per_page", "100");
      storeURL.searchParams.set("category", categoryId);
      storeURL.searchParams.set("lang", wpLang);

      const r = await fetch(storeURL.toString(), {
        headers: { Accept: "application/json" },
      });
      const rawList = await r.json();
      const list = Array.isArray(rawList) ? rawList : [];
      const ids = list
        .map((p) => p.id)
        .filter(Boolean)
        .slice(0, 100);

      let metaMap = new Map();
      if (ids.length && ck && cs) {
        const v3 = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
        v3.searchParams.set("include", ids.join(","));
        v3.searchParams.set("per_page", String(ids.length));
        v3.searchParams.set(
          "_fields",
          "id,meta_data,name,short_description,sku,translations"
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
          (Array.isArray(v3data) ? v3data : []).forEach((it) =>
            metaMap.set(it.id, {
              meta: it.meta_data || [],
              name: it.name,
              short_description: it.short_description,
              sku: it.sku,
              translations: it.translations,
            })
          );
        }
      }

      initialItems = list.map((p) => {
        const detail = metaMap.get(p.id) || {
          meta: [],
          name: p.name,
          short_description: "",
          sku: "",
          translations: {},
        };
        const enName = detail.name;
        const enDesc = detail.short_description;

        if (!p.extensions) p.extensions = {};
        if (!p.extensions.custom_acf) p.extensions.custom_acf = {};
        p.extensions.custom_acf.en_product_name = enName;
        p.extensions.custom_acf.en_description = enDesc;
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
    }
  } catch (e) {
    console.error("getStaticProps error:", e);
  }
  return { props: { initialItems }, revalidate: 60 };
}

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
function basicAuth(ck, cs) {
  return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
}
