// pages/api/store/products/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  const base = process.env.WC_URL;
  if (!base) return res.status(500).json({ ok: false, message: "WC_URL 未設定" });

  try {
    const r = await fetch(`${base}/wp-json/wc/store/products/${id}`, {
      headers: { Accept: "application/json" },
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, message: String(e) });
  }
}
