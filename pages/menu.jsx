// app/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Layout from "./Layout";
import Link from "next/link";
// ✅ 分別引入 3 個 Book 元件
import Book01 from "../components/Book01";
import Book02 from "../components/Book02";
import Book03 from "../components/Book03";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// 👉 換成你的實際圖片路徑；可放很多張
const TABS = [
  {
    key: "youxiang",
    label: "主食經典",
    images: [
      "/images/有香菜單01.png",
      "/images/有香菜單02.png",
      "/images/有香菜單03.png",
      "/images/有香菜單04.png",
      "/images/有香菜單05.png",
      "/images/有香菜單06.png",
      "/images/有香菜單07.png",
      "/images/有香菜單08.png",
    ],
  },
  {
    key: "yidian",
    label: "快炒小點",
    images: [
      "/images/有香菜單01.png",
      "/images/有香菜單02.png",
      "/images/有香菜單03.png",
      "/images/有香菜單04.png",
      "/images/有香菜單05.png",
      "/images/有香菜單06.png",
      "/images/有香菜單07.png",
      "/images/有香菜單08.png",
    ],
  },
  {
    key: "zaoka",
    label: "飲品專區 ",
    images: [
      "/images/有香菜單01.png",
      "/images/有香菜單02.png",
      "/images/有香菜單03.png",
      "/images/有香菜單04.png",
      "/images/有香菜單05.png",
      "/images/有香菜單06.png",
      "/images/有香菜單07.png",
      "/images/有香菜單08.png",
    ],
  },
];

