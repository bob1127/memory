// /pages/api/whatsapp/order-notify.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WABA_TOKEN = process.env.WHATSAPP_TOKEN;
  const TEMPLATE_NAME = process.env.WA_TEMPLATE_NAME || "memory_corner";
  const TEMPLATE_LANG = process.env.WA_TEMPLATE_LANG || "en_US";

  if (!PHONE_NUMBER_ID || !WABA_TOKEN) {
    return res.status(500).json({ ok: false, message: "Missing WA env vars" });
  }

  try {
    const { to, name, orderId, amountText, areaLabel, fullAddress, paymentMethod } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, message: "missing 'to'" });

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: TEMPLATE_LANG },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: String(name || "") },         // {{1}}
              { type: "text", text: String(orderId || "") },      // {{2}}
              { type: "text", text: String(amountText || "") },   // {{3}}
              { type: "text", text: String(areaLabel || "") },    // {{4}}
              { type: "text", text: String(fullAddress || "") },  // {{5}}
              { type: "text", text: String(paymentMethod || "") } // {{6}}
            ],
          },
        ],
      },
    };

    // 可開 debug 看 payload
    if (process.env.DEBUG === "1") {
      console.log("[WA] payload", JSON.stringify(payload));
    }

    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WABA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();

    if (!r.ok) {
      console.error("[WA] send error:", data);
      return res.status(r.status).json({ ok: false, message: data?.error?.message || "WA error", detail: data });
    }

    return res.status(200).json({ ok: true, result: data });
  } catch (e) {
    console.error("[WA] exception", e);
    return res.status(500).json({ ok: false, message: e?.message || "Server error" });
  }
}
