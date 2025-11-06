// pages/api/account/me.ts
import type { NextApiRequest, NextApiResponse } from "next";

const WC_URL = process.env.WC_URL!; // 例: https://inf.fjg.mybluehost.me/website_da164f68
const CK = process.env.WC_CK!;
const CS = process.env.WC_CS!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { id, email } = req.query as { id?: string; email?: string };
      let data: any = null;

      if (id) {
        const r = await fetch(
          `${WC_URL}/wp-json/wc/v3/customers/${encodeURIComponent(id)}?consumer_key=${encodeURIComponent(
            CK
          )}&consumer_secret=${encodeURIComponent(CS)}`
        );
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          return res.status(r.status).json({ ok: false, error: j?.message || "顧客不存在" });
        }
        data = await r.json();
      } else if (email) {
        const r = await fetch(
          `${WC_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(
            email
          )}&per_page=1&consumer_key=${encodeURIComponent(CK)}&consumer_secret=${encodeURIComponent(CS)}`
        );
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          return res.status(r.status).json({ ok: false, error: j?.message || "查詢顧客失敗" });
        }
        const arr = await r.json();
        data = Array.isArray(arr) && arr[0] ? arr[0] : null;
      } else {
        return res.status(400).json({ ok: false, error: "缺少 id 或 email" });
      }

      return res.status(200).json({ ok: true, data });
    }

    if (req.method === "PUT") {
      const { id, email } = req.body || {};
      if (!id || !email) return res.status(400).json({ ok: false, error: "缺少 id 或 email" });

      const r = await fetch(
        `${WC_URL}/wp-json/wc/v3/customers/${encodeURIComponent(id)}?consumer_key=${encodeURIComponent(
          CK
        )}&consumer_secret=${encodeURIComponent(CS)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const j = await r.json();
      if (!r.ok) return res.status(r.status).json({ ok: false, error: j?.message || "更新失敗" });
      return res.status(200).json({ ok: true, data: j });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
