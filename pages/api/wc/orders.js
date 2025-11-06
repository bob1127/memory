// /pages/api/wc/orders.js
import { wc, getCustomerByEmail } from "../../../lib/wc";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

    const email = String(req.query.email || req.headers["x-user-email"] || "").trim();
    let customerId = req.query.customerId ? Number(req.query.customerId) : undefined;

    if (!customerId) {
      if (!email) return res.status(400).json({ message: "缺少 email 或 customerId" });
      const customer = await getCustomerByEmail(email);
      if (!customer) return res.status(404).json({ message: "找不到對應顧客" });
      customerId = customer.id;
    }

    const page = Number(req.query.page || 1);
    const per_page = Number(req.query.per_page || 20);

    const { data } = await wc.get("/orders", {
      params: {
        customer: customerId,
        page,
        per_page,
        orderby: "date",
        order: "desc",
      },
    });

    const orders = data.map((o) => ({
      id: o.id,
      number: o.number,
      date_created: o.date_created,
      status: o.status,
      total: o.total,
      currency: o.currency,
      line_items: o.line_items?.map((li) => ({
        id: li.id,
        name: li.name,
        quantity: li.quantity,
        total: li.total,
      })) || [],
    }));

    return res.json({ ok: true, orders });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "server error", error: String(e?.message || e) });
  }
}
