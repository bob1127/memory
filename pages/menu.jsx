import React from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "./Layout"; // 請確認路徑

/* ========== 1. i18n 資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "美味菜單 | 有香 Memory Corner",
      description:
        "探索有香 Memory Corner 的經典美味。從祖傳當歸羊肉鍋、各式台式手路菜到懷舊甜點與零食，帶您品嚐最道地的台灣味。",
    },
    pageTitle: "菜單一覽",
    items: [
      {
        id: "menu01",
        href: "/menu01", // 請確認您的路由路徑
        title: "【經典台菜】傳承三代手路菜， 體驗台灣特有的飲食文化",
        desc: "正港的台灣料理―祖傳當歸羊肉鍋、小火鍋、台式簡餐、熱炒料理、炸物小吃和台灣啤酒於有香呈現给您",
        img: "/images/menu/DAV01683.jpg",
      },
      {
        id: "menu02",
        href: "/menu02",
        title: "【甜點鹹食】手工製作、品嘗的 到最地道的懷舊巷弄小吃",
        desc: "匯聚台灣北中南美食，提供古早味甜品及經典小吃，無法抗拒的好滋味，等您來細細品嚐",
        img: "/images/menu/DSC07304.jpg",
      },
      {
        id: "menu03",
        href: "/menu01", // 這裡重複導向 menu01，若有 menu03 請自行修改
        title: "【台灣雜貨店】回味純真時光、 溫習童年小確幸",
        desc: "販售與門店口味一致冷凍料理包，讓在家也能輕鬆品嚐美食。除此之外，也能夠買到古早味零食糖果和懷舊小物",
        img: "/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.png",
      },
    ],
  },
  en: {
    meta: {
      title: "Our Menu | Memory Corner",
      description:
        "Explore authentic Taiwanese cuisine at Memory Corner. From traditional herbal lamb hot pot to nostalgic desserts and snacks.",
    },
    pageTitle: "Our Menu",
    items: [
      {
        id: "menu01",
        href: "/menu01",
        title: "【Classic Cuisine】Heritage Recipes, Unique Taiwanese Culture",
        desc: "Authentic Taiwanese dishes - Ancestral Angelica Lamb Hot Pot, mini hot pots, set meals, stir-fries, fried snacks, and Taiwan Beer.",
        img: "/images/menu/DAV01683.jpg",
      },
      {
        id: "menu02",
        href: "/menu02",
        title: "【Desserts & Savory】Handmade, Authentic Nostalgic Street Food",
        desc: "Gathering delicacies from North to South Taiwan, offering traditional desserts and classic snacks. Irresistible flavors waiting for you.",
        img: "/images/menu/DSC07304.jpg",
      },
      {
        id: "menu03",
        href: "/menu01",
        title: "【Taiwan Grocery】Relive Innocent Times, Childhood Happiness",
        desc: "Selling frozen meal packs with the same taste as in-store, allowing you to enjoy gourmet food at home. Also offering vintage snacks and items.",
        img: "/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.png",
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
  // 結構化資料：ItemList
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: t.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      description: item.desc,
      url: `https://www.memorycorner8.com${item.href}`, // 請替換正確網域
      image: `https://www.memorycorner8.com${item.img}`,
    })),
  };

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="min-h-screen py-20 bg-[#ede5d6] flex flex-col justify-center items-center">
        <div className="title mb-10">
          <h1 className="text-[34px] font-bold text-[#3b2a1a]">
            {t.pageTitle}
          </h1>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-5">
          {t.items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="bg-white group hover:scale-105 hover:shadow-2xl transition-all duration-500 border border-stone-400 w-[400px] flex flex-col h-full"
            >
              <div className="aspect-[16/9] overflow-hidden relative w-full">
                <Image
                  src={item.img}
                  fill
                  alt={item.title}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  placeholder="empty"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="description p-8 flex-1 flex flex-col">
                <h2 className="text-[22px] md:text-[26px] font-bold mb-4 text-[#3b2a1a] leading-snug">
                  {item.title}
                </h2>
                <p className="text-[15px] md:text-[16px] text-[#5c4e42] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
