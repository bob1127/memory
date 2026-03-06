// pages/api/contact.js
import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

// 關閉 Next.js 預設 bodyParser，讓 formidable 處理 multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// 用 formidable v2 解析表單
function parseForm(req) {
  const form = new formidable.IncomingForm({
    multiples: false,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);

    const name = fields.name || "";
    const email = fields.email || "";
    const phone = fields.phone || "";
    const reason = fields.reason || "";
    const storeLocation = fields.storeLocation || "";
    const visitDate = fields.visitDate || "";
    const message = fields.message || "";

    const attachmentFile = files.attachment;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // smtp.gmail.com
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER, // bob1127...
        pass: process.env.SMTP_PASS,
      },
    });

    const toList = [
      "bob112722761236tom@gmail.com", 
       "volon1019@gmail.com",
  "raymondxwu@hotmail.com",
  "maxliao2020@gmail.com",
    ];

    const subject = `【聯絡我們】${reason || "新留言"} - ${
      name || "未填寫姓名"
    }`;

    const plainText = `
官網聯絡我們 (Contact Us) 有新的留言：

姓名 (Name)：${name}
電子郵件 (Email)：${email}
聯絡電話 (Phone)：${phone || "未填寫"}

聯絡主題 (Reason for Contact)：${reason}
相關分店 (Store Location)：${storeLocation || "未填寫"}
消費日期 (Date of Visit)：${visitDate || "未填寫"}

訊息內容 (Message)：
${message || "未填寫"}

-- 此信由官網聯絡我們表單自動發送 --
    `.trim();

    const html = `
      <h2>官網聯絡我們 (Contact Us) 有新的留言</h2>
      <p>以下為詳細資訊：</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>姓名 (Name)</strong></td><td>${escapeHtml(
          name
        )}</td></tr>
        <tr><td><strong>電子郵件 (Email)</strong></td><td>${escapeHtml(
          email
        )}</td></tr>
        <tr><td><strong>聯絡電話 (Phone)</strong></td><td>${escapeHtml(
          phone || "未填寫"
        )}</td></tr>
        <tr><td><strong>聯絡主題 (Reason for Contact)</strong></td><td>${escapeHtml(
          reason
        )}</td></tr>
        <tr><td><strong>相關分店 (Store Location)</strong></td><td>${escapeHtml(
          storeLocation || "未填寫"
        )}</td></tr>
        <tr><td><strong>消費日期 (Date of Visit)</strong></td><td>${escapeHtml(
          visitDate || "未填寫"
        )}</td></tr>
        <tr>
          <td valign="top"><strong>訊息內容 (Message)</strong></td>
          <td>${nl2br(escapeHtml(message || "未填寫"))}</td>
        </tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b;">
        此信由官網聯絡我們表單自動發送。若要回覆顧客，請直接使用「回覆」功能，信件會寄到顧客填寫的信箱。
      </p>
    `;

    const mailOptions = {
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: toList.join(","),
      subject,
      text: plainText,
      html,
      replyTo: email || undefined,
    };

    // 如果有附件就一起寄出
    if (attachmentFile && attachmentFile.filepath) {
      mailOptions.attachments = [
        {
          filename: attachmentFile.originalFilename || "attachment",
          content: fs.createReadStream(attachmentFile.filepath),
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form mail error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send email" });
  }
}

// 小工具：HTML escape & 換行
function escapeHtml(str = "") {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(str = "") {
  return String(str || "").replace(/\n/g, "<br />");
}
