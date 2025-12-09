// pages/privacy.js
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "./Layout";

/* =================================================================
   1. 隱私權政策多語言內容
   ================================================================= */
const PRIVACY_CONTENT = {
  "zh-TW": {
    meta_title: "隱私權政策 | Memory Corner",
    meta_desc: "Memory Corner（memorycorner8.com）的隱私權政策",

    h1: "隱私權政策",
    last_updated: "最近更新：",

    sections: [
      {
        title: "一、我們如何使用資料",
        content: (site) =>
          `當您使用本網站（${site}）的購物、會員或客服功能時，我們會於提供服務所必要的範圍內，使用您提供或因使用而產生的資料，包含完成訂單、出貨／票券發送、售後服務與客服回覆等。`,
      },
      {
        title: "二、我們蒐集的資料",
        list: [
          "您主動提供：姓名、電話、Email、地址、（如需發票）統編與抬頭等。",
          "使用產生：裝置與瀏覽資訊（例如瀏覽器版本、IP、頁面瀏覽紀錄）。",
          "交易相關：訂單內容、金額、付款與退款紀錄（不儲存完整卡號）。",
        ],
      },
      {
        title: "三、Cookie",
        content: () =>
          "本網站使用必要 Cookie（維持登入、購物車等功能），以及可能使用的統計或偏好 Cookie。您可在瀏覽器調整 Cookie 設定，惟部分功能可能受影響。",
      },
      {
        title: "四、第三方服務",
        content: () =>
          "為完成交易與提供服務，可能會使用金流、發票、分析或主機等第三方服務（例如 NewebPay、LINE Pay、ezPay、網站分析工具）。這些服務將依其各自的政策處理資料。",
      },
      {
        title: "五、安全與保存",
        content: () =>
          "我們採取合宜的技術與管理措施以保護資料安全，並依法令或履約需要保存必要資料；屆期後會刪除或去識別化處理。",
      },
      {
        title: "六、您的權利與聯絡",
        // 這裡回傳前段文字，後段會接上 Email 連結
        content_prefix:
          "您可來信要求查詢、閱覽、補正或刪除您的資料，或撤回同意（依法令或契約需保存者除外）。如有需求，請聯絡：",
      },
      {
        title: "七、政策變更",
        content: () =>
          "本政策可能因服務或法規變動而調整，更新後將公布於本頁並標示更新日期。",
      },
    ],
  },
  en: {
    meta_title: "Privacy Policy | Memory Corner",
    meta_desc: "Privacy Policy for Memory Corner (memorycorner8.com)",

    h1: "Privacy Policy",
    last_updated: "Last Updated: ",

    sections: [
      {
        title: "1. How We Use Data",
        content: (site) =>
          `When you use the shopping, membership, or customer service functions of this website (${site}), we use the data provided by you or generated during use within the scope necessary to provide services, including order fulfillment, shipping/ticketing, after-sales service, and customer support.`,
      },
      {
        title: "2. Information We Collect",
        list: [
          "Active Provision: Name, phone number, Email, address, invoice details, etc.",
          "Usage Data: Device and browsing information (e.g., browser version, IP address, page view logs).",
          "Transaction Related: Order content, amount, payment, and refund records (we do not store full credit card numbers).",
        ],
      },
      {
        title: "3. Cookies",
        content: () =>
          "This website uses necessary Cookies (to maintain login, shopping cart functions, etc.) and potential analytics or preference Cookies. You can adjust Cookie settings in your browser, though some functions may be affected.",
      },
      {
        title: "4. Third-Party Services",
        content: () =>
          "To complete transactions and provide services, we may use third-party services for payments, invoicing, analytics, or hosting (e.g., NewebPay, LINE Pay, ezPay, web analytics tools). These services handle data according to their own policies.",
      },
      {
        title: "5. Security and Retention",
        content: () =>
          "We adopt appropriate technical and managerial measures to protect data security and retain necessary data as required by laws or contracts. Data will be deleted or de-identified upon expiration.",
      },
      {
        title: "6. Your Rights and Contact",
        content_prefix:
          "You may request to access, correct, or delete your data, or withdraw consent (except where retention is required by law or contract). For requests, please contact: ",
      },
      {
        title: "7. Policy Changes",
        content: () =>
          "This policy may be adjusted due to service or regulatory changes. Updates will be published on this page with the revision date.",
      },
    ],
  },
};

export default function PrivacyPage() {
  const { locale } = useRouter();
  const t = PRIVACY_CONTENT[locale] || PRIVACY_CONTENT["zh-TW"];

  // === 設定參數 ===
  const site = "https://memorycorner8.com";
  const mail = "support@memorycorner8.com";
  const lastUpdated = "2025-10-02";
  // =====================

  return (
    <Layout>
      <Head>
        <title>{t.meta_title}</title>
        <meta name="description" content={t.meta_desc} />
        <link rel="canonical" href={`${site}/privacy`} />
        <meta property="og:title" content={t.meta_title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${site}/privacy`} />
      </Head>

      <div className="bg-[#EDE5D6] px-4">
        <main className="max-w-[1100px] px-5 mx-auto py-[150px]">
          <h1>{t.h1}</h1>
          <p className="muted">
            {t.last_updated} <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>

          {/* 第一段：使用資料 (帶入 site 變數) */}
          <section>
            <h2>{t.sections[0].title}</h2>
            <p>{t.sections[0].content(site)}</p>
          </section>

          {/* 第二段：蒐集資料 (列表) */}
          <section>
            <h2>{t.sections[1].title}</h2>
            <ul>
              {t.sections[1].list.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* 第三段：Cookie */}
          <section>
            <h2>{t.sections[2].title}</h2>
            <p>{t.sections[2].content()}</p>
          </section>

          {/* 第四段：第三方 */}
          <section>
            <h2>{t.sections[3].title}</h2>
            <p>{t.sections[3].content()}</p>
          </section>

          {/* 第五段：安全 */}
          <section>
            <h2>{t.sections[4].title}</h2>
            <p>{t.sections[4].content()}</p>
          </section>

          {/* 第六段：聯絡 (帶入 Email 連結) */}
          <section>
            <h2>{t.sections[5].title}</h2>
            <p>
              {t.sections[5].content_prefix}
              <a href={`mailto:${mail}`}>{mail}</a>。
            </p>
          </section>

          {/* 第七段：變更 */}
          <section>
            <h2>{t.sections[6].title}</h2>
            <p>{t.sections[6].content()}</p>
          </section>
        </main>
      </div>

      <style jsx>{`
        h1 {
          font-size: 32px;
          line-height: 1.2;
          margin: 0 0 6px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #111827;
        }
        .muted {
          color: #6b7280;
          margin-bottom: 22px;
          font-size: 14px;
        }
        h2 {
          font-size: 20px;
          margin: 28px 0 10px;
          font-weight: 700;
          color: #111827;
        }
        p,
        li {
          line-height: 1.85;
          font-size: 16px;
          color: #374151; /* 稍微深一點的灰色，閱讀更舒適 */
        }
        ul {
          padding-left: 20px;
          list-style-type: disc;
        }
        li {
          margin-bottom: 6px;
        }
        a {
          color: #111827;
          text-decoration: underline;
          text-underline-offset: 2px;
          font-weight: 500;
        }
        a:hover {
          opacity: 0.75;
        }
      `}</style>
    </Layout>
  );
}
