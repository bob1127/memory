// pages/api/franchise-inquiry.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const {
    fullName,
    email,
    preferredContact,
    contactId,
    city,
    residencyStatus,
    investmentBudget,
    startDate,
    hearAbout,
    notes,
  } = req.body;

  try {
    // 這裡用環境變數設定 SMTP，請依你的信箱服務調整
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g. "smtp.gmail.com"
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toList = [
       "bob112722761236tom@gmail.com",
        "volon1019@gmail.com",
  "raymondxwu@hotmail.com",
  "maxliao2020@gmail.com",
    ];

    const subject = `【加盟資訊表單】新申請 - ${fullName || "未填寫姓名"}`;

    const plainText = `
加盟資訊表單 (Franchise Inquiry) 有新的填寫：

全名 (Full Name)：${fullName}
電子郵件 (Email)：${email}

首選聯絡方式 (Preferred Contact)：${preferredContact}
聯絡號碼 / ID (Contact Number / ID)：${contactId}

居住城市 (Current City)：${city}
加拿大居留身份 (Residency Status)：${residencyStatus}
可投資金額 (Investment Budget)：${investmentBudget}
預計加盟時程 (Target Start Date)：${startDate}

您如何得知我們 (How did you hear about us?)：${hearAbout || "未填寫"}

補充說明 (Additional Notes)：
${notes || "未填寫"}

-- 此信由官網加盟資訊表單自動發送 --
    `.trim();

    const html = `
      <h2>加盟資訊表單 (Franchise Inquiry) 有新的填寫</h2>
      <p>以下為詳細資訊：</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>全名 (Full Name)</strong></td><td>${escapeHtml(
          fullName
        )}</td></tr>
        <tr><td><strong>電子郵件 (Email)</strong></td><td>${escapeHtml(
          email
        )}</td></tr>
        <tr><td><strong>首選聯絡方式 (Preferred Contact)</strong></td><td>${escapeHtml(
          preferredContact
        )}</td></tr>
        <tr><td><strong>聯絡號碼 / ID</strong></td><td>${escapeHtml(
          contactId
        )}</td></tr>
        <tr><td><strong>居住城市 (Current City)</strong></td><td>${escapeHtml(
          city
        )}</td></tr>
        <tr><td><strong>加拿大居留身份 (Residency Status)</strong></td><td>${escapeHtml(
          residencyStatus
        )}</td></tr>
        <tr><td><strong>可投資金額 (Investment Budget)</strong></td><td>${escapeHtml(
          investmentBudget
        )}</td></tr>
        <tr><td><strong>預計加盟時程 (Target Start Date)</strong></td><td>${escapeHtml(
          startDate
        )}</td></tr>
        <tr><td><strong>您如何得知我們</strong></td><td>${escapeHtml(
          hearAbout || "未填寫"
        )}</td></tr>
        <tr><td valign="top"><strong>補充說明 (Additional Notes)</strong></td><td>${nl2br(
          escapeHtml(notes || "未填寫")
        )}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b;">
        此信由官網加盟資訊表單自動發送，請勿直接回覆此信箱（如需可改為可回覆地址）。
      </p>
    `;

    await transporter.sendMail({
      from: `"Franchise Form" <${process.env.SMTP_USER}>`,
      to: toList.join(","),
      subject,
      text: plainText,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Franchise inquiry mail error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to send email",
    });
  }
}

// 小工具：HTML escape & 換行
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(str = "") {
  return String(str).replace(/\n/g, "<br />");
}
