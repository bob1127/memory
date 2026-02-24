// pages/api/wc/create-order.js

/* =================================================================
   1. LINE 通知發送函式 (無 Emoji / 依照 WP 後台格式)
   ================================================================= */
async function sendLineNotification(order, cartItems = []) {
  // --- A. 取得設定 ---
  const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
  
  // 安全的字串轉陣列 Helper
  const getIds = (str) => (str || "").split(",").map(s => s.trim()).filter(s => s);
  
  const beerAdmins = getIds(process.env.LINE_ADMIN_IDS_BEER);
  const groupBuyAdmins = getIds(process.env.LINE_ADMIN_IDS_GROUPBUY);

  // --- B. 判斷受眾 ---
  const hasBeer = cartItems.some(item => item.store_type === 'beer');
  const hasGroupBuy = cartItems.some(item => item.store_type === 'group_buy');

  let targetIds = new Set();
  if (hasGroupBuy) groupBuyAdmins.forEach(id => targetIds.add(id));
  // 預設或啤酒訂單都通知啤酒管理員
  if (hasBeer || (!hasGroupBuy && !hasBeer)) {
    beerAdmins.forEach(id => targetIds.add(id));
  }

  const toList = Array.from(targetIds);
  if (toList.length === 0) {
    console.log("⚠️ [LINE] 未設定接收者 ID，略過發送");
    return;
  }

  // --- C. 準備資料 (參照 WP 後台截圖) ---
  
  // 1. 類型標籤
  let typeLabel = "一般訂單";
  if (hasBeer && hasGroupBuy) typeLabel = "啤酒 + 團購";
  else if (hasBeer) typeLabel = "啤酒商城";
  else if (hasGroupBuy) typeLabel = "團購網";

  // 2. 商品明細格式化
  const itemsList = order.line_items.map(item => {
    return `- ${item.name} x ${item.quantity} ($${item.total})`;
  }).join('\n');

  // 3. 金額計算 (轉成數字以防出錯)
  const total = parseFloat(order.total || 0);
  const shipping = parseFloat(order.shipping_total || 0);
  const tax = parseFloat(order.total_tax || 0);
  // 反推小計 (WooCommerce API 通常不直接給小計)
  const subtotal = total - shipping - tax;

  // 4. 組合訊息 (純文字風格)
  const messageText = `[新訂單] ${typeLabel} #${order.id}

建立日期: ${order.date_created.replace('T', ' ').substring(0, 16)}
付款狀態: ${order.status === 'on-hold' ? '等待付款中' : order.status}
付款方式: ${order.payment_method_title}

【顧客資訊】
姓名: ${order.billing.first_name} ${order.billing.last_name}
電話: ${order.billing.phone}
Email: ${order.billing.email}

【運送資訊】
方式: ${order.shipping_lines?.[0]?.method_title || '未選擇'}
地址: ${order.shipping.city}, ${order.shipping.address_1}

【訂單內容】
${itemsList}

------------------------------
項目小計: $${subtotal.toFixed(2)}
運送方式: $${shipping.toFixed(2)}
費用(稅): $${tax.toFixed(2)}
------------------------------
訂單總額: $${total.toFixed(2)} ${order.currency}

請至網站後台查看詳細資訊。`;

  // --- D. 發送請求 ---
  try {
    const res = await fetch('https://api.line.me/v2/bot/message/multicast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: toList,
        messages: [{ type: "text", text: messageText }]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("❌ [LINE API Error]:", JSON.stringify(err));
    } else {
      console.log(`✅ [LINE Success]: 通知已發送給 ${toList.length} 位管理員 (Order #${order.id})`);
    }
  } catch (error) {
    console.error("❌ [LINE System Error]:", error);
  }
}

/* =================================================================
   2. 輔助函式
   ================================================================= */
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

/* =================================================================
   3. API 主程式 (Handler)
   ================================================================= */
/* =================================================================
   3. API 主程式 (Handler)
   ================================================================= */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    // 💡 這裡新增接收 fulfillment_method 參數
    const { cart = [], form = {}, shipping_fee = 0, tax = 0, customerId, fulfillment_method } = req.body || {};
    const { email = "", phone = "", name = "", deliveryAddress = "" } = form || {};

    // 基本驗證
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, message: "購物車為空" });
    }
    if (!email || !name) {
      return res.status(400).json({ ok: false, message: "缺少 Email 或 姓名" });
    }

    // 環境變數檢查
    const { WC_URL, WC_CK, WC_CS } = process.env;
    if (!WC_URL || !WC_CK || !WC_CS) {
      console.error("缺少 WC 環境變數");
      return res.status(500).json({ ok: false, message: "Server Configuration Error" });
    }

    const { first_name, last_name } = splitName(name);

    // 準備 WooCommerce Payload
    const billing = {
      first_name,
      last_name,
      email,
      phone,
      address_1: String(deliveryAddress || "").trim(),
      city: "Vancouver", // 預設城市，可根據前端傳來的資料調整
      country: "CA",
    };

    const shipping = {
      first_name,
      last_name,
      address_1: String(deliveryAddress || "").trim(),
      city: "Vancouver",
      country: "CA",
    };

    const line_items = cart.map((it) => ({
      product_id: Number(it.productId || it.id), // 確保抓到正確 ID
      quantity: Number(it.qty || 1),
    }));

    // 💡 修正運送方式判定：不管運費是不是 0，都根據前端傳來的 method 給予正確的標題
    let shipping_lines = [];
    if (fulfillment_method === "pickup") {
      shipping_lines = [{ 
        method_id: "local_pickup", 
        method_title: "來店自取 (Store Pickup)", 
        total: "0" 
      }];
    } else if (fulfillment_method === "delivery") {
      shipping_lines = [{ 
        method_id: "flat_rate", 
        method_title: "外送宅配 (Delivery)", 
        total: String(shipping_fee) 
      }];
    } else {
      // 預防萬一的 Fallback
      if (Number(shipping_fee) > 0) {
        shipping_lines = [{ method_id: "flat_rate", method_title: "Flat rate", total: String(shipping_fee) }];
      }
    }

    const fee_lines = Number(tax) > 0
        ? [{ name: "Tax", total: String(tax) }]
        : [];

    const payload = {
      payment_method: "bacs",
      payment_method_title: "Direct Bank Transfer",
      set_paid: false,
      billing,
      shipping,
      line_items,
      shipping_lines, // 這裡會把設定好的運送方式傳給 Woo
      fee_lines,
    };

    if (customerId) {
      payload.customer_id = Number(customerId);
    }

    // 發送 Woo 建單請求
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

    // 嘗試解析回傳資料
    let data;
    try {
      data = await r.json();
    } catch (parseErr) {
      console.error("Woo API 回傳非 JSON:", parseErr);
      return res.status(502).json({ ok: false, message: "WooCommerce API Error (Invalid JSON)" });
    }

    if (!r.ok) {
      console.error("Woo 建單失敗:", data);
      return res.status(r.status).json({
        ok: false,
        message: `Woo 建單失敗 ${r.status}`,
        detail: data,
      });
    }

    // 🟢 成功後發送 LINE 通知
    // 因為上面有寫入 shipping_lines，這裡產生的 data.shipping_lines 就不會是空的了！
    await sendLineNotification(data, cart);

    // 回傳成功
    return res.status(200).json({ ok: true, order: data });

  } catch (e) {
    console.error("Create Order Exception:", e);
    return res.status(500).json({ ok: false, message: String(e?.message || e) });
  }
}