// pages/api/account/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";

const WC_URL = process.env.WC_URL!;
const CK = process.env.WC_CK!;
const CS = process.env.WC_CS!;

function wcUrl(path: string, params: Record<string, any> = {}) {
  const u = new URL(`${WC_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) u.searchParams.set(k, String(v));
  }
  u.searchParams.set("consumer_key", CK);
  u.searchParams.set("consumer_secret", CS);
  return u.toString();
}

async function fetchAllPaged(basePathWithQuery: string) {
  const out: any[] = [];
  let page = 1;
  while (true) {
    const u = new URL(basePathWithQuery);
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", "20");
    const r = await fetch(u.toString());
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j?.message || `Woo API ${r.status}`);
    }
    const arr = await r.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    out.push(...arr);
    if (arr.length < 20) break;
    if (++page > 15) break;
  }
  return out;
}

async function fetchProductsByIds(ids: number[]) {
  if (ids.length === 0) return new Map<number, any>();
  const idChunks: number[][] = [];
  for (let i = 0; i < ids.length; i += 50) idChunks.push(ids.slice(i, i + 50));

  const map = new Map<number, any>();
  for (const chunk of idChunks) {
    const url = wcUrl("/wp-json/wc/v3/products", {
      include: chunk.join(","),
      per_page: 50,
    });
    const r = await fetch(url);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j?.message || `Fetch products failed ${r.status}`);
    }
    const arr = await r.json();
    for (const p of arr) map.set(p.id, p);
  }
  return map;
}

async function fetchVariationImage(productId: number, variationId: number) {
  const url = wcUrl(`/wp-json/wc/v3/products/${productId}/variations/${variationId}`);
  const r = await fetch(url);
  if (!r.ok) return null;
  const v = await r.json();
  const src = v?.image?.src || null;
  return src;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const { customerId, email } = req.query as { customerId?: string; email?: string };
    let orders: any[] = [];

    // 1) 以 customer ID 撈
    if (customerId) {
      const base = wcUrl("/wp-json/wc/v3/orders", { customer: customerId });
      orders = await fetchAllPaged(base);
    }

    // 2) 沒結果用 email 補撈（search 後再用 billing.email 過濾）
    if ((!orders || orders.length === 0) && email) {
      const base = wcUrl("/wp-json/wc/v3/orders", { search: email });
      const arr = await fetchAllPaged(base);
      orders = arr.filter(
        (o) =>
          String(o?.billing?.email || "").toLowerCase() ===
          String(email).toLowerCase()
      );
    }

    // 3) 取所有商品 / 變體 id
    const productIds = new Set<number>();
    const variantPairs = new Set<string>();
    for (const o of orders) {
      for (const li of o?.line_items || []) {
        if (li.product_id) productIds.add(Number(li.product_id));
        if (li.product_id && li.variation_id) {
          variantPairs.add(`${li.product_id}:${li.variation_id}`);
        }
      }
    }

    // 4) 批次抓商品，做映射
    const productMap = await fetchProductsByIds(Array.from(productIds));
    const productImg = new Map<number, string>();
    // @ts-ignore
    for (const [pid, p] of productMap.entries()) {
      const src = p?.images?.[0]?.src || "";
      if (src) productImg.set(pid, src);
    }

    // 5) 逐一抓有變體圖的情況（若無則 fallback 商品圖）
    const variationImg = new Map<string, string>();
    const variations = Array.from(variantPairs);
    // 可視情況限制併發，這裡數量通常不大
    await Promise.all(
      variations.map(async (key) => {
        const [pidStr, vidStr] = key.split(":");
        const pid = Number(pidStr);
        const vid = Number(vidStr);
        const src = await fetchVariationImage(pid, vid);
        if (src) variationImg.set(key, src);
      })
    );

    // 6) 將圖片塞回 line_items
    for (const o of orders) {
      for (const li of o?.line_items || []) {
        let img = "";
        if (li.product_id && li.variation_id) {
          const key = `${li.product_id}:${li.variation_id}`;
          img = variationImg.get(key) || "";
        }
        if (!img && li.product_id) {
          img = productImg.get(Number(li.product_id)) || "";
        }
        (li as any).image = img; // ← 前端就能用了
      }
    }

    // 7) 新到舊
    orders.sort(
      (a, b) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );

    return res.status(200).json({ ok: true, data: orders });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
