import React from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";

/* ========== 設定網域 (使用環境變數) ========== */
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
      ogImage: "/images/menu/DAV01683.webp",
    },
    ui: {
      home: "首頁",
      breadcrumb: "美味菜單",
    },
    pageTitle: "『餐廳菜單 & 線上商品一覽』",
    // LOGO 資料
    logos: [
      "/images/logo/有香-logo.png",
      "/images/logo/億點點-logo.png",
      "/images/logo/有香灶腳logo-white.png",
    ],
    items: [
      {
        id: "menu01",
        href: "/menu01",
        title: "【經典台灣料理】半世紀傳承，體驗台灣獨特的飲食文化",
        desc: [
          "從祖傳當歸羊肉鍋、台式火鍋，",
          "到經典熱炒與酥香炸物，",
          "再配上一杯台灣精釀啤酒，",
          "在有香一次品嚐最經典的台味料理。",
        ],
        img: "/images/menu/DAV01683.webp",
        logoIndex: 0,
      },
      {
        id: "menu02",
        href: "/menu02",
        title: "【療癒甜點與鹹食】細緻手作台味，難忘的美食饗宴",
        desc: [
          "匯聚台灣北、中、南的甜點與鹹食，",
          "從一口甜到一口鹹，",
          "在每一次入口之間，",
          "留下療癒又難忘的美食記憶。",
        ],
        img: "/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.webp",
        logoIndex: 1,
      },
      {
        id: "menu03",
        href: "/menu03",
        title: "【台味便利店】台灣好滋味，線上購物更方便",
        desc: [
          "從人氣零食到冷凍台味料理，",
          "一鍵下單，輕鬆享受，",
          "可選門店自取，或宅配到家。",
        ],
        img: "/images/menu/DSC07304.webp",
        logoIndex: 2,
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
    pageTitle: "『Restaurant Menus & Online Product Overview』",
    logos: [
      "/images/logo/有香-logo.png",
      "/images/logo/億點點-logo.png",
      "/images/logo/有香灶腳logo-white.png",
    ],
    items: [
      {
        id: "menu01",
        href: "/menu01",
        title:
          "【Classic Taiwanese Cuisine】Timeless flavours shaped by generations.",
        desc: [
          "Herbal lamb hot pot, classic stir-fries, crispy favourites,",
          "and Taiwanese craft beer — all the essentials of Taiwan, in one place.",
        ],
        img: "/images/menu/DAV01683.webp",
        logoIndex: 0,
      },
      {
        id: "menu02",
        href: "/menu02",
        title: "【Sweet & Savoury Delights】A Memorable Dining Experience",
        desc: [
          "Bringing together sweet and savoury delights from across Taiwan,",
          "from the north to the south.",
          "From one sweet bite to one savoury bite,",
          "each moment leaves a comforting and unforgettable food memory.",
        ],
        img: "/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.webp",
        logoIndex: 1,
      },
      {
        id: "menu03",
        href: "/menu03",
        title:
          "【Taiwanese Convenience Store】Authentic Flavours, Easy Online Shopping",
        desc: [
          "From popular snacks to classic Taiwanese frozen meals,",
          "order in just one click and enjoy with ease.Choose store pickup or home delivery.",
        ],
        img: "/images/menu/DSC07304.webp",
        logoIndex: 2,
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

  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;
  const pathWithoutLocale = currentPath.replace(`/${locale}`, "") || "/";
  const zhUrl = `${SITE_DOMAIN}${
    pathWithoutLocale === "/" ? "" : pathWithoutLocale
  }`;
  const enUrl = `${SITE_DOMAIN}/en${
    pathWithoutLocale === "/" ? "" : pathWithoutLocale
  }`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: t.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      description: Array.isArray(item.desc) ? item.desc.join(" ") : item.desc,
      url: `${SITE_DOMAIN}${item.href}`,
      image: `${SITE_DOMAIN}${item.img}`,
    })),
  };

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

  const jsonLdList = [itemListSchema, breadcrumbSchema];

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta
          name="twitter:image"
          content={`${SITE_DOMAIN}${t.meta.ogImage}`}
        />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1300px] px-4">
          {t.items.map((item, index) => {
            // 處理標題拆分：以 "】" 作為分隔點
            const titleParts = item.title.split("】");
            const mainTitle = titleParts[0] + "】";
            const subTitle = titleParts[1] || "";

            return (
              <Link
                key={index}
                href={item.href}
                title={item.title}
                className="bg-white group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 border border-stone-400 w-full min-h-[550px] sm:min-h-[480px] flex flex-col relative overflow-hidden"
              >
                {/* 圖片區塊容器 */}
                <div className="aspect-[5/3] w-full relative shrink-0 overflow-hidden">
                  {/* 背景圖片 */}
                  <Image
                    src={item.img}
                    fill
                    alt={item.title}
                    className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-100"
                    placeholder="empty"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Logo 覆蓋層 */}
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-10">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 transition-transform duration-500 group-hover:scale-105">
                      <Image
                        src={t.logos[item.logoIndex]}
                        alt={`${item.title} Logo`}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 文字區塊 */}
                <div className="description p-8 flex-1 flex flex-col bg-white relative z-20">
                  {/* 標題區塊 */}
                  <h2 className="font-bold text-[#3b2a1a] leading-snug">
                    <span className="block text-[22px] tracking-wide">
                      {mainTitle}
                    </span>
                    {subTitle && (
                      <span className="block text-[16px] italic font-normal text-[#7b5b33] mt-2 tracking-wider">
                        {subTitle}
                      </span>
                    )}
                  </h2>

                  {/* 描述區塊 (陣列斷行渲染) */}
                  <div className="text-[15px] text-[#5c4e42] leading-loose mt-5">
                    {Array.isArray(item.desc)
                      ? item.desc.map((line, idx) => (
                          <span key={idx} className="block">
                            {line}
                          </span>
                        ))
                      : item.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
