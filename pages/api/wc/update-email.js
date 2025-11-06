// /pages/api/wc/update-email.js
import { wc, getCustomerByEmail } from "../../../lib/wc";

export default async function handler(req, res) {
  try {
    if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

    const { customerId, currentEmail, newEmail } = req.body || {};
    if (!newEmail) return res.status(400).json({ message: "newEmail 必填" });

    let id = customerId ? Number(customerId) : undefined;
    if (!id) {
      if (!currentEmail) return res.status(400).json({ message: "缺少 customerId 或 currentEmail" });
      const customer = await getCustomerByEmail(String(currentEmail).trim());
      if (!customer) return res.status(404).json({ message: "找不到對應顧客" });
      id = customer.id;
    }

    const { data } = await wc.put(`/customers/${id}`, { email: String(newEmail).trim() });

    // 回傳更新後基本資料
    return res.json({
      ok: true,
      customer: { id: data.id, email: data.email, first_name: data.first_name, last_name: data.last_name },
    });
  } catch (e) {
    console.error(e);
    // Woo 可能回 400：Email 已存在
    return res.status(500).json({ message: "update error", error: String(e?.response?.data || e?.message || e) });
  }
}
