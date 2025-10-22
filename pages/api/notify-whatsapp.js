// pages/api/notify-whatsapp.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const owner = String(process.env.WHATSAPP_TO || "").replace(/[^\d]/g, "");

  if (!token || !phoneId || !owner) {
    return res.status(500).json({
      ok: false,
      message: "Missing WhatsApp environment variables (token/phoneId/owner).",
    });
  }

  // ===== 取 payload =====
  const {
    orderId,
    subtotal = 0,
    shippingFee = 0,
    tax = 0,
    total = 0,
    customer = {},
    items = [],
    delivery = {},
    payment = "",
    // 可選：{ name: 'order_notice', lang: 'zh_HK' }
    template,
  } = req.body || {};

  // ===== 組純文字訊息（當沒帶 template 時會用到）=====
  const lines =
    (items || [])
      .map(
        (it) =>
          `• ${it.name} × ${Number(it.qty || 1)} ＝ NT$ ${(Number(it.price || 0) * Number(it.qty || 1)).toLocaleString()}`
      )
      .join(", ") || "(無商品資料)";

  let textMsg = [
    "🍺 新訂單通知",
    `#${orderId ?? ""}`,
    `👤 客戶：${customer.name || ""} / ${customer.phone || ""}`,
    `✉️ ${customer.email || ""}`,
    `📍 ${delivery.area || ""} ${delivery.address || ""}`,
    `💳 ${payment || ""}`,
    `🧾 ${lines}`,
    `總計：NT$ ${Number(total).toLocaleString()}`,
  ]
    .join(" / ")
    .replace(/\s+/g, " ")
    .trim();

  // ===== 如果沒給 template → 用 text 直接發 =====
  if (!template?.name) {
    try {
      const r = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: owner,
          type: "text",
          text: { body: textMsg },
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        return res.status(r.status).json({
          ok: false,
          message: "WhatsApp API error (text)",
          detail: data,
        });
      }
      return res.status(200).json({ ok: true, data, mode: "text" });
    } catch (err) {
      return res.status(500).json({ ok: false, message: String(err) });
    }
  }

  // ===== 用範本發送（有語言 fallback）=====
  const templateName = String(template.name).trim(); // 例如 'order_notice'
  const firstCode = (template.lang || "zh_HK").trim(); // 例如 'zh_HK'
  const candidates = [firstCode, "zh_Hant_HK", "zh_TW", "zh_CN"];

  // 範本 body 6 個參數（依你在後台設計的順序）
  const p1 = String(orderId ?? "");
  const p2 = String(customer.name || "");
  const p3 = String(customer.phone || "");
  const p4 = String(payment || "");
  const p5 = `${delivery.area || ""} ${delivery.address || ""}`.trim();
  const p6 = `NT$${Number(total).toLocaleString()}`;

  try {
    for (const code of candidates) {
      const body = {
        messaging_product: "whatsapp",
        to: owner,
        type: "template",
        template: {
          name: templateName,
          language: { policy: "deterministic", code }, // 關鍵：deterministic + 正確語言碼
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: p1 },
                { type: "text", text: p2 },
                { type: "text", text: p3 },
                { type: "text", text: p4 },
                { type: "text", text: p5 },
                { type: "text", text: p6 },
              ],
            },
          ],
        },
      };

      const r = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await r.json().catch(() => ({}));

      if (r.ok) {
        return res.status(200).json({ ok: true, data, mode: "template", lang_used: code });
      }

      // 若是 132001 = 此語言沒有該範本 → 試下一個候選語言
      const errCode = data?.error?.code;
      if (errCode === 132001) {
        // 繼續嘗試下一個語言
        continue;
      }

      // 其他錯誤 → 直接回傳
      return res
        .status(r.status)
        .json({ ok: false, message: "WhatsApp API error (template)", detail: data });
    }

    // 走到這裡代表所有語言都試過仍沒有該範本
    return res.status(404).json({
      ok: false,
      message: "Template not found in any tried languages",
      tried: candidates,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: String(err) });
  }
}
