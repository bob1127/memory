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

export default function RootLayout({ children, customSwitchLink }) {
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.ico" />
        <meta name="author" content="Memory Dining Group" />
      </Head>

      <div className="">
        <NextUIProvider>
          <NextThemesProvider>
            <UserProvider>
              
              {/* 2. 把參數傳遞給 Navbar */}
              <Navbar customSwitchLink={customSwitchLink} />
              
              <Sidebar sidebarProduct={sidebarProduct} onAddToCart={handleAddToCart} />
              
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