// pages/api/wc/create-order.js

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
  // 預設
  return { slug: "cod", title: t || "貨到付款" };
}

const ensureURL = (u) => (u || "").replace(/\/+$/, "");
const sanitize = (v) => (typeof v === "string" ? v.trim() : "");

// 封裝下單請求（可選 Basic 或 query auth）
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  try {
    const { cart = [], form = {} } = req.body || {};

    // === 環境檢查 ===
    const WC_URL = ensureURL(process.env.WC_URL);
    const WC_CK = process.env.WC_CK;
    const WC_CS = process.env.WC_CS;

    if (!WC_URL || !WC_CK || !WC_CS) {
      return res.status(500).json({
        ok: false,
        message: "WooCommerce 環境變數未設定（請確認 WC_URL/WC_CK/WC_CS）",
      });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, message: "購物車為空" });
    }

    // === line_items ===
    const line_items = cart.map((it) => {
      const pid = Number(it.id);
      if (!Number.isFinite(pid) || pid <= 0) {
        throw new Error(
          `商品 ${it.name || "(未命名)"} 的 id 不是有效的 Woo product_id：${it.id}`
        );
      }
      return { product_id: pid, quantity: Number(it.qty || 1) };
    });

    // === 付款方式對照 ===
    const { slug: payment_method, title: payment_method_title } = mapPaymentSlug(form.payment);

    // 取前端送來的外送資訊
    const deliveryArea = sanitize(form.deliveryArea);
    const deliverySlot = sanitize(form.deliverySlot);

    // === 帳單/寄送 ===（city 若沒填就帶入外送地區，方便後台檢視）
    const billing = {
      first_name: sanitize(form.name),
      last_name: "",
      address_1: sanitize(form.address),
      address_2: "",
      city: sanitize(form.city) || deliveryArea,
      state: "",
      postcode: "",
      country: "TW",
      email: sanitize(form.email),
      phone: sanitize(form.phone),
    };
    const shipping = {
      first_name: sanitize(form.name),
      last_name: "",
      address_1: sanitize(form.address),
      address_2: "",
      city: sanitize(form.city) || deliveryArea,
      state: "",
      postcode: "",
      country: "TW",
    };

    // === 備註/自訂欄位 ===
    const meta_data = [
      { key: "wechat", value: sanitize(form.wechat) },
      { key: "contact_other", value: sanitize(form.contactOther) },
      { key: "subscribe_newsletter", value: !!form.subscribe },
      { key: "frontend_source", value: "Next.js custom checkout (Pages)" },
    ];
    if (deliveryArea) meta_data.push({ key: "delivery_area", value: deliveryArea });
    if (deliverySlot) meta_data.push({ key: "delivery_slot", value: deliverySlot });

    const customer_note =
      `來源：自訂結帳頁\n` +
      `付款方式：${sanitize(form.payment) || "未選"}\n` +
      (deliveryArea ? `外送地區：${deliveryArea}\n` : "") +
      (deliverySlot ? `外送日期/時段：${deliverySlot}\n` : "") +
      (form.wechat ? `WeChat：${sanitize(form.wechat)}\n` : "") +
      (form.contactOther ? `其他聯絡：${sanitize(form.contactOther)}\n` : "");

    // === 訂單 payload ===
    const orderPayload = {
      payment_method,
      payment_method_title,
      set_paid: false,   // 沒串金流 → false
      status: "pending",
      billing,
      shipping,
      line_items,
      meta_data,
      customer_note,
    };

    // 先嘗試 Basic Auth
    let resp = await postOrder({
      url: WC_URL,
      payload: orderPayload,
      ck: WC_CK,
      cs: WC_CS,
      useQueryAuth: false,
    });

    // 若 Basic 失敗（共享主機常見）→ 用 query auth 再試
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
        message: resp?.data?.message || "Woo 端建立訂單失敗",
        detail: resp.data,
      });
    }

    return res.status(200).json({ ok: true, order: resp.data });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({
      ok: false,
      message: "伺服器處理失敗",
      error: String(err?.message || err),
    });
  }
}
