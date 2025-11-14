// pages/franchise-inquiry.jsx
import { useState } from "react";
import Head from "next/head";
import Layout from "./Layout";
export default function FranchiseInquiryPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const form = e.currentTarget;
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
          message: "表單已送出，我們將盡快與您聯繫，感謝！",
        });
        form.reset();
      } else {
        throw new Error(data.error || "送出失敗");
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: "送出失敗，請稍後再試，或改用其他聯絡方式，謝謝。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Head>
        <title>加盟資訊表單 | Franchise Inquiry</title>
      </Head>

      <div className="page ">
        <main className="container">
          <section className="card mt-20">
            <div className="flex flex-col justify-center items-center">
              {" "}
              <h1 className="text-xl font-bold mb-4 md:text-2xl">
                加盟資訊表單 (Franchise Inquiry)
              </h1>
              <p className="description">
                感謝您對我們品牌有興趣，請填寫以下資訊，我們將有專人盡快與您聯繫。
              </p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              {/* 欄位1：全名 */}
              <div className="field">
                <label className="label">
                  全名 (Full Name) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="input"
                  placeholder="請輸入您的全名"
                />
              </div>

              {/* 欄位2：電子郵件 */}
              <div className="field">
                <label className="label">
                  電子郵件 (Email Address) <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input"
                  placeholder="example@email.com"
                />
                <p className="hint">我們將透過此信箱寄送加盟簡報。</p>
              </div>

              {/* 欄位3：首選聯絡方式 */}
              <div className="field">
                <label className="label">
                  首選聯絡方式 (Preferred Contact){" "}
                  <span className="required">*</span>
                </label>
                <select
                  name="preferredContact"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    請選擇聯絡方式
                  </option>
                  <option value="Phone">電話 (Phone)</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Line">Line</option>
                  <option value="WeChat">WeChat</option>
                </select>
              </div>

              {/* 欄位4：聯絡號碼 / ID */}
              <div className="field">
                <label className="label">
                  聯絡號碼 / ID (Contact Number / ID){" "}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="contactId"
                  required
                  className="input"
                  placeholder="請輸入電話或帳號 ID"
                />
                <p className="hint">根據您的上列選擇，請填寫號碼或帳號 ID。</p>
              </div>

              {/* 欄位5：居住城市 */}
              <div className="field">
                <label className="label">
                  居住城市 (Current City) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  className="input"
                  placeholder="e.g., Vancouver, Richmond, Burnaby"
                />
                <p className="hint">e.g., Vancouver, Richmond, Burnaby</p>
              </div>

              {/* 欄位6：加拿大居留身份 */}
              <div className="field">
                <label className="label">
                  加拿大居留身份 (Residency Status){" "}
                  <span className="required">*</span>
                </label>
                <select
                  name="residencyStatus"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    請選擇您的身份
                  </option>
                  <option value="Citizen/PR">
                    公民 / PR (Citizen / Permanent Resident)
                  </option>
                  <option value="Work Permit">工作簽證 (Work Permit)</option>
                  <option value="Student Visa">學生簽證 (Student Visa)</option>
                  <option value="Overseas Investor">
                    海外投資者 (Overseas Investor / None of the above)
                  </option>
                </select>
              </div>

              {/* 欄位7：可投資金額 */}
              <div className="field">
                <label className="label">
                  可投資金額 (Investment Budget){" "}
                  <span className="required">*</span>
                </label>
                <select
                  name="investmentBudget"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    請選擇預估投資金額
                  </option>
                  <option value="<250000">&lt; CA$250,000</option>
                  <option value="250000-350000">CA$250,000 - $350,000</option>
                  <option value="350000-500000">CA$350,000 - $500,000</option>
                  <option value=">500000">&gt; CA$500,000</option>
                </select>
              </div>

              {/* 欄位8：預計加盟時程 */}
              <div className="field">
                <label className="label">
                  預計加盟時程 (Target Start Date){" "}
                  <span className="required">*</span>
                </label>
                <select
                  name="startDate"
                  required
                  className="input select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    請選擇預計時程
                  </option>
                  <option value="0-3">
                    立刻 / 3 個月內 (Immediately / Within 3 Months)
                  </option>
                  <option value="3-6">3 - 6 個月內 (Within 3-6 Months)</option>
                  <option value="6-12">
                    6 - 12 個月內 (Within 6-12 Months)
                  </option>
                  <option value="research">
                    僅在研究階段 (Just Researching)
                  </option>
                </select>
              </div>

              {/* 欄位9：您如何得知我們（非必填） */}
              <div className="field">
                <label className="label">
                  您如何得知我們 (How did you hear about us?)
                  <span className="optional">（選填）</span>
                </label>
                <select
                  name="hearAbout"
                  className="input select"
                  defaultValue=""
                >
                  <option value="">請選擇（可略過）</option>
                  <option value="Visited Store">
                    光顧過店家 (Visited the Store)
                  </option>
                  <option value="Referral">
                    親友推薦 (Friend/Family Referral)
                  </option>
                  <option value="Google">Google 搜尋 (Google Search)</option>
                  <option value="Social Media">社群媒體 (Social Media)</option>
                  <option value="Other">其他 (Other)</option>
                </select>
              </div>

              {/* 欄位10：補充說明（非必填） */}
              <div className="field">
                <label className="label">
                  補充說明 (Additional Notes)
                  <span className="optional">（選填）</span>
                </label>
                <textarea
                  name="notes"
                  className="input textarea"
                  placeholder="e.g., 您是否有餐飲經驗或已看好的店面？"
                  rows={4}
                />
                <p className="hint">e.g., 您是否有餐飲經驗或已看好的店面？</p>
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
                <button type="submit" className="button" disabled={loading}>
                  {loading ? "送出中..." : "送出表單"}
                </button>
                <p className="note">* 為必填欄位</p>
              </div>
            </form>
          </section>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            width: 100%;
            box-sizing: border-box;
            background: radial-gradient(circle at top, #f5f7ff, #f0f2f5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            overflow-x: hidden; /* 避免橫向捲動 */
          }

          .container {
            width: 100%;
            max-width: 600px; /* ✅ 手機版最多 600px 寬 */
            margin: 0 auto;
          }

          .card {
            width: 100%; /* ✅ 卡片一定塞在 container 裡 */
            background: #ffffff;
            border-radius: 24px;
            padding: 28px 20px;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            border: 1px solid rgba(148, 163, 184, 0.25);
          }

          @media (min-width: 768px) {
            .card {
              padding: 40px 40px;
            }
          }

          /* 平板以上再恢復原本比較大的內距 */
          @media (min-width: 768px) {
            .card {
              padding: 40px 40px;
            }
          }

          .title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 8px;
            color: #0f172a;
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
            color: #0f172a;
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
            width: 100%; /* ✅ 滿版但不超出 */
            max-width: 100%;
            box-sizing: border-box;
            border-radius: 12px;
            border: 1px solid #cbd5f5;
            padding: 10px 12px;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.18s ease, box-shadow 0.18s ease,
              background-color 0.18s ease, transform 0.05s ease;
            background-color: #f8fafc;
          }
          .field,
          .form {
            width: 100%;
            max-width: 100%;
          }
          .input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
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
            box-shadow: 0 12px 25px rgba(79, 70, 229, 0.35);
            transition: transform 0.08s ease, box-shadow 0.08s ease,
              opacity 0.18s ease;
          }

          .button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 18px 35px rgba(79, 70, 229, 0.4);
          }

          .button:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: 0 10px 22px rgba(79, 70, 229, 0.25);
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
