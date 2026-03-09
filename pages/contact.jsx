import { useState } from "react";
import Head from "next/head";
import Layout from "./Layout"; // 請確認 Layout 路徑

// 🟢 設定正式上線網址 (解決 Google Search Console 收錄問題)
const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.memorycorner8.com";
const SITE_URL = SITE_URL_RAW.replace(/\/+$/, "");

/* ========== 1. i18n 資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "聯絡我們 | Memory Corner 有香餐飲集團",
      description:
        "有任何問題或建議？歡迎透過表單聯絡 Memory Corner 有香餐飲集團，我們將盡快回覆您。提供餐飲體驗、線上訂購、商業合作等諮詢服務。",
    },
    title: "聯絡我們 (Contact Us)",
    form: {
      name: "姓名 (Name)",
      name_ph: "請輸入您的姓名",
      email: "電子郵件 (Email Address)",
      email_ph: "example@email.com",
      email_hint: "我們將透過此信箱回覆您。",
      phone: "聯絡電話 (Phone Number)",
      phone_ph: "請輸入您的聯絡電話（可略過）",
      reason: "聯絡主題 (Reason for Contact)",
      reason_default: "請選擇聯絡原因",
      store: "相關分店 (Store Location)",
      store_default: "請選擇分店（可略過）",
      date: "消費日期 (Date of Visit)",
      date_hint: "幫助我們追溯當天情況。",
      message: "訊息內容 (Message)",
      message_ph: "請寫下您的需求或想與我們分享的內容。",
      attachment: "上傳附件 (Attachment)",
      attachment_hint: "例如：收據、照片（可略過）。",
      submit: "送出訊息",
      submitting: "送出中...",
      reply_time: "我們會盡快回覆您，通常會在 1–3 個工作天內與您聯繫。",
      note: "* 為必填欄位",
      optional: "（選填）",
    },
    options: {
      reasons: [
        { value: "Dining Experience", label: "餐廳用餐相關" },
        { value: "Convenience Store", label: "台味便利店購物相關" },
        {
          value: "Online Order (Restaurant Pickup)",
          label: "線上訂購 (餐廳點餐自取)",
        },
        {
          value: "Online Order (Online Shopping)",
          label: "線上訂購 (線上購物)",
        },
        { value: "Online Order (Beer Order)", label: "線上訂購 (啤酒訂購)" },
        { value: "General Suggestion & Feedback", label: "一般建議與回饋" },
        {
          value: "Business Cooperation / Media Inquiry",
          label: "商業合作／媒體洽詢",
        },
        { value: "Other", label: "其他" },
      ],
      stores: [
        {
          value: "Memory Corner Richmond",
          label: "有香 Memory Corner (Richmond)",
        },
        {
          value: "Sweet Memory Richmond",
          label: "憶點點 Sweet Memory (Richmond)",
        },
        {
          value: "Old Memory Kitchen Richmond",
          label: "有香ㄟ灶腳 Old Memory Kitchen (Richmond)",
        },
        {
          value: "Memory Corner Coquitlam",
          label: "有香 Memory Corner (Coquitlam)",
        },
      ],
    },
    messages: {
      error_store: "若為餐廳用餐相關，請選擇相關分店。",
      error_date: "若為餐廳用餐相關，請填寫消費日期。",
      success: "表單已送出，我們會在 2–3 個工作日內回覆您，感謝！",
      fail: "送出失敗，請稍後再試，或改用其他聯絡方式，謝謝。",
    },
  },
  en: {
    meta: {
      title: "Contact Us | Memory Corner Group",
      description:
        "Have questions or suggestions? Contact Memory Dining Group through this form for dining experience, online orders, or business inquiries.",
    },
    title: "Contact Us",
    form: {
      name: "Name",
      name_ph: "Enter your name",
      email: "Email Address",
      email_ph: "example@email.com",
      email_hint: "We will reply via this email.",
      phone: "Phone Number",
      phone_ph: "Enter your phone number (Optional)",
      reason: "Reason for Contact",
      reason_default: "Please select a reason for contacting us.",
      store: "Store Location",
      store_default: "Select a store (Optional)",
      date: "Date of Visit",
      date_hint: "Helps us trace the incident.",
      message: "Message",
      message_ph: "Please share the details of your inquiry or message here.",
      attachment: "Attachment",
      attachment_hint: "E.g., Receipt, Photo (Optional).",
      submit: "Submit Inquiry",
      submitting: "Submitting...",
      reply_time: "We’ll get back to you within 1–3 business days.",
      note: "* Required fields",
      optional: "(Optional)",
    },
    options: {
      reasons: [
        { value: "Dining Experience", label: "Dining Experience" },
        {
          value: "Convenience Store",
          label: "Taiwanese Convenience Store Shopping",
        },
        {
          value: "Online Order (Restaurant Pickup)",
          label: "Online Order (Restaurant Pickup)",
        },
        {
          value: "Online Order (Online Shopping)",
          label: "Online Order (Online Shopping)",
        },
        {
          value: "Online Order (Beer Order)",
          label: "Online Order (Beer Order)",
        },
        {
          value: "General Suggestion & Feedback",
          label: "General Suggestions & Feedback",
        },
        {
          value: "Business Cooperation / Media Inquiry",
          label: "Business Cooperation / Media Inquiry",
        },
        { value: "Other", label: "Other" },
      ],
      stores: [
        { value: "Memory Corner Richmond", label: "Memory Corner (Richmond)" },
        { value: "Sweet Memory Richmond", label: "Sweet Memory (Richmond)" },
        {
          value: "Old Memory Kitchen Richmond",
          label: "Old Memory Kitchen (Richmond)",
        },
        {
          value: "Memory Corner Coquitlam",
          label: "Memory Corner (Coquitlam)",
        },
      ],
    },
    messages: {
      error_store:
        "Please select a store location for dining experience inquiries.",
      error_date:
        "Please specify the date of visit for dining experience inquiries.",
      success:
        "Form submitted! We will get back to you within 2-3 business days. Thank you!",
      fail: "Submission failed. Please try again later or contact us via other methods.",
    },
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
export default function ContactPage({ t, locale }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [reason, setReason] = useState("");
  const isEn = locale === "en";

  // 判斷是否與餐廳用餐體驗相關，藉此要求提供分店與日期資訊
  const isStoreVisit = reason === "Dining Experience";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const form = e.currentTarget;

    // 額外驗證：如果是餐廳用餐相關，分店與日期必填
    if (isStoreVisit) {
      if (!form.storeLocation.value) {
        setStatus({
          type: "error",
          message: t.messages.error_store,
        });
        setLoading(false);
        return;
      }
      if (!form.visitDate.value) {
        setStatus({
          type: "error",
          message: t.messages.error_date,
        });
        setLoading(false);
        return;
      }
    }

    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message: t.messages.success,
        });
        form.reset();
        setReason("");
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: t.messages.fail,
      });
    } finally {
      setLoading(false);
    }
  }

  /* =================================================================
     ⭐ SEO 與結構化資料 (Structured Data)
     ================================================================= */
  const currentUrl = `${SITE_URL}${isEn ? "/en" : ""}/contact`;
  const hrefLangZh = `${SITE_URL}/contact`;
  const hrefLangEn = `${SITE_URL}/en/contact`;
  const ogImageAbs = `${SITE_URL}/images/index/about/3-1.webp`;

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t.meta.title,
    description: t.meta.description,
    url: currentUrl,
    mainEntity: {
      "@type": "Organization",
      name: "Memory Corner Group",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo/有香餐飲集團-logo.png`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "info@memorycorner8.com", // 請確認您的聯絡信箱
          contactType: "customer service",
          areaServed: "CA",
          availableLanguage: ["English", "Chinese"],
        },
      ],
    },
  };

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
        name: isEn ? "Contact Us" : "聯絡我們",
        item: currentUrl,
      },
    ],
  };

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />

        {/* Canonical 與多語系設定 */}
        <link rel="canonical" href={currentUrl} />
        <link rel="alternate" hrefLang="x-default" href={hrefLangZh} />
        <link rel="alternate" hrefLang="zh-Hant" href={hrefLangZh} />
        <link rel="alternate" hrefLang="en" href={hrefLangEn} />

        {/* Open Graph (FB/IG) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:image" content={ogImageAbs} />
        <meta property="og:site_name" content="Memory Corner Group" />
        <meta property="og:locale" content={isEn ? "en_CA" : "zh_TW"} />
        <meta property="og:url" content={currentUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta name="twitter:image" content={ogImageAbs} />

        {/* JSON-LD 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(contactPageSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div className="page bg-[#EDE5D6]">
        <main className="container">
          <section className="card mt-20">
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl font-bold mb-4 md:text-2xl text-[#3b2a1a]">
                {t.title}
              </h1>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              {/* 欄位1：姓名 */}
              <div className="field">
                <label className="label">
                  {t.form.name} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input"
                  placeholder={t.form.name_ph}
                />
              </div>

              {/* 欄位2：電子郵件 */}
              <div className="field">
                <label className="label">
                  {t.form.email} <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input"
                  placeholder={t.form.email_ph}
                />
                <p className="hint">{t.form.email_hint}</p>
              </div>

              {/* 欄位3：聯絡電話 */}
              <div className="field">
                <label className="label">
                  {t.form.phone}
                  <span className="optional">{t.form.optional}</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  placeholder={t.form.phone_ph}
                />
              </div>

              {/* 欄位4：聯絡主題 */}
              <div className="field">
                <label className="label">
                  {t.form.reason} <span className="required">*</span>
                </label>
                <select
                  name="reason"
                  required
                  className="input select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">{t.form.reason_default}</option>
                  {t.options.reasons.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位5：相關分店 */}
              <div className="field">
                <label className="label">
                  {t.form.store}
                  {isStoreVisit ? (
                    <span className="required">*</span>
                  ) : (
                    <span className="optional">{t.form.optional}</span>
                  )}
                </label>
                <select
                  name="storeLocation"
                  className="input select"
                  defaultValue=""
                >
                  <option value="">{t.form.store_default}</option>
                  {t.options.stores.map((store) => (
                    <option key={store.value} value={store.value}>
                      {store.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位6：消費日期 */}
              {isStoreVisit && (
                <div className="field">
                  <label className="label">
                    {t.form.date}
                    <span className="required">*</span>
                  </label>
                  <input type="date" name="visitDate" className="input" />
                  <p className="hint">{t.form.date_hint}</p>
                </div>
              )}

              {/* 欄位7：訊息內容 */}
              <div className="field">
                <label className="label">
                  {t.form.message} <span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  className="input textarea"
                  placeholder={t.form.message_ph}
                  rows={5}
                />
              </div>

              {/* 欄位8：上傳附件 */}
              <div className="field">
                <label className="label">
                  {t.form.attachment}
                  <span className="optional">{t.form.optional}</span>
                </label>
                <input
                  type="file"
                  name="attachment"
                  className="input"
                  accept="image/*,.pdf,.jpg,.jpeg,.png"
                />
                <p className="hint">{t.form.attachment_hint}</p>
              </div>

              {/* 狀態訊息 */}
              {status.message && (
                <div
                  className={
                    status.type === "success" ? "alert success" : "alert error"
                  }
                >
                  {status.message}
                </div>
              )}

              {/* 送出按鈕與額外提示 */}
              <div className="actions mt-4 items-start sm:items-center">
                <div className="flex flex-col">
                  <button
                    type="submit"
                    className="inline-block bg-stone-800 text-stone-50 px-5 py-2 rounded-[3px] hover:scale-105 scale-100 tracking-widest duration-300 w-fit"
                    disabled={loading}
                  >
                    {loading ? t.form.submitting : t.form.submit}
                  </button>
                  <p className="mt-3 text-sm text-[#64748b]">
                    {t.form.reply_time}
                  </p>
                </div>
                <p className="note self-start sm:self-auto mt-2 sm:mt-0">
                  {t.form.note}
                </p>
              </div>
            </form>
          </section>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            overflow-x: hidden;
          }

          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }

          .card {
            width: 100%;
            padding: 28px 20px;
          }

          @media (min-width: 768px) {
            .card {
              padding: 40px 40px;
            }
          }

          .form {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
          }

          @media (min-width: 768px) {
            .form {
              gap: 20px;
            }
          }

          .field {
            display: flex;
            flex-direction: column;
          }

          .label {
            font-size: 0.95rem;
            font-weight: 600;
            color: #3b2a1a;
            margin-bottom: 6px;
          }

          .required {
            color: #dc2626;
            margin-left: 4px;
          }

          .optional {
            margin-left: 6px;
            font-size: 0.8rem;
            color: #64748b;
          }
          .input {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            border-radius: 12px;
            border: 1px solid #cbd5f5;
            padding: 10px 12px;
            font-size: 0.95rem;
            outline: none;
            transition:
              border-color 0.18s ease,
              box-shadow 0.18s ease,
              background-color 0.18s ease;
            background-color: #f8fafc;
          }
          .field,
          .form {
            width: 100%;
            max-width: 100%;
          }

          textarea.input,
          select.input {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          .input:focus {
            border-color: #d4a373;
            box-shadow: 0 0 0 1px rgba(212, 163, 115, 0.4);
            background-color: #ffffff;
          }

          .input::placeholder {
            color: #9ca3af;
          }

          .select {
            appearance: none;
            background-image:
              linear-gradient(45deg, transparent 50%, #9ca3af 50%),
              linear-gradient(135deg, #9ca3af 50%, transparent 50%);
            background-position:
              calc(100% - 16px) 55%,
              calc(100% - 11px) 55%;
            background-size:
              5px 5px,
              5px 5px;
            background-repeat: no-repeat;
          }

          .textarea {
            resize: vertical;
            min-height: 96px;
          }

          .hint {
            font-size: 0.8rem;
            color: #94a3b8;
            margin-top: 4px;
          }

          .actions {
            margin-top: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          @media (min-width: 640px) {
            .actions {
              flex-direction: row;
              justify-content: space-between;
            }
          }

          .button {
            border: none;
            border-radius: 999px;
            padding: 10px 24px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            background: linear-gradient(135deg, #d4a373, #f3d5b5);
            color: #ffffff;
            box-shadow: 0 12px 25px rgba(212, 163, 115, 0.35);
            transition:
              transform 0.08s ease,
              box-shadow 0.08s ease;
          }

          .button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 18px 35px rgba(212, 163, 115, 0.45);
          }

          .button:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 10px 22px rgba(212, 163, 115, 0.3);
          }

          .button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            box-shadow: none;
          }

          .note {
            font-size: 0.8rem;
            color: #94a3b8;
          }

          .alert {
            border-radius: 12px;
            padding: 10px 12px;
            font-size: 0.85rem;
            margin-top: 4px;
          }

          .alert.success {
            background-color: #ecfdf3;
            color: #166534;
            border: 1px solid #bbf7d0;
          }

          .alert.error {
            background-color: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
          }
        `}</style>
      </div>
    </Layout>
  );
}
