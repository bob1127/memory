// pages/_app.js
import '../src/globals.css';
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // ✅ 引入 AOS CSS

import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from '../components/AuthProvider';
import { CartProvider } from "../components/context/CartContext";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    AOS.init({
      duration: 1000, // 動畫持續時間 (ms)
      easing: "ease-in-out", // 動畫效果
      once: true, // 滾動觸發一次
    });
  }, []);

  return (
    <AuthProvider>
      <NextUIProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </NextUIProvider>
    </AuthProvider>
  );
}

export default MyApp;
