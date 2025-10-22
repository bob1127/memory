// pages/api/wc/create-order.js

/* ------------------------ 小工具 ------------------------ */
function b64(str) {
  return Buffer.from(str).toString("base64");
}

// 中文付款方式 → Woo slug 對照
function mapPaymentSlug(label = "") {
  const t = String(label).trim();
  if (!t) return { slug: "cod", title: "貨到付款" };

  const table = [
    { kw: ["貨到付款", "貨到", "COD", "cod"], slug: "cod", title: "貨到付款" },
    { kw: ["銀行轉帳", "匯款", "轉帳", "bacs", "BACS"], slug: "bacs", title: "銀行轉帳" },
    { kw: ["信用卡", "刷卡", "stripe", "card"], slug: "stripe", title: "信用卡" },
    { kw: ["LINE Pay", "line pay", "linepay"], slug: "linepay", title: "LINE Pay" },
  ];

  for (const row of table) {
    if (row.kw.some((k) => t.toLowerCase().includes(String(k).toLowerCase()))) {
      return { slug: row.slug, title: row.title };
    }
  }
  return { slug: "cod", title: t || "貨到付款" };
}

const ensureURL = (u) => (u || "").replace(/\/+$/, "");
const sanitize = (v) => (typeof v === "string" ? v.trim() : "");

/* -------------------- WooCommerce 下單工具 -------------------- */
async function postOrder({ url, payload, ck, cs, useQueryAuth = false }) {
  const endpoint = `${url}/wp-json/wc/v3/orders${
    useQueryAuth
      ? `?consumer_key=${encodeURIComponent(ck)}&consumer_secret=${encodeURIComponent(cs)}`
      : ""
  }`;

  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (!useQueryAuth) headers.Authorization = `Basic ${b64(`${ck}:${cs}`)}`;

  const r = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

/* ------------------- WhatsApp 發送工具 ------------------- */
async function sendWhatsappText({ to, body }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const target = String(to || process.env.WHATSAPP_TO || "").replace(/[^\d]/g, "");

  if (!token || !phoneId || !target) {
    console.warn("[WA] env not ready, skip send:", { hasToken: !!token, phoneId, target });
    return { ok: false, skipped: true };
  }

  const resp = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: target,
      type: "text",
      text: { body },
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(`[WA] ${resp.status} ${JSON.stringify(data)}`);
  return { ok: true, data };
}

/* --------------------------- Handler --------------------------- */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  try {
    const { cart = [], form = {}, shipping_fee = 0, tax = 0 } = req.body || {};

    const WC_URL = ensureURL(process.env.WC_URL);
    const WC_CK = process.env.WC_CK;
    const WC_CS = process.env.WC_CS;

    if (!WC_URL || !WC_CK || !WC_CS) {
      return res.status(500).json({ ok: false, message: "WooCommerce 環境變數未設定" });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, message: "購物車為空" });
    }

    // === 商品 ===
    const line_items = cart.map((it) => ({
      product_id: Number(it.id),
      quantity: Number(it.qty || 1),
    }));

    // === 付款方式 ===
    const { slug: payment_method, title: payment_method_title } = mapPaymentSlug(form.payment);

    // === 地址 ===
    const billing = {
      first_name: sanitize(form.name),
      last_name: "",
      address_1: sanitize(form.address),
      city: sanitize(form.city),
      country: "CA",
      email: sanitize(form.email),
      phone: sanitize(form.phone),
    };

    const shipping = { ...billing };

    // === 計算金額 ===
    const subtotal = cart.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1),
      0
    );
    const shipFee = Number(shipping_fee || 0);
    const taxAmount = Number(tax || 0);
    const total = subtotal + shipFee + taxAmount;

    const customer_note = [
      `來源：Next.js Checkout`,
      `付款方式：${form.payment}`,
      `小計：NT$ ${subtotal.toLocaleString()}`,
      `運費：NT$ ${shipFee.toLocaleString()}`,
      `稅金：NT$ ${taxAmount.toLocaleString()}`,
      `總計：NT$ ${total.toLocaleString()}`,
    ].join("\n");

    const orderPayload = {
      payment_method,
      payment_method_title,
      set_paid: false,
      status: "pending",
      billing,
      shipping,
      line_items,
      meta_data: [
        { key: "_subtotal_ntd", value: subtotal },
        { key: "_shipping_fee_ntd", value: shipFee },
        { key: "_tax_ntd", value: taxAmount },
        { key: "_total_ntd", value: total },
      ],
      customer_note,
    };

    // === Woo 下單 ===
    let resp = await postOrder({
      url: WC_URL,
      payload: orderPayload,
      ck: WC_CK,
      cs: WC_CS,
    });

    if (!resp.ok && [401, 403, 404].includes(resp.status)) {
      resp = await postOrder({
        url: WC_URL,
        payload: orderPayload,
        ck: WC_CK,
        cs: WC_CS,
        useQueryAuth: true,
      });
    }

    if (!resp.ok) {
      return res.status(resp.status || 400).json({
        ok: false,
        message: resp?.data?.message || "WooCommerce 建立訂單失敗",
        detail: resp.data,
      });
    }

    const order = resp.data;

    /* ------------------- WhatsApp 通知老闆 ------------------- */
    const lines = cart
      .map((it) => `• ${it.name} × ${it.qty} ＝ NT$ ${(it.price * it.qty).toLocaleString()}`)
      .join("\n");

    const waMsg = [
      "🍺 新訂單通知",
      `#${order?.id || ""}`,
      "",
      `👤 客戶：${billing.first_name} / ${billing.phone}`,
      `✉️ Email：${billing.email}`,
      `📍 地址：${billing.address_1}`,
      `💳 付款：${payment_method_title}`,
      "",
      "🧾 商品明細：",
      lines,
      "",
      `小計：NT$ ${subtotal.toLocaleString()}`,
      `運費：NT$ ${shipFee.toLocaleString()}`,
      `稅金：NT$ ${taxAmount.toLocaleString()}`,
      `總計：NT$ ${total.toLocaleString()}`,
    ].join("\n");

    try {
      await sendWhatsappText({ body: waMsg });
    } catch (err) {
      console.warn("WhatsApp send failed:", err.message);
    }

    /* ------------------- 回傳結果 ------------------- */
    return res.status(200).json({ ok: true, order });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ ok: false, message: String(err) });
  }
}
