// lib/wcServer.js
import qs from "querystring";

const BASE =
  (process.env.WC_URL?.replace(/\/$/, "") || "") + "/wp-json/wc/v3";

function withCred(url, extraQuery = {}) {
  const hasHttp = /^https?:\/\//i.test(url);
  const u = new URL(hasHttp ? url : BASE + url);
  u.searchParams.set("consumer_key", process.env.WC_CK || "");
  u.searchParams.set("consumer_secret", process.env.WC_CS || "");
  Object.entries(extraQuery || {}).forEach(([k, v]) => {
    if (v != null) u.searchParams.set(k, String(v));
  });
  return u.toString();
}

async function call(method, path, { query, body } = {}) {
  const url = withCred(path, query);
  const res = await fetch(url, {
    method,
    headers: body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
    // 可視需要設定 timeout / agent
    cache: "no-store",
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.message_html)) ||
      `WooCommerce ${method} ${path} error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const wcGet = (path, opts) => call("GET", path, opts);
export const wcPost = (path, opts) => call("POST", path, opts);
export const wcPut = (path, opts) => call("PUT", path, opts);
export const wcDelete = (path, opts) => call("DELETE", path, opts);
