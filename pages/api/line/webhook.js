// pages/api/line/webhook.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const events = req.body.events || [];
  
  // 遍歷所有事件
  for (const event of events) {
    // 只處理文字訊息
    if (event.type === "message" && event.message.type === "text") {
      const userId = event.source.userId; // 👈 這就是我們要的 ID
      const replyToken = event.replyToken;

      // 回覆使用者的 ID 給他看
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          replyToken: replyToken,
          messages: [
            {
              type: "text",
              text: `你的 User ID 是：\n${userId}\n\n(請複製這串亂碼給工程師)`
            }
          ],
        }),
      });
    }
  }

  return res.status(200).json({ ok: true });
}