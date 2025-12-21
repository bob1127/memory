import { useState } from "react";
import Head from "next/head";
import Layout from "./Layout"; // 請確認 Layout 路徑

/* ========== 1. i18n 資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "聯絡我們 | 有香 Memory Corner",
      description:
        "有任何問題或建議？歡迎透過表單聯絡有香餐飲集團，我們將盡快回覆您。",
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
      reason_default: "請選擇聯絡主題",
      store: "相關分店 (Store Location)",
      store_default: "請選擇分店（可略過）",
      date: "消費日期 (Date of Visit)",
      date_hint: "幫助我們追溯當天情況。",
      message: "訊息內容 (Message)",
      message_ph: "請盡可能詳細描述您的情況。",
      attachment: "上傳附件 (Attachment)",
      attachment_hint: "例如：收據、照片（可略過）。",
      submit: "送出表單",
      submitting: "送出中...",
      note: "* 為必填欄位",
      optional: "（選填）",
    },
    options: {
      reasons: [
        { value: "Complaint: Food Quality", label: "客訴：餐點品質" },
        { value: "Complaint: Service", label: "客訴：服務態度" },
        { value: "Complaint: Store Environment", label: "客訴：環境清潔" },
        { value: "General Suggestion", label: "一般建議" },
        { value: "Business Cooperation", label: "商業合作" },
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
          value: "Kitchen Corner Richmond",
          label: "有香ㄟ灶腳 Kitchen Corner (Richmond)",
        },
        {
          value: "Memory Corner Coquitlam",
          label: "有香 Memory Corner (Coquitlam)",
        },
      ],
    },
    messages: {
      error_store: "若為客訴，請選擇相關分店。",
      error_date: "若為客訴，請填寫消費日期。",
      success: "表單已送出，我們會在 2–3 個工作日內回覆您，感謝！",
      fail: "送出失敗，請稍後再試，或改用其他聯絡方式，謝謝。",
    },
  },
  en: {
    meta: {
      title: "Contact Us | Memory Corner",
      description:
        "Have questions or suggestions? Contact Memory Dining Group through this form, and we will get back to you soon.",
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
      reason_default: "Select a reason",
      store: "Store Location",
      store_default: "Select a store (Optional)",
      date: "Date of Visit",
      date_hint: "Helps us trace the incident.",
      message: "Message",
      message_ph: "Please describe your situation in detail.",
      attachment: "Attachment",
      attachment_hint: "E.g., Receipt, Photo (Optional).",
      submit: "Submit",
      submitting: "Submitting...",
      note: "* Required fields",
      optional: "(Optional)",
    },
    options: {
      reasons: [
        { value: "Complaint: Food Quality", label: "Complaint: Food Quality" },
        { value: "Complaint: Service", label: "Complaint: Service" },
        {
          value: "Complaint: Store Environment",
          label: "Complaint: Store Environment",
        },
        { value: "General Suggestion", label: "General Suggestion" },
        { value: "Business Cooperation", label: "Business Cooperation" },
        { value: "Other", label: "Other" },
      ],
      stores: [
        { value: "Memory Corner Richmond", label: "Memory Corner (Richmond)" },
        { value: "Sweet Memory Richmond", label: "Sweet Memory (Richmond)" },
        {
          value: "Kitchen Corner Richmond",
          label: "Kitchen Corner (Richmond)",
        },
        {
          value: "Memory Corner Coquitlam",
          label: "Memory Corner (Coquitlam)",
        },
      ],
    },
    messages: {
      error_store: "Please select a store location for complaints.",
      error_date: "Please specify the date of visit for complaints.",
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

  // 判斷是否為客訴 (邏輯依賴 value 值，這些值在不同語系下保持一致)
  const isComplaint =
    reason === "Complaint: Food Quality" ||
    reason === "Complaint: Service" ||
    reason === "Complaint: Store Environment";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const form = e.currentTarget;

    // 額外驗證：如果是客訴，分店與日期必填
    if (isComplaint) {
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

  /* 結構化資料：ContactPage */
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t.meta.title,
    description: t.meta.description,
    url: `https://www.memorycorner8.com${
      locale === "en" ? "/en/contact" : "/contact"
    }`,
    mainEntity: {
      "@type": "Organization",
      name: "Memory Corner Group",
      email: "info@memorycorner8.com", // 請確認您的聯絡信箱
      url: "https://www.memorycorner8.com",
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
                  {isComplaint ? (
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
              {isComplaint && (
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

              {/* 送出按鈕 */}
              <div className="actions">
                <button
                  type="submit"
                  className="bg-stone-800 text-[#e19d37] rounded-full py-4 w-[200px]"
                  disabled={loading}
                >
                  {loading ? t.form.submitting : t.form.submit}
                </button>
                <p className="note">{t.form.note}</p>
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
            color: #3b2a1a; /* 配合 Layout 風格 */
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
            background: linear-gradient(135deg, #d4a373, #f3d5b5);
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
