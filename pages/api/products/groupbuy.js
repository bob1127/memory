export default async function handler(req, res) {
  try {
    const base = process.env.WC_URL;
    const ck = process.env.WC_CK;
    const cs = process.env.WC_CS;

    const wpLang = req.query.lang || "zh_TW";

    const catURL = new URL(
      `${ensureURL(base)}/wp-json/wc/store/products/categories`
    );
    catURL.searchParams.set("per_page", "100");
    catURL.searchParams.set("lang", wpLang);

    const catRes = await fetch(catURL.toString(), {
      headers: { Accept: "application/json" },
    });
    const catsRaw = await catRes.json();
    const cats = Array.isArray(catsRaw) ? catsRaw : [];

    const filteredCats = cats.filter((c) => c?.id);

    const categoriesWithProducts = [];
    const allIds = [];

    for (const cat of filteredCats) {
      const storeURL = new URL(`${ensureURL(base)}/wp-json/wc/store/products`);
      storeURL.searchParams.set("per_page", "100");
      storeURL.searchParams.set("category", String(cat.id));
      storeURL.searchParams.set("lang", wpLang);

      const r = await fetch(storeURL.toString(), {
        headers: { Accept: "application/json" },
      });
      const rawList = await r.json();
      const list = Array.isArray(rawList) ? rawList : [];

      list.forEach((p) => p?.id && allIds.push(p.id));

      categoriesWithProducts.push({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        products: list,
      });
    }

    // v3 meta
    let metaMap = new Map();
    const uniqueIds = Array.from(new Set(allIds)).slice(0, 500);

    if (uniqueIds.length && ck && cs) {
      const chunks = chunkArray(uniqueIds, 80);
      for (const ids of chunks) {
        const v3 = new URL(`${ensureURL(base)}/wp-json/wc/v3/products`);
        v3.searchParams.set("include", ids.join(","));
        v3.searchParams.set("per_page", String(ids.length));
        v3.searchParams.set(
          "_fields",
          "id,meta_data,name,short_description,sku,translations"
        );
        v3.searchParams.set("lang", wpLang);

        const vr = await fetch(v3.toString(), {
          headers: {
            Accept: "application/json",
            Authorization: basicAuth(ck, cs),
          },
        });

        if (vr.ok) {
          const v3data = await vr.json();
          (Array.isArray(v3data) ? v3data : []).forEach((it) =>
            metaMap.set(it.id, {
              name: it.name,
              short_description: it.short_description,
              sku: it.sku,
              translations: it.translations,
            })
          );
        }
      }
    }

    const categories = categoriesWithProducts.map((cat) => {
      const products = (cat.products || []).map((p) => {
        const detail = metaMap.get(p.id) || {};
        if (!p.extensions) p.extensions = {};
        if (!p.extensions.custom_acf) p.extensions.custom_acf = {};
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
        if (imgSrc && !imgSrc.startsWith("http"))
          imgSrc = `${ensureURL(base)}${imgSrc}`;
        p.img = imgSrc || "/images/placeholder.png";

        return p;
      });

      return { ...cat, products };
    });

    return res.status(200).json({ ok: true, categories });
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
