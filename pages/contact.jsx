// pages/contact.jsx
import { useState } from "react";
import Head from "next/head";
import Layout from "./Layout";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [reason, setReason] = useState("");

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
          message: "若為客訴，請選擇相關分店。",
        });
        setLoading(false);
        return;
      }
      if (!form.visitDate.value) {
        setStatus({
          type: "error",
          message: "若為客訴，請填寫消費日期。",
        });
        setLoading(false);
        return;
      }
    }

    // 使用 FormData 才能夾帶檔案
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData, // 不要自己設 Content-Type，讓瀏覽器自動帶 boundary
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: "success",
          message: "表單已送出，我們會在 2–3 個工作日內回覆您，感謝！",
        });
        form.reset();
        setReason("");
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
        <title>聯絡我們 | Contact Us</title>
      </Head>

      <div className="page">
        <main className="container">
          <section className="card mt-20">
            <div className="flex flex-col justify-center items-center">
              {" "}
              <h1 className="text-xl font-bold mb-4 md:text-2xl">
                聯絡我們 (Contact Us)
              </h1>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              {/* 欄位1：姓名 */}
              <div className="field">
                <label className="label">
                  姓名 (Name) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input"
                  placeholder="請輸入您的姓名"
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
                <p className="hint">我們將透過此信箱回覆您。</p>
              </div>

              {/* 欄位3：聯絡電話 */}
              <div className="field">
                <label className="label">
                  聯絡電話 (Phone Number)
                  <span className="optional">（選填）</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  placeholder="請輸入您的聯絡電話（可略過）"
                />
              </div>

              {/* 欄位4：聯絡主題 */}
              <div className="field">
                <label className="label">
                  聯絡主題 (Reason for Contact){" "}
                  <span className="required">*</span>
                </label>
                <select
                  name="reason"
                  required
                  className="input select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">請選擇聯絡主題</option>
                  <option value="Complaint: Food Quality">
                    客訴：餐點品質 (Complaint: Food Quality)
                  </option>
                  <option value="Complaint: Service">
                    客訴：服務態度 (Complaint: Service)
                  </option>
                  <option value="Complaint: Store Environment">
                    客訴：環境清潔 (Complaint: Store Environment)
                  </option>
                  <option value="General Suggestion">
                    一般建議 (General Suggestion)
                  </option>
                  <option value="Business Cooperation">
                    商業合作 (Business Cooperation)
                  </option>
                  <option value="Other">其他 (Other)</option>
                </select>
              </div>

              {/* 欄位5：相關分店 */}
              <div className="field">
                <label className="label">
                  相關分店 (Store Location)
                  {isComplaint ? (
                    <span className="required">*</span>
                  ) : (
                    <span className="optional">（選填）</span>
                  )}
                </label>
                <select
                  name="storeLocation"
                  className="input select"
                  defaultValue=""
                >
                  <option value="">請選擇分店（可略過）</option>
                  <option value="有香 Richmond 店">有香 Richmond 店</option>
                  <option value="憶點點 Richmond 店">憶點點 Richmond 店</option>
                  <option value="有香ㄟ灶腳 Richmond店">
                    有香ㄟ灶腳 Richmond店
                  </option>
                  <option value="有香 Coquitlam店">有香 Coquitlam店</option>
                </select>
              </div>

              {/* 欄位6：消費日期（客訴時建議必填，非客訴可不顯示或選填） */}
              {isComplaint && (
                <div className="field">
                  <label className="label">
                    消費日期 (Date of Visit)
                    <span className="required">*</span>
                  </label>
                  <input type="date" name="visitDate" className="input" />
                  <p className="hint">幫助我們追溯當天情況。</p>
                </div>
              )}

              {/* 欄位7：訊息內容 */}
              <div className="field">
                <label className="label">
                  訊息內容 (Message) <span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  className="input textarea"
                  placeholder="請盡可能詳細描述您的情況。"
                  rows={5}
                />
                <p className="hint">請盡可能詳細描述您的情況。</p>
              </div>

              {/* 欄位8：上傳附件 */}
              <div className="field">
                <label className="label">
                  上傳附件 (Attachment)
                  <span className="optional">（選填）</span>
                </label>
                <input
                  type="file"
                  name="attachment"
                  className="input"
                  accept="image/*,.pdf,.jpg,.jpeg,.png"
                />
                <p className="hint">例如：收據、照片（可略過）。</p>
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

          textarea.input,
          select.input {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
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
            background: linear-gradient(
              135deg,
              #d4a373,
              #f3d5b5
            ); /* 土黃色系漸層 */
            color: #ffffff;
            box-shadow: 0 12px 25px rgba(212, 163, 115, 0.35);
            transition: transform 0.08s ease, box-shadow 0.08s ease,
              opacity 0.18s ease;
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
