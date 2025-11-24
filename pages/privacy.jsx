// pages/privacy.js
import Head from "next/head";
import Layout from "./Layout";

export default function PrivacyPage() {
  // === TODO：按需修改 ===
  const site = "https://memorycorner8.com";
  const companyName = "Memory Corner / 有香餐飲集團"; // 如需更名可改
  const mail = "support@memorycorner8.com"; // 客服信箱
  const lastUpdated = "2025-10-02"; // 依台北時區（可手動改）
  // =====================

  return (
    <Layout>
      <Head>
        <title>隱私權政策 | Memory Corner</title>
        <meta
          name="description"
          content="Memory Corner（memorycorner8.com）的隱私權政策"
        />
        <link rel="canonical" href={`${site}/privacy`} />
        <meta property="og:title" content="隱私權政策 | Memory Corner" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${site}/privacy`} />
      </Head>
      <div className="bg-[#EDE5D6] px-4">
        {" "}
        <main className=" max-w-[1100px] px-5 mx-auto  py-[150px]">
          <h1>隱私權政策</h1>
          <p className="muted">
            最近更新：<time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>

          <section>
            <h2>一、我們如何使用資料</h2>
            <p>
              當您使用本網站（{site}
              ）的購物、會員或客服功能時，我們會於提供服務所必要的範圍內，使用您提供或因使用而產生的資料，包含完成訂單、出貨／票券發送、售後服務與客服回覆等。
            </p>
          </section>

          <section>
            <h2>二、我們蒐集的資料</h2>
            <ul>
              <li>
                您主動提供：姓名、電話、Email、地址、（如需發票）統編與抬頭等。
              </li>
              <li>
                使用產生：裝置與瀏覽資訊（例如瀏覽器版本、IP、頁面瀏覽紀錄）。
              </li>
              <li>
                交易相關：訂單內容、金額、付款與退款紀錄（不儲存完整卡號）。
              </li>
            </ul>
          </section>

          <section>
            <h2>三、Cookie</h2>
            <p>
              本網站使用必要
              Cookie（維持登入、購物車等功能），以及可能使用的統計或偏好
              Cookie。您可在瀏覽器調整 Cookie 設定，惟部分功能可能受影響。
            </p>
          </section>

          <section>
            <h2>四、第三方服務</h2>
            <p>
              為完成交易與提供服務，可能會使用金流、發票、分析或主機等第三方服務（例如
              NewebPay、LINE
              Pay、ezPay、網站分析工具）。這些服務將依其各自的政策處理資料。
            </p>
          </section>

          <section>
            <h2>五、安全與保存</h2>
            <p>
              我們採取合宜的技術與管理措施以保護資料安全，並依法令或履約需要保存必要資料；屆期後會刪除或去識別化處理。
            </p>
          </section>

          <section>
            <h2>六、您的權利與聯絡</h2>
            <p>
              您可來信要求查詢、閱覽、補正或刪除您的資料，或撤回同意（依法令或契約需保存者除外）。
              如有需求，請聯絡：<a href={`mailto:${mail}`}>{mail}</a>。
            </p>
          </section>

          <section>
            <h2>七、政策變更</h2>
            <p>
              本政策可能因服務或法規變動而調整，更新後將公布於本頁並標示更新日期。
            </p>
          </section>
        </main>
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 20px 100px;
        }
        h1 {
          font-size: 32px;
          line-height: 1.2;
          margin: 0 0 6px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .muted {
          color: #6b7280;
          margin-bottom: 22px;
          font-size: 14px;
        }
        h2 {
          font-size: 20px;
          margin: 28px 0 10px;
        }
        p,
        li {
          line-height: 1.85;
          font-size: 16px;
          color: #111827;
        }
        ul {
          padding-left: 20px;
        }
        a {
          color: #111827;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        a:hover {
          opacity: 0.85;
        }
      `}</style>
    </Layout>
  );
}
