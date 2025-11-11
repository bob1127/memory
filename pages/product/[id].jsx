// pages/product/[id].jsx
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Layout from "../Layout";
import { cartStore } from "@/lib/cartStore";
import Image from "next/image";

// --- Swiper: client-only ---
const Swiper = dynamic(() => import("swiper/react").then((m) => m.Swiper), {
  ssr: false,
});
const SwiperSlide = dynamic(
  () => import("swiper/react").then((m) => m.SwiperSlide),
  { ssr: false }
);
const Modules = dynamic(() => import("swiper/modules"), { ssr: false });

// ---------- helpers ----------
const priceFromStore = (p) =>
  p?.prices?.price ? Number(p.prices.price) / 100 : 0;
const imagesFromProduct = (p) =>
  Array.isArray(p?.images) && p.images.length
    ? p.images
    : [{ src: "/images/placeholder.png", alt: p?.name || "product" }];

const storageTagsFromProduct = (p) => {
  if (!p || !Array.isArray(p.attributes)) return [];
  const attr = p.attributes.find((a) => {
    const slug = String(a?.slug || "").toLowerCase();
    const tax = String(a?.taxonomy || "").toLowerCase();
    const name = String(a?.name || "").toLowerCase();
    return (
      name.includes("保存方式") ||
      slug === "storage" ||
      slug === "pa_storage" ||
      tax === "pa_storage"
    );
  });
  if (!attr) return [];
  if (Array.isArray(attr.terms) && attr.terms.length > 0)
    return attr.terms.map((t) => t.name).filter(Boolean);
  if (Array.isArray(attr.options) && attr.options.length > 0)
    return attr.options.map((s) => String(s).trim()).filter(Boolean);
  return [];
};
const stripHtml = (html) =>
  typeof html === "string"
    ? html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

