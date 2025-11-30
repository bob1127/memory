// app/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Layout from "./Layout";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <div className=" min-h-screen py-20 bg-[#ede5d6] flex flex-col justify-center items-center">
        <div className="title">
          <h1 className="text-[34px] font-bold">菜單一覽</h1>
        </div>
        <div className="flex  justify-center items-center flex-wrap">
          <Link
            href="/menu01"
            className="bg-white hover:scale-105 hover:shadow-2xl hover:bottom-8 transition-all duration-500 m-5 border border-stone-400 w-[400px]"
          >
            <div className=" aspect-[16/9] overflow-hidden relative">
              <Image
                src="/images/menu/DAV01683.jpg"
                fill
                alt="menu"
                className="object-cover"
                placeholder="empty"
                loading="lazy"
              ></Image>
            </div>
            <div className="description p-8">
              <h2 className="text-[26px] font-bold">
                【經典台菜】傳承三代手路菜， 體驗台灣特有的飲食文化
              </h2>
              <p className="text-[16px]">
                正港的台灣料理―祖傳當歸羊肉鍋、小火鍋、台式簡餐、熱炒料理、炸物小吃和台灣啤酒於有香呈現给您
              </p>
            </div>
          </Link>
          <Link
            href="/menu02"
            className="bg-white hover:scale-105 hover:shadow-2xl hover:bottom-8 transition-all duration-500 m-5 border border-stone-400 w-[400px]"
          >
            <div className=" aspect-[16/9] overflow-hidden relative">
              <Image
                src="/images/menu/DSC07304.jpg"
                fill
                alt="menu"
                className="object-cover"
                placeholder="empty"
                loading="lazy"
              ></Image>
            </div>
            <div className="description p-8">
              <h2 className="text-[26px] font-bold">
                【甜點鹹食】手工製作、品嘗的 到最地道的懷舊巷弄小吃
              </h2>
              <p className="text-[16px]">
                匯聚台灣北中南美食，提供古早味甜品及經典小吃，無法抗拒的好滋味，等您來細細品嚐
              </p>
            </div>
          </Link>
          <Link
            href="/menu01"
            className="bg-white hover:scale-105 hover:shadow-2xl hover:bottom-8 transition-all duration-500 m-5 border border-stone-400 w-[400px]"
          >
            <div className=" aspect-[16/9] overflow-hidden relative">
              <Image
                src="/images/menu/Sweet-Memory-16-燒仙草＋凍氛圍照-2.png"
                fill
                alt="menu"
                className="object-cover"
                placeholder="empty"
                loading="lazy"
              ></Image>
            </div>
            <div className="description p-8">
              <h2 className="text-[26px] font-bold">
                【台灣雜貨店】回味純真時光、 溫習童年小確幸
              </h2>
              <p className="text-[16px]">
                販售與門店口味一致冷凍料理包，讓在家也能輕鬆品嚐美食。除此之外，也能夠買到古早味零食糖果和懷舊小物
              </p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
