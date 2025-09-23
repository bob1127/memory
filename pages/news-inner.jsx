"use client";
import Layout from "./Layout";
import Image from "next/image";
import Link from "next/link";

export default function RestaurantPromoArticle() {
  return (
    <Layout>
      {/* Hero 區塊 */}
      <section className="section-hero pt-20">
        <div className="max-w-[1920px] xl:w-[80%] md:w-[90%] w-full mx-auto">
          <div className="aspect-[16/8] relative overflow-hidden  shadow-lg">
            <Image
              src="https://kosugiyu-tonari.com/_next/image?url=%2Fphotos%2Ftop%2Fplace%2F2f.jpg&w=1920&q=75"
              alt="餐飲優惠活動 Hero 圖片"
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
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            秋季限定｜餐飲優惠活動
          </h1>
          <p className="text-gray-500">2025 年 9 月 22 日</p>
        </div>
      </section>

      {/* 文章內文 */}
      <section className="px-4 md:px-0 pb-16">
        <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-gray-800">
          <p>
            隨著秋意漸濃，Casa Zizo
            推出「秋季限定餐飲優惠活動」。主廚以當季新鮮食材為基礎，融合創意料理手法，設計出一系列精緻餐點，讓顧客在微涼的季節裡享受最溫暖的美味體驗。無論是家庭聚餐、商務宴請，或是朋友小聚，都能在這裡找到專屬的驚喜優惠。
          </p>

          <div className="relative aspect-[16/9] w-full overflow-hidden  shadow-md">
            <Image
              src="https://kosugiyu-tonari.com/_next/image?url=%2Fphotos%2Ftop%2Fplace%2F1f.jpg&w=1920&q=75"
              alt="餐飲優惠活動現場"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">活動亮點</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>秋季限定套餐全面 85 折優惠</li>
            <li>兩人同行贈送精緻甜點一份</li>
            <li>線上訂位加碼享 95 折優惠</li>
            <li>會員再享專屬紅酒升級服務</li>
          </ul>

          <div className="relative aspect-[16/9] w-full overflow-hidden  shadow-md my-8">
            <Image
              src="https://patisserie-emera.jp/wp-content/themes/emera/assets/images/top/insideshop-img.jpg"
              alt="特色料理"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">特色餐點介紹</h2>
          <p>
            本次優惠餐點涵蓋前菜、主菜與甜點。推薦的「南瓜濃湯」以在地小農南瓜熬製，香醇濃郁；「香煎鴨胸佐莓果醬」則將肉質鮮嫩的鴨胸搭配酸甜果醬，帶來層次豐富的口感；最後，以手工「栗子蒙布朗」收尾，為整套餐點畫下完美句點。
          </p>

          <div className="relative aspect-[16/9] w-full overflow-hidden  shadow-md my-8">
            <Image
              src="https://patisserie-emera.jp/wp-content/themes/emera/assets/images/top/insideshop-img.jpg"
              alt="特色料理"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-2xl font-semibold mt-10 mb-4">顧客回饋</h2>
          <p>
            過去參加活動的顧客一致好評，不僅對食材新鮮度給予高度肯定，也讚賞餐廳溫馨的氛圍與專業服務。許多客人表示，Casa
            Zizo 已成為他們聚會與慶祝的重要選擇。
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">活動日期</h2>
          <p>
            活動期間為 <strong>即日起至 2025 年 10 月 31 日</strong>
            。優惠名額有限，建議提前訂位以免錯失良機。
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">立即預訂</h2>
          <p>
            想要體驗專屬於秋季的美食饗宴嗎？立即透過官方網站預約，或聯繫餐廳了解更多詳情。我們誠摯邀請您蒞臨
            Casa Zizo，享受一段難忘的秋季時光。
          </p>

          <div className="text-center mt-10">
            <Link
              href="https://www.casazizo.com/reservation"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition"
            >
              前往訂位
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
