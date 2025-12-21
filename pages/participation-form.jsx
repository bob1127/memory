import { useState } from "react";
import Head from "next/head";
import Layout from "./Layout"; // 請確認 Layout 路徑

/* ========== 1. i18n 資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "加盟資訊表單 | 有香 Memory Corner",
      description:
        "對有香餐飲集團加盟有興趣？請填寫此表單，我們將有專人盡快與您聯繫，提供詳細加盟資訊。",
    },
    title: "加盟資訊表單 (Franchise Inquiry)",
    desc: "感謝您對我們品牌有興趣，請填寫以下資訊，我們將有專人盡快與您聯繫。",
    form: {
      fullName: "全名 (Full Name)",
      fullName_ph: "請輸入您的全名",
      email: "電子郵件 (Email Address)",
      email_ph: "example@email.com",
      email_hint: "我們將透過此信箱寄送加盟簡報。",
      contactType: "首選聯絡方式 (Preferred Contact)",
      contactType_default: "請選擇聯絡方式",
      contactId: "聯絡號碼 / ID (Contact Number / ID)",
      contactId_ph: "請輸入電話或帳號 ID",
      contactId_hint: "根據您的上列選擇，請填寫號碼或帳號 ID。",
      city: "居住城市 (Current City)",
      city_ph: "e.g., Vancouver, Richmond, Burnaby",
      city_hint: "e.g., Vancouver, Richmond, Burnaby",
      residency: "加拿大居留身份 (Residency Status)",
      residency_default: "請選擇您的身份",
      investment: "可投資金額 (Investment Budget)",
      investment_default: "請選擇預估投資金額",
      startDate: "預計加盟時程 (Target Start Date)",
      startDate_default: "請選擇預計時程",
      hearAbout: "您如何得知我們 (How did you hear about us?)",
      hearAbout_default: "請選擇（可略過）",
      notes: "補充說明 (Additional Notes)",
      notes_ph: "e.g., 您是否有餐飲經驗或已看好的店面？",
      notes_hint: "e.g., 您是否有餐飲經驗或已看好的店面？",
      submit: "送出表單",
      submitting: "送出中...",
      required: "* 為必填欄位",
      optional: "（選填）",
    },
    messages: {
      success: "表單已送出，我們將盡快與您聯繫，感謝！",
      fail: "送出失敗，請稍後再試，或改用其他聯絡方式，謝謝。",
    },
    // 下拉選單選項 (Value 不變，Label 變)
    options: {
      contacts: [
        { value: "Phone", label: "電話 (Phone)" },
        { value: "WhatsApp", label: "WhatsApp" },
        { value: "Line", label: "Line" },
        { value: "WeChat", label: "WeChat" },
      ],
      residencies: [
        {
          value: "Citizen/PR",
          label: "公民 / PR (Citizen / Permanent Resident)",
        },
        { value: "Work Permit", label: "工作簽證 (Work Permit)" },
        { value: "Student Visa", label: "學生簽證 (Student Visa)" },
        { value: "Overseas Investor", label: "海外投資者 (Overseas Investor)" },
      ],
      investments: [
        { value: "<250000", label: "< CA$250,000" },
        { value: "250000-350000", label: "CA$250,000 - $350,000" },
        { value: "350000-500000", label: "CA$350,000 - $500,000" },
        { value: ">500000", label: "> CA$500,000" },
      ],
      dates: [
        {
          value: "0-3",
          label: "立刻 / 3 個月內 (Immediately / Within 3 Months)",
        },
        { value: "3-6", label: "3 - 6 個月內 (Within 3-6 Months)" },
        { value: "6-12", label: "6 - 12 個月內 (Within 6-12 Months)" },
        { value: "research", label: "僅在研究階段 (Just Researching)" },
      ],
      hearAbouts: [
        { value: "Visited Store", label: "光顧過店家 (Visited the Store)" },
        { value: "Referral", label: "親友推薦 (Friend/Family Referral)" },
        { value: "Google", label: "Google 搜尋 (Google Search)" },
        { value: "Social Media", label: "社群媒體 (Social Media)" },
        { value: "Other", label: "其他 (Other)" },
      ],
    },
  },
  en: {
    meta: {
      title: "Franchise Inquiry | Memory Corner",
      description:
        "Interested in franchising with Memory Dining Group? Please fill out this form, and our representative will contact you shortly.",
    },
    title: "Franchise Inquiry",
    desc: "Thank you for your interest in our brand. Please fill out the information below, and we will contact you as soon as possible.",
    form: {
      fullName: "Full Name",
      fullName_ph: "Enter your full name",
      email: "Email Address",
      email_ph: "example@email.com",
      email_hint: "We will send the franchise presentation to this email.",
      contactType: "Preferred Contact",
      contactType_default: "Select contact method",
      contactId: "Contact Number / ID",
      contactId_ph: "Enter number or ID",
      contactId_hint:
        "Please provide the number/ID based on your selection above.",
      city: "Current City",
      city_ph: "e.g., Vancouver, Richmond, Burnaby",
      city_hint: "e.g., Vancouver, Richmond, Burnaby",
      residency: "Residency Status",
      residency_default: "Select your status",
      investment: "Investment Budget",
      investment_default: "Select estimated budget",
      startDate: "Target Start Date",
      startDate_default: "Select target timeline",
      hearAbout: "How did you hear about us?",
      hearAbout_default: "Select (Optional)",
      notes: "Additional Notes",
      notes_ph: "e.g., Do you have F&B experience or a location in mind?",
      notes_hint: "e.g., Do you have F&B experience or a location in mind?",
      submit: "Submit",
      submitting: "Submitting...",
      required: "* Required fields",
      optional: "(Optional)",
    },
    messages: {
      success: "Form submitted successfully! We will contact you shortly.",
      fail: "Submission failed. Please try again later or contact us directly.",
    },
    options: {
      contacts: [
        { value: "Phone", label: "Phone" },
        { value: "WhatsApp", label: "WhatsApp" },
        { value: "Line", label: "Line" },
        { value: "WeChat", label: "WeChat" },
      ],
      residencies: [
        { value: "Citizen/PR", label: "Citizen / Permanent Resident" },
        { value: "Work Permit", label: "Work Permit" },
        { value: "Student Visa", label: "Student Visa" },
        { value: "Overseas Investor", label: "Overseas Investor" },
      ],
      investments: [
        { value: "<250000", label: "< CA$250,000" },
        { value: "250000-350000", label: "CA$250,000 - $350,000" },
        { value: "350000-500000", label: "CA$350,000 - $500,000" },
        { value: ">500000", label: "> CA$500,000" },
      ],
      dates: [
        { value: "0-3", label: "Immediately / Within 3 Months" },
        { value: "3-6", label: "Within 3-6 Months" },
        { value: "6-12", label: "Within 6-12 Months" },
        { value: "research", label: "Just Researching" },
      ],
      hearAbouts: [
        { value: "Visited Store", label: "Visited the Store" },
        { value: "Referral", label: "Friend/Family Referral" },
        { value: "Google", label: "Google Search" },
        { value: "Social Media", label: "Social Media" },
        { value: "Other", label: "Other" },
      ],
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
export default function FranchiseInquiryPage({ t, locale }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const form = e.currentTarget;
    // 這裡的 formData 收集的是 value (英文代碼)，這對後端處理比較好
    const formData = {
      fullName: form.fullName.value,
      email: form.email.value,
      preferredContact: form.preferredContact.value,
      contactId: form.contactId.value,
      city: form.city.value,
      residencyStatus: form.residencyStatus.value,
      investmentBudget: form.investmentBudget.value,
      startDate: form.startDate.value,
      hearAbout: form.hearAbout.value,
      notes: form.notes.value,
    };

    try {
      const res = await fetch("/api/franchise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message: t.messages.success,
        });
        form.reset();
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

  /* 結構化資料：ContactPage */
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t.meta.title,
    description: t.meta.description,
    url: `https://www.memorycorner8.com${
      locale === "en" ? "/en/franchise/inquiry" : "/franchise/inquiry"
    }`,
    mainEntity: {
      "@type": "Organization",
      name: "Memory Dining Group",
      email: "franchise@memorycorner8.com", // 請替換為加盟專用信箱
    },
  };

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />

      <div className="page bg-[#EDE5D6]">
        <main className="container">
          <section className="card mt-20">
            <div className="flex flex-col justify-center items-center text-center">
              <h1 className="text-xl font-bold mb-4 md:text-2xl text-[#3b2a1a]">
                {t.title}
              </h1>
              <p className="description">{t.desc}</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              {/* 欄位1：全名 */}
              <div className="field">
                <label className="label">
                  {t.form.fullName} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="input"
                  placeholder={t.form.fullName_ph}
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

              {/* 欄位3：首選聯絡方式 */}
              <div className="field">
                <label className="label">
                  {t.form.contactType} <span className="required">*</span>
                </label>
                <select
                  name="preferredContact"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t.form.contactType_default}
                  </option>
                  {t.options.contacts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位4：聯絡號碼 / ID */}
              <div className="field">
                <label className="label">
                  {t.form.contactId} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="contactId"
                  required
                  className="input"
                  placeholder={t.form.contactId_ph}
                />
                <p className="hint">{t.form.contactId_hint}</p>
              </div>

              {/* 欄位5：居住城市 */}
              <div className="field">
                <label className="label">
                  {t.form.city} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  className="input"
                  placeholder={t.form.city_ph}
                />
                <p className="hint">{t.form.city_hint}</p>
              </div>

              {/* 欄位6：加拿大居留身份 */}
              <div className="field">
                <label className="label">
                  {t.form.residency} <span className="required">*</span>
                </label>
                <select
                  name="residencyStatus"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t.form.residency_default}
                  </option>
                  {t.options.residencies.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位7：可投資金額 */}
              <div className="field">
                <label className="label">
                  {t.form.investment} <span className="required">*</span>
                </label>
                <select
                  name="investmentBudget"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t.form.investment_default}
                  </option>
                  {t.options.investments.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位8：預計加盟時程 */}
              <div className="field">
                <label className="label">
                  {t.form.startDate} <span className="required">*</span>
                </label>
                <select
                  name="startDate"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t.form.startDate_default}
                  </option>
                  {t.options.dates.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位9：您如何得知我們（非必填） */}
              <div className="field">
                <label className="label">
                  {t.form.hearAbout}
                  <span className="optional">{t.form.optional}</span>
                </label>
                <select
                  name="hearAbout"
                  className="input select"
                  defaultValue=""
                >
                  <option value="">{t.form.hearAbout_default}</option>
                  {t.options.hearAbouts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 欄位10：補充說明（非必填） */}
              <div className="field">
                <label className="label">
                  {t.form.notes}
                  <span className="optional">{t.form.optional}</span>
                </label>
                <textarea
                  name="notes"
                  className="input textarea"
                  placeholder={t.form.notes_ph}
                  rows={4}
                />
                <p className="hint">{t.form.notes_hint}</p>
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

              {/* 送出按鈕 */}
              <div className="actions">
                <button
                  type="submit"
                  className="bg-stone-800 text-[#e19d37] rounded-full py-4 w-[200px]"
                  disabled={loading}
                >
                  {loading ? t.form.submitting : t.form.submit}
                </button>
                <p className="note">{t.form.required}</p>
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

          .description {
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.6;
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
            color: #3b2a1a; /* 品牌色 */
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
            transition: border-color 0.18s ease, box-shadow 0.18s ease,
              background-color 0.18s ease;
            background-color: #f8fafc;
          }
          .field,
          .form {
            width: 100%;
            max-width: 100%;
          }

          .input:focus {
            border-color: #d4a373; /* 品牌色 focus */
            box-shadow: 0 0 0 1px rgba(212, 163, 115, 0.4);
            background-color: #ffffff;
          }

          .input::placeholder {
            color: #9ca3af;
          }

          .select {
            appearance: none;
            background-image: linear-gradient(
                45deg,
                transparent 50%,
                #9ca3af 50%
              ),
              linear-gradient(135deg, #9ca3af 50%, transparent 50%);
            background-position: calc(100% - 16px) 55%, calc(100% - 11px) 55%;
            background-size: 5px 5px, 5px 5px;
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
            align-items: flex-start;
            gap: 8px;
          }

          @media (min-width: 640px) {
            .actions {
              flex-direction: row;
              align-items: center;
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
            background: linear-gradient(
              135deg,
              #d4a373,
              #f3d5b5
            ); /* 品牌色按鈕 */
            color: #ffffff;
            box-shadow: 0 12px 25px rgba(212, 163, 115, 0.35);
            transition: transform 0.08s ease, box-shadow 0.08s ease;
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
