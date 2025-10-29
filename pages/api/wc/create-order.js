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

// 轉台灣門號為 E.164
function toE164TW(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("886")) return digits;
  return "886" + digits.replace(/^0+/, "");
}

// （可選）含中日韓偵測：若你之後在相同模板名下加了 zh_TW 翻譯，可自動切語言
function pickLang(strs) {
  const cjk = /[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
  return strs.some((s) => cjk.test(String(s || ""))) ? "zh_TW" : "en_US";
}

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

/* ------------------- WhatsApp：發「範本」訊息 ------------------- */
async function sendWaTemplate({ to, params, lang }) {
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WABA_TOKEN = process.env.WHATSAPP_TOKEN;
  const TEMPLATE_NAME = process.env.WA_TEMPLATE_NAME || "memory_corner";
  const TEMPLATE_LANG = lang || process.env.WA_TEMPLATE_LANG || "en_US";

  if (!PHONE_NUMBER_ID || !WABA_TOKEN) {
    throw new Error("Missing WhatsApp env vars (PHONE_NUMBER_ID / TOKEN)");
  }
  const target = String(to || "").replace(/[^\d]/g, "");
  if (!target) throw new Error("Missing target phone");

  const payload = {
    messaging_product: "whatsapp",
    to: target,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANG },
      components: [
        {
          type: "body",
          parameters: params.map((t) => ({ type: "text", text: String(t ?? "") })),
        },
      ],
    },
  };

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
    const msg = data?.error?.message || "WA error";
    const err = new Error(msg);
    err.detail = data;
    throw err;
  }
  return data;
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

    /* ------------------- WhatsApp：伺服器端送「範本」 ------------------- */
    const areaLabel = form?.deliveryArea || "";
    const fullAddress = `${areaLabel} ${form?.deliveryAddress || ""}`.trim();
    const amountText = `NT$ ${Number(total || 0).toLocaleString()}`;

    // 對應模板 {{1}}..{{6}}
    const params = [
      billing.first_name || "",        // {{1}} Name
      String(order?.id || ""),         // {{2}} Order ID
      amountText,                      // {{3}} Amount
      areaLabel,                       // {{4}} Delivery area
      fullAddress,                     // {{5}} Address
      payment_method_title || "",      // {{6}} Payment
    ];

    // 語言：若你還沒建立 zh_TW 版模板，先固定 en_US
    const lang = (process.env.WA_TEMPLATE_LANG || "en_US") || pickLang(params);

    const STAFF_WA = (process.env.WA_STAFF_NUMBER || "886939767977").replace(/[^\d]/g, "");
    const SEND_TO_CUSTOMER = (process.env.SEND_TO_CUSTOMER || "false").toLowerCase() === "true";
    const customerTo = toE164TW(form?.phone);

    const tasks = [];
    // 1) 通知老闆
    tasks.push(
      sendWaTemplate({ to: STAFF_WA, params, lang })
        .then((r) => ({ role: "staff", ok: true, result: r }))
        .catch((e) => ({ role: "staff", ok: false, message: e.message, detail: e.detail }))
    );
    // 2) 通知客人（可選）
    if (SEND_TO_CUSTOMER && customerTo) {
      tasks.push(
        sendWaTemplate({ to: customerTo, params, lang })
          .then((r) => ({ role: "customer", ok: true, result: r }))
          .catch((e) => ({ role: "customer", ok: false, message: e.message, detail: e.detail }))
      );
    }

    const waResults = await Promise.all(tasks);

    /* ------------------- 回傳結果 ------------------- */
    return res.status(200).json({ ok: true, order, whatsapp: waResults });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ ok: false, message: String(err?.message || err) });
  }
}
