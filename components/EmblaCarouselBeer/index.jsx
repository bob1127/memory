import React from "react";
import EmblaCarousel from "./EmblaCarousel"; // 這是你原本就有的內層核心元件
import Header from "./Header";
import Footer from "./Footer";

// 這個元件現在是「笨」元件 (Dumb Component)，它只負責顯示傳進來的東西
const EmblaCarouselTravel = ({ slides, options }) => {
  return (
    <div className="bg-[#eae7e4] py-20">
      {/* Header 如果需要可解開註解 */}
      {/* <Header /> */}

      {/* 將接收到的 slides 和 options 傳給核心 Carousel */}
      <EmblaCarousel slides={slides} options={options} />

      {/* <Footer /> */}
    </div>
  );
};

export default EmblaCarouselTravel;
