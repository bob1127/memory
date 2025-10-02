"use client";
import Layout from "./Layout";
import Image from "next/image";

export default function RestaurantPromoArticle() {
  return (
    <Layout>
      <div className="bg-[#eddbc1]">
        {" "}
        <section className="section-hero pt-20">
          <div className="max-w-[1920px] xl:w-[60%] mt-20 md:w-[70%] w-full mx-auto">
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
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              【已額滿】可不可 X LINE Pay 領券限折 $15
            </h1>
            <p className="text-gray-500">
              活動日期：2022/10/7 - 2022/10/31（已額滿）
            </p>
          </div>
        </section>
        {/* 文章內文 */}
        <section className="px-4 md:px-0 pb-16">
          <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-gray-800">
            <h2 className="text-xl font-semibold">活動內容</h2>
            <p>
              使用 LINE Pay 於合作指定「可不可熟成紅茶」門市單筆消費折抵 $15！
            </p>
            <p>
              使用 LINE Pay 結帳並綁定 LINE Pay App
              即可於結帳時享有優惠。於可不可熟成紅茶門市消費，掃描 QR code
              或點擊活動頁領券後使用，即可折抵 $15，優惠數量有限，發完為止。
            </p>

            <h2 className="text-xl font-semibold mt-8">注意事項</h2>
            <ul className="list-disc pl-5 space-y-3">
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
          </div>
        </section>
      </div>
      {/* Hero 區塊 */}
    </Layout>
  );
}
