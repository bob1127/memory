// pages/api/products/beer.js
export default async function handler(req, res) {
  const WC_URL = process.env.WC_URL;
  const WC_CK = process.env.WC_CK;
  const WC_CS = process.env.WC_CS;

  try {
    // 第一步：找出分類 ID（slug = beer）
    const catRes = await fetch(
      `${WC_URL}/wp-json/wc/v3/products/categories?slug=beer&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
    );
    if (!catRes.ok) throw new Error("無法取得分類資料");

    const cats = await catRes.json();
    if (!cats.length) throw new Error("找不到分類：beer");
    const catId = cats[0].id;

    // 第二步：抓取該分類下的產品
    const prodRes = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?category=${catId}&per_page=50&consumer_key=${WC_CK}&consumer_secret=${WC_CS}`
    );
    if (!prodRes.ok) throw new Error("無法取得產品資料");

    const products = await prodRes.json();

    // 第三步：簡化欄位
    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      img: p.images?.[0]?.src || "",
      description: p.short_description || "",
    }));

    res.status(200).json({ ok: true, items: mapped });
  } catch (err) {
    console.error("❌ WooCommerce API 錯誤：", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
