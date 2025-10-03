// pages/api/store/products.js
export default async function handler(req, res) {
  const { page = 1, per_page = 24, search = "" } = req.query;
  const base = process.env.WC_URL;
  if (!base) return res.status(500).json({ ok: false, message: "WC_URL 未設定" });

  const url = new URL(`${base}/wp-json/wc/store/products`);
  url.searchParams.set("page", page);
  url.searchParams.set("per_page", per_page);
  if (search) url.searchParams.set("search", search);

  try {
    const r = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, message: String(e) });
  }
}
