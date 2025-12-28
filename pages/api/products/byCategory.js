export default async function handler(req, res) {
  try {
    const base = process.env.WC_URL;
    const ck = process.env.WC_CK;
    const cs = process.env.WC_CS;

    const categoryId = req.query.categoryId;
    const wpLang = req.query.lang || "zh_TW";
    if (!categoryId) return res.status(400).json({ ok: false, error: "missing_categoryId" });

    // 1) store products
    const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
    storeURL.searchParams.set("per_page", "100");
    storeURL.searchParams.set("category", String(categoryId));
    storeURL.searchParams.set("lang", wpLang);

    const r = await fetch(storeURL.toString(), {
      headers: { Accept: "application/json" },
    });

    const rawList = await r.json();
    const list = Array.isArray(rawList) ? rawList : [];

    const ids = list.map((p) => p?.id).filter(Boolean).slice(0, 200);

    // 2) v3 meta
    const metaMap = new Map();

    if (ids.length && ck && cs) {
      const chunks = chunkArray(ids, 80);
      for (const part of chunks) {
        const v3 = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
        v3.searchParams.set("include", part.join(","));
        v3.searchParams.set("per_page", String(part.length));
        v3.searchParams.set("_fields", "id,name,short_description,sku,translations");
        v3.searchParams.set("lang", wpLang);

        const vr = await fetch(v3.toString(), {
          headers: {
            Accept: "application/json",
            Authorization: basicAuth(ck, cs),
          },
        });

        if (vr.ok) {
          const v3data = await vr.json();
          (Array.isArray(v3data) ? v3data : []).forEach((it) => {
            metaMap.set(it.id, {
              name: it.name,
              short_description: it.short_description,
              sku: it.sku,
              translations: it.translations,
            });
          });
        }
      }
    }

    // 3) merge
    const items = list.map((p) => {
      const detail = metaMap.get(p.id) || {};

      if (!p.extensions) p.extensions = {};
      if (!p.extensions.custom_acf) p.extensions.custom_acf = {};

      // 這裡延用你 beer 頁做法：把 v3 的 name/desc 當成 en 的資料來源
      p.extensions.custom_acf.en_product_name = detail.name || p.name;
      p.extensions.custom_acf.en_description =
        detail.short_description || p.short_description || "";

      p.sku = detail.sku || "";

      let linkedChineseId = p.id;
      if (wpLang === "en") {
        const zhId = detail.translations?.zh || detail.translations?.zh_TW;
        if (zhId) linkedChineseId = zhId;
      }
      p.linkedChineseId = linkedChineseId;

      let imgSrc = p.images?.[0]?.src;
      if (imgSrc && !imgSrc.startsWith("http")) imgSrc = `${ensureURL(base)}${imgSrc}`;
      p.img = imgSrc || "/images/placeholder.png";

      return p;
    });

    return res.status(200).json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}

function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
function basicAuth(ck, cs) {
  return "Basic " + Buffer.from(`${ck}:${cs}`).toString("base64");
}
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
