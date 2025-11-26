import React from "react";
import EmblaCarousel from "./EmblaCarousel";
import Header from "./Header";
import Footer from "./Footer";

const OPTIONS = { dragFree: true, loop: true };

// Define an array of slide objects with iframe content
const SLIDES = [
  {
    image: "/images/beer/台啤-蜂蜜.jpg",
    title: "鮮蜜釀系列",
    description: "珍稀淡雅龍眼花蜜與清爽啤酒完美融合，令人一口就上癮！",
  },
  {
    image: "/images/beer/微果醺.jpg",
    title: "女孩微醺系列",
    description: "臉先紅，心先甜；微醺讓妳更嬌甜",
  },
  {
    image: "/images/beer/245A4057-已增強-雜訊減少 (1).jpg",
    title: "水果釀造系列",
    description: "果香直擊、滑順爽口；每一口都是果釀的純粹與爽快",
  },
  {
    image: "/images/beer/245A3705-已增強-雜訊減少.jpg",
    title: "職人釀造系列",
    description: "獲獎無數、越喝越順；從順口到醇厚，喝的就是職人的穩、準、醇",
  },
  {
    image: "/images/beer/台啤-蜂蜜.jpg",
    title: "鮮蜜釀系列",
    description: "珍稀淡雅龍眼花蜜與清爽啤酒完美融合，令人一口就上癮！",
  },
  {
    image: "/images/beer/微果醺.jpg",
    title: "女孩微醺系列",
    description: "臉先紅，心先甜；微醺讓妳更嬌甜",
  },
  {
    image: "/images/beer/245A4057-已增強-雜訊減少 (1).jpg",
    title: "水果釀造系列",
    description: "果香直擊、滑順爽口；每一口都是果釀的純粹與爽快",
  },
  {
    image: "/images/beer/245A3705-已增強-雜訊減少.jpg",
    title: "職人釀造系列",
    description: "獲獎無數、越喝越順；從順口到醇厚，喝的就是職人的穩、準、醇",
  },
];

const App = () => (
  <div className="bg-[#eae7e4] py-20">
    {/* Uncomment the lines below if you have header and footer components */}
    {/* <Header /> */}
    <EmblaCarousel slides={SLIDES} options={OPTIONS} />
    {/* <Footer /> */}
  </div>
);

export default App;