// ---------- Page ----------
export default function ProductDetail({ product, seo }) {
  const router = useRouter();
  const p = product;

  if (router.isFallback) {
    return (
      <Layout>
        <main className="max-w-6xl mx-auto py-24 px-6 text-gray-500">
          載入中…
        </main>
      </Layout>
    );
  }

  const imgs = imagesFromProduct(p);
  const price = priceFromStore(p);
  const storageTags = storageTagsFromProduct(p);
  const firstImg = imgs?.[0]?.src || "/images/placeholder.png";

  // client state
  const [qty, setQty] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const addToCart = () => {
    cartStore.add(
      { id: p.id, name: p.name, img: firstImg, price },
      Math.max(1, qty)
    );
    alert("已加入購物車");
  };

  return (
    <Layout>
      <Head>
        {/* === 基本 SEO === */}
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical} />
        <meta name="robots" content="index,follow" />

        {/* === Open Graph === */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seo.og.title} />
        <meta property="og:description" content={seo.og.description} />
        <meta property="og:url" content={seo.og.url} />
        <meta property="og:site_name" content={seo.og.siteName} />
        <meta property="og:locale" content="zh_TW" />
        {seo.og.images.map((img, i) => (
          <meta key={i} property="og:image" content={img.url} />
        ))}

        {/* === Twitter === */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.twitter.title} />
        <meta name="twitter:description" content={seo.twitter.description} />
        <meta name="twitter:image" content={seo.twitter.image} />
      </Head>

      {/* === 結構化資料（以 next/script 輸出，SSR 可見） === */}
      <Script
        id="ld-website"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.ld.website) }}
      />
      <Script
        id="ld-organization"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seo.ld.organization),
        }}
      />
      <Script
        id="ld-webpage"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.ld.webpage) }}
      />
      <Script
        id="ld-breadcrumb"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.ld.breadcrumb) }}
      />
      <Script
        id="ld-product"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.ld.product) }}
      />
      <style jsx global>{`
        .product-swiper,
        .product-swiper .swiper-wrapper,
        .product-swiper .swiper-slide {
          height: 100%;
        }
      `}</style>

      <main className="max-w-6xl mx-auto pb-24 pt-[120px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* 左：圖片 */}
          <div className="w-full flex flex-col items-center gap-4">
            {/* SSR 首圖 */}
            <div className="w-full max-w-[520px] aspect-[1/1] relative rounded-xl overflow-hidden bg-white ring-1 ring-black/5">
              <Image
                src={firstImg}
                alt={imgs?.[0]?.alt || p.name}
                fill
                className="object-contain"
                sizes="(max-width:768px) 100vw, 520px"
                priority
              />
            </div>

            {/* 客端 Swiper */}
            {typeof window !== "undefined" && (
              <div className="w-full max-w-[520px]">
                <Swiper
                  loop
                  navigation
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[
                    Modules.FreeMode,
                    Modules.Navigation,
                    Modules.Thumbs,
                  ]}
                  className="product-swiper w-full h-[520px] rounded-xl overflow-hidden bg-white ring-1 ring-black/5"
                  style={{ height: 520 }}
                >
                  {imgs.map((image, i) => (
                    <SwiperSlide key={`main-${i}`} className="!h-full">
                      <div className="relative w-full h-full bg-white">
                        <Image
                          src={image.src}
                          alt={image.alt || `Product Image ${i}`}
                          fill
                          className="object-contain"
                          sizes="(max-width:768px) 100vw, 520px"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="mt-3">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    watchSlidesProgress
                    modules={[Modules.FreeMode, Modules.Thumbs]}
                    className="w-full"
                    breakpoints={{
                      480: { slidesPerView: 5 },
                      768: { slidesPerView: 6 },
                    }}
                  >
                    {imgs.map((image, i) => (
                      <SwiperSlide key={`thumb-${i}`}>
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 bg-white ring-1 ring-black/5">
                          <Image
                            src={image.src}
                            alt={image.alt || `Thumbnail ${i}`}
                            fill
                            className="object-contain"
                            sizes="80px"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}
          </div>

          {/* 右：內容 */}
          <div className="flex items-start lg:pt-12">
            <div className="w-full">
              <h1 className="text-2xl font-bold mb-2">{p.name}</h1>
              <div className="text-xl mb-3">NT$ {price.toLocaleString()}</div>

              {/* 保存方式 */}
              {storageTags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {storageTags.map((t, i) => {
                    const isCold = /冷藏/.test(t);
                    const isFrozen = /冷凍/.test(t);
                    const base =
                      "inline-block px-3 py-1 rounded-full text-sm align-middle ring-1 ring-black/5";
                    const cls = isFrozen
                      ? "bg-red-50 text-red-700"
                      : isCold
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-800";
                    return (
                      <span key={i} className={`${base} ${cls}`}>
                        {t}
                      </span>
                    );
                  })}
                </div>
              )}

              {p.short_description && (
                <div
                  className="prose prose-sm text-gray-700 mb-6"
                  dangerouslySetInnerHTML={{ __html: p.short_description }}
                />
              )}

              {/* 數量 + CTA */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <button
                    aria-label="decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 grid place-items-center rounded-full border border-black/10 hover:bg-black/5 active:scale-95 transition"
                  >
                    −
                  </button>

                  <input
                    aria-label="quantity"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "1", 10);
                      setQty(Number.isFinite(v) && v > 0 ? v : 1);
                    }}
                    className="h-10 w-14 text-center rounded-lg border border-black/15"
                  />

                  <button
                    aria-label="increase quantity"
                    onClick={() => setQty((q) => q + 1)}
                    className="h-10 w-10 grid place-items-center rounded-full border border-black/10 hover:bg-black/5 active:scale-95 transition"
                  >
                    ＋
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  className="inline-flex items-center justify-center rounded-full bg-[#c1a46f] text-white px-6 py-3 text-[15px] font-semibold shadow-sm hover:opacity-90 active:scale-[0.99] transition"
                >
                  加入購物車
                </button>
              </div>

              {/* 詳細介紹 */}
              {p.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-2">商品介紹</h2>
                  <div
                    className="prose prose-sm text-gray-800"
                    dangerouslySetInnerHTML={{ __html: p.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 推薦（照舊） */}
        <section className="mt-16">
          <h3 className="text-xl font-bold mb-4">其他推薦產品</h3>
          <RelatedCarousel
            currentId={p.id}
            categories={p.categories}
            currentFirstImage={firstImg}
            currentPrice={price}
          />
        </section>
      </main>
    </Layout>
  );
}

// 推薦元件
const RelatedCarousel = dynamic(
  () => import("@/components/HotProductsCarousel"),
  { ssr: false }
);

// ========= SSG + ISR =========
export async function getStaticPaths() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";
    const r = await fetch(`${base}/api/store/products?per_page=50`);
    if (!r.ok) throw new Error("list fetch failed");
    const list = await r.json();
    const paths = (Array.isArray(list) ? list : []).map((it) => ({
      params: { id: String(it.id) },
    }));
    return { paths, fallback: "blocking" };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  const id = params?.id;
  if (!id) return { notFound: true };

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";
    const url = `${base}/product/${id}`;
    const r = await fetch(`${base}/api/store/products/${id}`);
    const data = await r.json();
    if (!r.ok || !data?.id) return { notFound: true, revalidate: 60 };

    // --- Build SEO ---
    const p = data;
    const price = p?.prices?.price ? Number(p.prices.price) / 100 : 0;
    const imgs = imagesFromProduct(p);
    const firstImg = imgs?.[0]?.src || `${base}/images/placeholder.png`;
    const name = p?.name || "商品";
    const desc =
      stripHtml(p?.short_description) ||
      stripHtml(p?.description) ||
      `${name}，線上選購`;

    const siteName = "有香餐飲集團";
    const org = {
      name: siteName,
      url: base || "https://example.com",
      logo: `${base}/images/logo/有香餐飲集團-logo.png`,
    };

    const category =
      Array.isArray(p?.categories) && p.categories.length
        ? p.categories[0]
        : null;
    const categoryUrl = category
      ? `${base}/category/${category.slug || category.id}`
      : `${base}/products`;

    // Aggregate Rating（若有資料）
    const avg = Number(p?.average_rating || 0);
    const cnt = Number(p?.rating_count || 0);
    const aggregateRating =
      cnt > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: avg || 0,
            reviewCount: cnt,
          }
        : undefined;

    const stockMap = {
      instock: "https://schema.org/InStock",
      outofstock: "https://schema.org/OutOfStock",
      onbackorder: "https://schema.org/PreOrder",
    };
    const availability =
      stockMap[String(p?.stock_status || "instock").toLowerCase()] ||
      "https://schema.org/InStock";

    const seo = {
      title: `${name} | ${siteName}`,
      description: desc.slice(0, 160),
      canonical: url,
      og: {
        title: `${name} | ${siteName}`,
        description: desc.slice(0, 200),
        url,
        siteName,
        images: [{ url: firstImg }],
      },
      twitter: {
        title: `${name} | ${siteName}`,
        description: desc.slice(0, 200),
        image: firstImg,
      },
      ld: {
        website: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: base || "https://example.com",
          potentialAction: {
            "@type": "SearchAction",
            target: `${base}/search?q={query}`,
            "query-input": "required name=query",
          },
        },
        organization: {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: org.name,
          url: org.url,
          logo: {
            "@type": "ImageObject",
            url: org.logo,
          },
        },
        webpage: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name,
          url,
          description: desc,
          isPartOf: { "@id": org.url },
        },
        breadcrumb: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "首頁",
              item: base || "https://example.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: category ? category.name : "產品列表",
              item: categoryUrl,
            },
            { "@type": "ListItem", position: 3, name },
          ],
        },
        product: {
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          image: imgs.map((i) => i.src),
          description: desc,
          sku: String(p?.sku || p?.id || ""),
          category: category ? category.name : undefined,
          brand: p?.brand ? { "@type": "Brand", name: p.brand } : undefined,
          aggregateRating,
          offers: {
            "@type": "Offer",
            priceCurrency: "TWD",
            price: price || 0,
            availability,
            itemCondition: "https://schema.org/NewCondition",
            url,
          },
        },
      },
    };

    return {
      props: { product: data, seo },
      revalidate: 300, // 5 分鐘 ISR
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
