// pages/api/wc/create-order.js
function b64(str) {
  return Buffer.from(str).toString("base64");
}

function splitName(full = "") {
  const s = String(full || "").trim();
  if (!s) return { first_name: "", last_name: "" };
  const parts = s.split(/\s+/);
  return parts.length >= 2
    ? { first_name: parts.slice(0, -1).join(" "), last_name: parts.at(-1) }
    : { first_name: s, last_name: "" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    // 讀 body
    const { cart = [], form = {}, shipping_fee = 0, tax = 0, customerId } = req.body || {};
    const { email = "", phone = "", name = "", deliveryAddress = "" } = form || {};

    // 基本檢查
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, message: "購物車為空" });
    }
    if (!email || !name) {
      return res.status(400).json({ ok: false, message: "缺少 Email 或 姓名" });
    }

    // 必備環境變數
    const { WC_URL, WC_CK, WC_CS } = process.env;
    if (!WC_URL || !WC_CK || !WC_CS) {
      return res.status(500).json({ ok: false, message: "環境變數未設定（WC_URL / WC_CK / WC_CS）" });
    }

    // 拆姓名
    const { first_name, last_name } = splitName(name);

    // address_1 只放地址，不要加人名（避免你看到的「bob1127 地址…」問題）
    const billing = {
      first_name,
      last_name,
      email,
      phone,
      address_1: String(deliveryAddress || "").trim(),
      country: "CA", // 依你目前邏輯
    };

    const shipping = {
      first_name,
      last_name,
      address_1: String(deliveryAddress || "").trim(),
      country: "CA",
    };

    // 轉成 WooCommerce line_items
    const line_items = cart.map((it) => ({
      product_id: Number(it.id),
      quantity: Number(it.qty || 1),
      // 若有變體可加 variation_id: Number(it.variation_id)
    }));

    // 運費、稅金（你目前是自算 → 用 shipping_lines / fee_lines 帶進去）
    const shipping_lines =
      Number(shipping_fee) > 0
        ? [
            {
              method_id: "flat_rate",
              method_title: "Flat rate",
              total: String(shipping_fee),
            },
          ]
        : [];

    const fee_lines =
      Number(tax) > 0
        ? [
            {
              name: "Tax",
              total: String(tax),
            },
          ]
        : [];

    // 組 payload
    const payload = {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false, // 先不標記已付款
      billing,
      shipping,
      line_items,
      shipping_lines,
      fee_lines,
    };

    // 如果前端有帶登入會員的 Woo 顧客 ID，直接綁定（這樣你的「會員頁面 → 訂單」才查得到）
    if (customerId) {
      payload.customer_id = Number(customerId);
    }

    // 發送建單請求（用 Basic Auth）
    const url = `${WC_URL.replace(/\/$/, "")}/wp-json/wc/v3/orders`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${b64(`${WC_CK}:${WC_CS}`)}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
      // 直接把 Woo 回傳錯誤回給你除錯
      return res.status(r.status).json({
        ok: false,
        message: `Woo 建單失敗 ${r.status}`,
        detail: data,
        sent: payload,
      });
    }

    // 成功：回傳 Woo 真實訂單（至少要有 id）
    return res.status(200).json({ ok: true, order: data });
  } catch (e) {
    return res.status(500).json({ ok: false, message: String(e?.message || e) });
  }
}
