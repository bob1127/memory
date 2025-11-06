// /pages/api/wc/me.js
import { getCustomerByEmail, getCustomerById } from "../../../lib/wc";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

    // 前端會把 email 帶上來（你也可以改成從 cookie/session 取得）
    const email = String(req.query.email || req.headers["x-user-email"] || "").trim();
    const cid   = req.query.customerId ? Number(req.query.customerId) : undefined;

    if (!email && !cid) return res.status(400).json({ message: "email 或 customerId 必填其一" });

    let customer = null;
    if (cid) customer = await getCustomerById(cid);
    else     customer = await getCustomerByEmail(email);

    if (!customer) return res.status(404).json({ message: "找不到對應顧客" });

    return res.json({
      ok: true,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        username: customer.username,
        billing: customer.billing || {},
        shipping: customer.shipping || {},
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error", error: String(e?.message || e) });
  }
}
