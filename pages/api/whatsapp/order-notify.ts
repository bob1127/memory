// /pages/api/whatsapp/order-notify.ts
import type { NextApiRequest, NextApiResponse } from "next";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const WABA_TOKEN = process.env.WHATSAPP_TOKEN!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method Not Allowed" });

  try {
    const { to, name, orderId, amountText, areaLabel, fullAddress, paymentMethod } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, message: "missing 'to'" });

    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
       name: "memory_corner",     // 你的已審核模板名
        language: { code: "en_US" }, // 你的模板語言
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: String(name || "") },
              { type: "text", text: String(orderId || "") },
              { type: "text", text: String(amountText || "") },
              { type: "text", text: String(areaLabel || "") },
              { type: "text", text: String(fullAddress || "") },
              { type: "text", text: String(paymentMethod || "") },
            ],
          },
        ],
      },
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WABA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ ok: false, message: data?.error?.message || "WA error", detail: data });
    return res.status(200).json({ ok: true, result: data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message || "Server error" });
  }
}
