// /lib/wc.js
import axios from "axios";

const baseURL = process.env.WC_BASE_URL?.replace(/\/+$/, "") + "/wp-json/wc/v3";

export const wc = axios.create({
  baseURL,
  auth: {
    username: process.env.WC_CONSUMER_KEY,
    password: process.env.WC_CONSUMER_SECRET,
  },
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// 以 email 取得 Woo 顧客資料（若多筆，取第一筆）
export async function getCustomerByEmail(email) {
  const { data } = await wc.get("/customers", { params: { email } });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// 以 id 取得顧客
export async function getCustomerById(id) {
  const { data } = await wc.get(`/customers/${id}`);
  return data;
}
