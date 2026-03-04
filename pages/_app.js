// pages/_app.js
import "../src/globals.css";
import { useEffect } from "react"; // 保留 useEffect
import Head from 'next/head';
import { NavProvider } from "@/components/context/NavContext"; // 記得引入
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
    
    <NavProvider>
    <AuthProvider>
      <NextUIProvider>
        {/* ✅ 用 Portal 掛在 body，不受任何 transform 影響 */}
        <FloatingSidebar />
<Head>
     
        {/* 設定標籤列小圖示 */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
        {/* 你的頁面內容 */}
        <div className="bg-[url('/images/mec_bg-tile.png')] bg-center">
          <CartProvider>
            <Component {...pageProps} />
          </CartProvider>
        </div>
      </NextUIProvider>
    </AuthProvider>
    </NavProvider>
  );
}

export default MyApp;