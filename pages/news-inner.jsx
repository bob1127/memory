"use client";
import { useRouter } from "next/router";
import Link from "next/link"; // ✅ 引入 Link
import Layout from "./Layout";
import Image from "next/image";

/* =================================================================
   1. 寫死的中英文文章內容資料庫
   ================================================================= */
const ARTICLE_DATA = {
  "zh-TW": {
    title: "【已額滿】可不可 X LINE Pay 領券限折 $15",
    date: "活動日期：2022/10/7 - 2022/10/31（已額滿）",

    // UI 文字
    ui_home: "首頁",
    ui_news: "品牌動態",

    content_html: `
      <h2 class="text-xl font-semibold mb-3">活動內容</h2>
      <p class="mb-4">
        使用 LINE Pay 於合作指定「可不可熟成紅茶」門市單筆消費折抵 $15！
      </p>
      <p class="mb-8">
        使用 LINE Pay 結帳並綁定 LINE Pay App
        即可於結帳時享有優惠。於可不可熟成紅茶門市消費，掃描 QR code
        或點擊活動頁領券後使用，即可折抵 $15，優惠數量有限，發完為止。
      </p>

      <h2 class="text-xl font-semibold mb-3 mt-8">注意事項</h2>
      <ul class="list-disc pl-5 space-y-3">
        <li>每位 LINE Pay 使用者限領一次。</li>
        <li>
          活動優惠不得轉讓、兌換現金或與其他優惠併用，若交易取消則視同放棄使用。
        </li>
        <li>
          優惠限量發送，數量有限，額滿為止。實際優惠以 LINE Pay
          活動頁公告及門市結帳頁面為準。
        </li>
        <li>
          詳細使用規範與說明請參考 LINE Pay
          App「我的優惠券」中載明之內容，若有爭議以 LINE Pay
          官方公告為準。
        </li>
      </ul>
    `,
  },
  en: {
    title: "[Full] Kebuke X LINE Pay Coupon $15 Off",
    date: "Date: 2022/10/7 - 2022/10/31 (Full)",

    // UI Words
    ui_home: "Home",
    ui_news: "News",

    content_html: `
      <h2 class="text-xl font-semibold mb-3">Event Details</h2>
      <p class="mb-4">
        Use LINE Pay at designated "Kebuke" stores to get $15 off on a single transaction!
      </p>
      <p class="mb-8">
        Checkout with LINE Pay and bind the LINE Pay App to enjoy the discount. 
        Scan the QR code or click the coupon on the event page to use it for a $15 deduction. 
        Limited quantity, available while supplies last.
      </p>

      <h2 class="text-xl font-semibold mb-3 mt-8">Terms & Conditions</h2>
      <ul class="list-disc pl-5 space-y-3">
        <li>Limit one redemption per LINE Pay user.</li>
        <li>
          The offer cannot be transferred, exchanged for cash, or used with other promotions. 
          If the transaction is cancelled, the offer is forfeited.
        </li>
        <li>
          Limited quantity available. Actual offers are subject to LINE Pay announcements 
          and store checkout pages.
        </li>
        <li>
          For detailed usage rules, please refer to "My Coupons" in the LINE Pay App. 
          In case of dispute, LINE Pay official announcements shall prevail.
        </li>
      </ul>
    `,
  },
};

export default function RestaurantPromoArticle() {
  const { locale } = useRouter();

  // 根據當前語系取得對應資料
  const t = ARTICLE_DATA[locale] || ARTICLE_DATA["zh-TW"];

  return (
    <Layout>
      <div className="bg-[#eddbc1] px-5 min-h-screen">
        {/* ✅ 新增：麵包屑導覽 (Breadcrumbs) */}
        {/* 調整 pt-24 以避開固定導覽列，並對齊下方內容 */}
        <div className="max-w-[800px] xl:w-[60%] md:w-[70%] w-full mx-auto pt-28 pb-4">
          <nav className="flex items-center text-sm text-gray-600 font-medium">
            <Link
              href="/"
              className="hover:text-black text-[18px] transition-colors"
            >
              {t.ui_home}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link
              href="/news"
              className="hover:text-black  text-[18px] transition-colors"
            >
              {t.ui_news}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 truncate max-w-[200px]  text-[18px] md:max-w-none">
              {t.title}
            </span>
          </nav>
        </div>

        {/* Hero 區塊 (上方已加入麵包屑，這裡間距稍微調整) */}
        <section className="section-hero">
          <div className="max-w-[800px] max-h-[90vh] xl:w-[60%] md:w-[70%] w-full mx-auto">
            <div className="aspect-[16/16] relative overflow-hidden shadow-lg">
              <Image
                src="/images/news-01.jpg"
                alt="活動 Hero 圖片"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* 文章標題 + 日期 */}
        <section className="py-10 px-4 md:px-0">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">
              {t.title}
            </h1>
            <p className="text-gray-600 font-medium">{t.date}</p>
          </div>
        </section>

        {/* 文章內文 */}
        <section className="px-4 md:px-0 pb-16">
          <div
            className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: t.content_html }}
          />
        </section>
      </div>
    </Layout>
  );
}
