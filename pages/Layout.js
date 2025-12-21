import { useState, useEffect } from "react"; 
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Navbar from "@/components/Navbar/Navbar.jsx";
import Banner from "@/components/banner";
import Image from "next/image";
import Footer from "@/components/ui/footer.jsx";
import Head from "next/head"; // 這裡保留引用，但只放技術設定
import Sidebar from "@/components/Sidebar.js";
import { UserProvider } from "../components/context/UserContext";

export default function RootLayout({ children }) {
  const [sidebarProduct, setSidebarProduct] = useState(null); 

  const getVariantId = (selectedAttributes) => {
    return selectedAttributes.map(attr => attr.value).join('-');
  };
  
  const handleAddToCart = (product, quantity, selectedAttributes) => {
    const totalPrice = product.price * quantity; 
    const variantId = getVariantId(selectedAttributes); 

    setSidebarProduct({
      name: product.name,
      price: product.price,
      quantity,
      totalPrice,
      variant: selectedAttributes,
      variantId,
    });
  };

  return (
    <>
      <Head>
        {/* 1. 移除 Title, Description, Keywords, OG tags
             原因：這些應該由每個頁面 (如 FranchiseInfoPage) 自己決定，
             放在這裡會導致重複或覆蓋掉頁面的設定。
        */}
        
        {/* 2. 只保留全站共用的「技術性」設定 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.ico" />
        <meta name="author" content="Memory Dining Group" />
      </Head>

      <div className="">
        <NextUIProvider>
          <NextThemesProvider>
            <UserProvider>
              <Navbar />
              <Sidebar sidebarProduct={sidebarProduct} onAddToCart={handleAddToCart} />
              
              {/* 頁面內容 (包含頁面自己的 <Head>) 會在這裡渲染 
                 這樣就不會被 Layout 的舊 Head 干擾了 
              */}
              {children}
              
            </UserProvider>
          </NextThemesProvider>
        </NextUIProvider>
        
        <Banner />
        <Footer />
      </div>
    </>
  );
}