import React from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";

/* ========== 設定網域 (使用環境變數) ========== */
// 優先使用環境變數，若無則 fallback (請修改為您的實際正式網域)
const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* ========== 1. i18n 資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "美味菜單 | 有香 Memory Corner",
      description:
        "探索有香 Memory Corner 的經典美味。從祖傳當歸羊肉鍋、各式台式手路菜到懷舊甜點與零食，帶您品嚐最道地的台灣味。",
      keywords:
        "有香菜單, 台灣料理, 當歸羊肉鍋, 溫哥華台菜, 懷舊零食, 台灣小吃",
      ogImage: "/images/menu/DAV01683.webp", // 建議設定一張代表性的分享圖
    },
    ui: {
      home: "首頁",
      breadcrumb: "美味菜單",
    },
    pageTitle: "菜單一覽",
    items: [
      {
        id: "menu01",
        href: "/menu01",
        title: "【經典台菜】傳承三代手路菜， 體驗台灣特有的飲食文化",
        desc: "正港的台灣料理―祖傳當歸羊肉鍋、小火鍋、台式簡餐、熱炒料理、炸物小吃和台灣啤酒於有香呈現给您",
        img: "/images/menu/DAV01683.webp",
      },
      {
        id: "menu02",
        href: "/menu02",
        title: "【甜點鹹食】手工製作、品嘗的 到最地道的懷舊巷弄小吃",
        desc: "匯聚台灣北中南美食，提供古早味甜品及經典小吃，無法抗拒的好滋味，等您來細細品嚐",
        img: "/images/menu/DSC07304.webp",
      },
      {
        id: "menu03",
        href: "/menu03",
        title: "【台灣雜貨店】回味純真時光、 溫習童年小確幸",
        desc: "販售與門店口味一致冷凍料理包，讓在家也能輕鬆品嚐美食。除此之外，也能夠買到古早味零食糖果和懷舊小物",
        img: "/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.webp",
      },
    ],
  },
  en: {
    meta: {
      title: "Our Menu | Memory Corner",
      description:
        "Explore authentic Taiwanese cuisine at Memory Corner. From traditional herbal lamb hot pot to nostalgic desserts and snacks.",
      keywords:
        "Memory Corner Menu, Taiwanese Cuisine, Lamb Hot Pot, Vancouver Taiwanese Food, Nostalgic Snacks",
      ogImage: "/images/menu/DAV01683.webp",
    },
    ui: {
      home: "Home",
      breadcrumb: "Menu",
    },
    pageTitle: "Our Menu",
    items: [
      {
        id: "menu01",
        href: "/menu01",
        title: "【Classic Cuisine】Heritage Recipes, Unique Taiwanese Culture",
        desc: "Authentic Taiwanese dishes - Ancestral Angelica Lamb Hot Pot, mini hot pots, set meals, stir-fries, fried snacks, and Taiwan Beer.",
        img: "/images/menu/DAV01683.webp",
      },
      {
        id: "menu02",
        href: "/menu02",
        title: "【Desserts & Savory】Handmade, Authentic Nostalgic Street Food",
        desc: "Gathering delicacies from North to South Taiwan, offering traditional desserts and classic snacks. Irresistible flavors waiting for you.",
        img: "/images/menu/DSC07304.webp",
      },
      {
        id: "menu03",
        href: "/menu03",
        title: "【Taiwan Grocery】Relive Innocent Times, Childhood Happiness",
        desc: "Selling frozen meal packs with the same taste as in-store, allowing you to enjoy gourmet food at home. Also offering vintage snacks and items.",
        img: "/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.webp",
      },
    ],
  },
};

/* ========== 2. SSG 設定 ========== */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: { t, locale },
  };
}

/* ========== 3. 頁面組件 ========== */
export default function MenuPage({ t, locale }) {
  const router = useRouter();

  // URL 處理
  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;

  // Hreflang 連結 (多語系 SEO 關鍵)
  // 假設路徑結構為 /menu (中文) 與 /en/menu (英文)
  const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
  // 這裡假設您的路由名稱是 "/menu"，如果實際檔案名不同請調整
  const zhUrl = `${SITE_DOMAIN}${
    pathWithoutLocale === "/" ? "" : pathWithoutLocale
  }`;
  const enUrl = `${SITE_DOMAIN}/en${
    pathWithoutLocale === "/" ? "" : pathWithoutLocale
  }`;

  /* --- 結構化資料 (JSON-LD) --- */

  // 1. ItemList Schema (列表頁專用)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: t.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      description: item.desc,
      url: `${SITE_DOMAIN}${item.href}`,
      image: `${SITE_DOMAIN}${item.img}`,
    })),
  };

  // 2. Breadcrumb Schema (麵包屑)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.ui.home,
        item: `${SITE_DOMAIN}/${locale === "en" ? "en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.ui.breadcrumb,
        item: canonicalUrl,
      },
    ],
  };

  // 合併 Schema
  const jsonLdList = [itemListSchema, breadcrumbSchema];

  return (
    <Layout>
      <Head>
        {/* 基本 Meta */}
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Hreflang Tags */}
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Memory Corner" />
        <meta property="og:image" content={`${SITE_DOMAIN}${t.meta.ogImage}`} />
        <meta
          property="og:locale"
          content={locale === "zh-TW" ? "zh_TW" : "en_US"}
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta
          name="twitter:image"
          content={`${SITE_DOMAIN}${t.meta.ogImage}`}
        />

        {/* JSON-LD 注入 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }}
        />
      </Head>

      <main className="min-h-screen py-20 bg-[#ede5d6] flex flex-col justify-center items-center">
        <div className="title mb-10">
          <h1 className="text-[34px] font-bold text-[#3b2a1a]">
            {t.pageTitle}
          </h1>
        </div>

        {/* Grid 佈局容器 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1300px] px-4">
          {t.items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              title={item.title} // 增加 title 屬性輔助 SEO
              className="bg-white group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border border-stone-400 w-full h-[540px] flex flex-col"
            >
              {/* 圖片區塊 */}
              <div className="overflow-hidden aspect-[5/3] w-full relative shrink-0">
                <Image
                  src={item.img}
                  fill
                  alt={item.title}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  placeholder="empty"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // 優化圖片載入尺寸
                />
              </div>

              {/* 文字區塊 */}
              <div className="description p-8 flex-1 flex flex-col overflow-hidden">
                <h2 className="text-[22px] font-bold mb-4 text-[#3b2a1a] leading-snug line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-[15px] text-[#5c4e42] leading-relaxed line-clamp-4">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
