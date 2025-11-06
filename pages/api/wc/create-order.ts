// pages/api/wc/create-order.ts (或 .js)
import type { NextApiRequest, NextApiResponse } from "next";

function splitName(full = "") {
  const s = String(full).trim();
  if (!s) return { first_name: "", last_name: "" };
  const parts = s.split(/\s+/);
  return parts.length >= 2
    ? { first_name: parts.slice(0, -1).join(" "), last_name: parts.at(-1)! }
    : { first_name: s, last_name: "" };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  try {
    const { cart = [], form = {}, shipping_fee = 0, tax = 0 } = req.body || {};
    const { email, phone, name, deliveryAddress } = form;

    const { first_name, last_name } = splitName(name);

    // ✅ address_1 只放純地址字串，別加 name
    const billing = {
      first_name,
      last_name,
      email,
      phone,
      address_1: String(deliveryAddress || "").trim(),
      country: "CA", // 你原本的國別
    };

    const shipping = {
      first_name,
      last_name,
      address_1: String(deliveryAddress || "").trim(),
      country: "CA",
    };

    const line_items = cart.map((it: any) => ({
      product_id: it.id,
      quantity: it.qty || 1,
    }));

    // 若你用 WC REST v3
    const payload = {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing,
      shipping,
      line_items,
      shipping_lines: shipping_fee > 0 ? [{
        method_id: "flat_rate",
        method_title: "Flat rate",
        total: String(shipping_fee),
      }] : [],
      fee_lines: tax > 0 ? [{
        name: "Tax",
        total: String(tax),
      }] : [],
    };

    // ...呼叫 WooCommerce 建單（略）...
    // const order = await wcPost("/orders", payload);

    // 假回傳（替換成你真實回傳）
    return res.json({ ok: true, order: { id: 123, billing, shipping } });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || String(e) });
  }
}