export default function Home() {
  return (
    <Layout>
      <div className="">
        <section className="section_brand_menu px-5 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 max-w-[1500px] mt-20 mx-auto">
            <div>
              <Image
                className=""
                alt="brand-menu"
                src="/images/menu/259w-U_qri6ZfpN4.webp"
                placeholder="empty"
                priority
                width={800}
                height={1300}
              />{" "}
            </div>
            <div>
              <Image
                className=""
                alt="brand-menu"
                src="/images/menu/1319465f72ba46f181a2fdc9b0cd13a0.jpg"
                placeholder="empty"
                priority
                width={800}
                height={1300}
              />{" "}
            </div>
            <div>
              <Image
                className=""
                alt="brand-menu"
                src="/images/menu/white-modern-minimalist-food-restaurant-menu-design-template-567740575581a41e63e0054cb15a2ceb_screen.jpg"
                placeholder="empty"
                priority
                width={800}
                height={1300}
              />{" "}
            </div>
          </div>
        </section>
        <section className="section_menu_entry pt-20 px-5 pb-[400px] ">
          <div className="flex flex-col  justify-center mx-auto items-center max-w-[1920px] xl:w-[80%] md:w-[90%] w-full">
            <div className="title">
              <h2 className="text-4xl text-[#ea3636] font-bold">
                THE BRAND MENU
              </h2>
            </div>
            <div className="items grid sm:grid-cols-2 grid-cols-1 xl:grid-cols-3 gap-[100px] mt-10">
              <div className="brand-item relative mt-[150px]  xl:mt-0">
                <div className="info absolute z-40 left-[0%] xl:left-[-50px] top-[70%] w-[90%]">
                  <div className="flex p-10 flex-col justify-center items-center border-2 border-red-500 bg-[#f8b435]">
                    <div className="title">
                      <img
                        src="/images/logo04.png"
                        className="w-[80%] max-w-[250px] mx-auto"
                        alt=""
                      />
                    </div>
                    <div className="description font-bold text-[#252525] text-[14px] text-center">
                      有香 (Memory Corner)
                      歷經祖孫三代四十年傳承，2013年在溫哥華落地生根，期望將正港的台灣料理－祖傳當歸羊肉鍋、小火鍋、台式簡餐、熱炒料理、炸物小吃和台灣啤酒於有香呈現給您。
                    </div>
                    <Link
                      href="/menu01"
                      className=" bg-[#ea3636] mt-3 border px-4 py-2 font-bold "
                    >
                      MENU
                    </Link>
                  </div>
                </div>
                <div className=" aspect-[16/10] relative">
                  <img
                    src="https://live-production.wcms.abc-cdn.net.au/87253e0f1c042b85b908998f39970cac?impolicy=wcms_crop_resize&cropH=2813&cropW=5000&xPos=0&yPos=260&width=862&height=485"
                    placeholder="empty"
                    alt="brad-memu-item"
                    loading="lazy"
                    fill
                    className="object-cover w-full"
                  />
                </div>
              </div>
              <div className="brand-item relative mt-[150px]  xl:mt-0">
                <div className="info absolute z-40 left-[0%] xl:left-[-50px] top-[70%] w-[90%]">
                  <div className="flex p-10 flex-col justify-center items-center border-2 border-red-500 bg-[#f8b435]">
                    <div className="title">
                      <img
                        src="/images/logo04.png"
                        className="w-[80%] max-w-[250px] mx-auto"
                        alt=""
                      />
                    </div>
                    <div className="description font-bold text-[#252525] text-[14px] text-center">
                      憶點點 (Sweet Memory) 匯聚台灣北中南美食，提供古早味甜品
                      (手工嫩豆花、仙草凍、台式剉冰…) 以及經典小吃
                      (肉圓、火雞肉飯、大腸麵線、多種可搭配台灣啤酒的下酒菜…)，無法抗拒的好滋味，等您來細細品嚐。
                    </div>
                    <Link
                      href="/menu01"
                      className=" bg-[#ea3636] mt-3 border px-4 py-2 font-bold "
                    >
                      MENU
                    </Link>
                  </div>
                </div>
                <div className=" aspect-[16/10] relative">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRCpDreTmF_Umiz0k_NFn_zpJx9RWJWBPGGg&s"
                    placeholder="empty"
                    alt="brad-memu-item"
                    loading="lazy"
                    fill
                    className="object-cover w-full"
                  />
                </div>
              </div>
              <div className="brand-item relative mt-[150px]  xl:mt-0">
                <div className="info absolute z-40 left-[0%] xl:left-[-50px] top-[70%] w-[90%]">
                  <div className="flex p-10 flex-col justify-center items-center border-2 border-red-500 bg-[#f8b435]">
                    <div className="title">
                      <img
                        src="/images/logo04.png"
                        className="w-[80%] max-w-[250px] mx-auto"
                        alt=""
                      />
                    </div>
                    <div className="description font-bold text-[#252525] text-[14px] text-center">
                      有香中央廚房(Old Memory
                      Kitchen)是有香餐飲集團為了嚴格控管產品製程、追求極致品質，於2022年成立，提供和總店口味一致的冷凍料理食品，讓客人在家也能輕鬆料理。除此之外，購物區域以懷舊復古風打造成古早台灣雜貨店，讓大家有機會購買古早味零食糖果和生活用品，回味純真時光、溫習童年小確幸。
                    </div>
                    <Link
                      href="/menu01"
                      className=" bg-[#ea3636] mt-3 border px-4 py-2 font-bold "
                    >
                      MENU
                    </Link>
                  </div>
                </div>
                <div className=" aspect-[16/10] relative">
                  <img
                    src="https://s3-media0.fl.yelpcdn.com/bphoto/9pyTAgJIuSrL3GV14cPD5Q/l.jpg"
                    placeholder="empty"
                    alt="brad-memu-item"
                    loading="lazy"
                    fill
                    className="object-cover w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* <section className="fixed z-50 left-0 bottom-4 fixed-switch w-full ">
        <div className="w-full justify-center items-center flex switch">
          <div className="flex bg-[#ff2929] justify-center items-center px-6 py-3   rounded-[40px]">
            <div className="flex text-gray-200 justify-center flex-col items-center">
              Uber Eat <br></br>
              <span className="text-[14px]">(立即訂餐)</span>
            </div>
            <span className="mx-4 text-white">|</span>
            <div className="flex text-gray-200 justify-center flex-col items-center">
              Waiting list <br></br>
              <span className="text-[14px]">(預約候位)</span>
            </div>
          </div>
        </div>
      </section> 
      <section className="title bg-[#2b2d2c] hidden sm:block overflow-hidden h-[90vh] pt-[150px] relative">
        <div className="color-bar bg-[#fd3737] h-[200px] absolute w-full left-0 !top-1/2 -translate-y-1/2 z-30"></div>
        <div className="main-txt w-full absolute z-50 left-[0%] top-[5%] p-20">
          <div className="flex w-full border-t border-gray-400 pt-8 flex-col justify-center items-start">
            <h1 className="text-[#c9c9c9] font-extrabold text-4xl">
              MEMORY FOOD
            </h1>
            <p className="text-[#c6c6c6]">記憶中的好味道</p>
          </div>
        </div>
        <div className="absolute main-img z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/images/menu-01.png"
            alt="main-img"
            width={1000}
            height={1000}
            placeholder="empty"
            priority
            className="max-w-[680px]"
          />
        </div>
        <div className="absolute main-img-01 z-40 left-[20%] bottom-[-5%] -translate-x-1/2">
          <Image
            src="/images/beer04.png"
            alt="main-img"
            width={1000}
            height={1000}
            placeholder="empty"
            priority
            className="max-w-[380px] rotate-[20deg]"
          />
        </div>
      </section> */}
    </Layout>
  );
}
