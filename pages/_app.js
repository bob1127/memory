// pages/_app.js
import "../src/globals.css";
import { useEffect } from "react"; // 保留 useEffect
// ❌ 移除 import AOS from "aos";
// ❌ 移除 import "aos/dist/aos.css";
import { useRouter } from "next/router";
import { NextUIProvider } from "@nextui-org/react";
import { AuthProvider } from "../components/AuthProvider";
import { CartProvider } from "../components/context/CartContext";
import FloatingSidebar from "../components/FloatingSidebar";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // ❌ 移除整個 AOS 相關的 useEffect 區塊
  /*
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true, offset: 50 });
    const onRouteDone = () => AOS.refresh();
    router.events.on("routeChangeComplete", onRouteDone);
    return () => router.events.off("routeChangeComplete", onRouteDone);
  }, [router.events]);
  */

  return (
    <AuthProvider>
      <NextUIProvider>
        {/* ✅ 用 Portal 掛在 body，不受任何 transform 影響 */}
        <FloatingSidebar />

        {/* 你的頁面內容 */}
        <div className="bg-[url('/images/mec_bg-tile.png')] bg-center">
          <CartProvider>
            <Component {...pageProps} />
          </CartProvider>
        </div>
      </NextUIProvider>
    </AuthProvider>
  );
}

export default MyApp;