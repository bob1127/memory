import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-marquee-slider";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  motion,
  useMotionValue,
  AnimatePresence,
  useScroll,
  useReducedMotion,
} from "framer-motion";

// Components
import Layout from "../pages/Layout";
import Carousel from "../components/EmblaCarouselBeer/index";

// 網址設定 (優先讀取環境變數，Fallback 為正式網址)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.memorycorner8.com";

/* =================================================================
   1. 翻譯資料庫
   ================================================================= */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "Memory Corner 有香餐飲集團 | 溫哥華正宗台式料理與懷舊美味",
      description:
        "始於1975年，有香餐飲集團在溫哥華呈現最正宗的台灣味。旗下擁有 Memory Corner 有香、Sweet Memory 憶點點，提供台式鍋物、羊肉爐、鹽酥雞、傳統小吃、甜點與特色精釀啤酒，帶您重溫家的溫度。",
      keywords:
        "溫哥華台灣菜, 溫哥華台式料理, 羊肉爐, 鹽酥雞, 台灣啤酒, 有香, 憶點點, Vancouver Taiwanese Food",
      ogImage: "/images/index/banner-06-a.png",
    },
    beer: {
      honey: {
        title: "鮮蜜釀系列",
        description: "珍稀淡雅龍眼花蜜與清爽啤酒完美融合，令人一口就上癮！",
      },
      girl: {
        title: "女孩微醺系列",
        description: "臉先紅，心先甜；微醺讓妳更嬌甜",
      },
      fruit: {
        title: "水果釀造系列",
        description: "果香直擊、滑順爽口；每一口都是果釀的純粹與爽快",
      },
      craft: {
        title: "職人釀造系列",
        description:
          "獲獎無數、越喝越順；從順口到醇厚，喝的就是職人的穩、準、醇",
      },
    },
    variety: {
      title: "VARIETY",
      subtitle: "Traditional grocery shop",
      desc1: "販售各式台灣經典零食、懷舊童玩，以及方便好料理的台灣小吃冷凍包。",
      desc2: "帶你重溫最經典的台灣味。",
      desc3: "喜歡台味的朋友，能線上輕鬆訂購， 也歡迎到店逛逛！",
    },
    about: {
      title: "ABOUT US",
      group_desc:
        "始於1975年台灣高雄，在北美這片 土地上<br/>傳遞家的溫度與歸屬感",
      memory_desc: "傳承三代手路菜<br/>正港的台灣料理",
      sweet_desc:
        "手作甜點與飲品，蒐集生活裡那些 <br/>一點點卻很重要的甜美記憶。",
    },
    app: {
      title: "REWARDS APP",
      subtitle: "Earn Points with Every Purchase",
      marquee: "Join Now — Start Earning Points!",
    },
  },
  en: {
    meta: {
      title: "Memory Corner Group | Authentic Taiwanese Cuisine in Vancouver",
      description:
        "Established in 1975, Memory Corner Group brings authentic Taiwanese flavors to Vancouver. Home to Memory Corner and Sweet Memory, serving hot pots, street snacks, crispy chicken, desserts, and craft beer.",
      keywords:
        "Vancouver Taiwanese Food, Richmond Taiwanese Restaurant, Hot Pot, Bubble Tea, Popcorn Chicken, Craft Beer",
      ogImage: "/images/index/banner-06-a.png",
    },
    beer: {
      honey: {
        title: "Honey Lager Series",
        description:
          "Rare, elegant longan honey perfectly blended with refreshing beer. Addictive from the first sip!",
      },
      girl: {
        title: "Micro-Drunk Series",
        description:
          "Cheeks blush, heart sweetens; a light buzz brings out your charm.",
      },
      fruit: {
        title: "Fruit Brewing Series",
        description:
          "Direct fruit aroma, smooth and refreshing; every sip is the pure joy of fruit brewing.",
      },
      craft: {
        title: "Artisan Brewing Series",
        description:
          "Award-winning smoothness. From easy-drinking to full-bodied, taste the stability, precision, and richness of the craftsman.",
      },
    },
    variety: {
      title: "VARIETY",
      subtitle: "Traditional Grocery Shop",
      desc1:
        "We sell a variety of classic Taiwanese snacks, nostalgic toys, and convenient frozen Taiwanese street food packs.",
      desc2: "Relive the most classic Taiwanese flavors.",
      desc3:
        "Fans of Taiwanese taste can order online easily, or visit our store!",
    },
    about: {
      title: "ABOUT US",
      group_desc:
        "Started in Kaohsiung, Taiwan in 1975.<br/>Delivering the warmth of home and belonging in North America.",
      memory_desc:
        "Inheriting three generations of culinary skills.<br/>Authentic Taiwanese cuisine.",
      sweet_desc:
        "Handmade desserts and drinks.<br/>Collecting those small but important sweet memories in life.",
    },
    app: {
      title: "REWARDS APP",
      subtitle: "Earn Points with Every Purchase",
      marquee: "Join Now — Start Earning Points!",
    },
  },
};

/* =================================================================
   2. SSG 資料獲取 (Static Site Generation)
   ================================================================= */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: {
      t,
      locale,
    },
  };
}

/* =================================================================
   3. 動畫與輔助元件
   ================================================================= */

function FadeUp({
  children,
  className = "",
  delay = 0,
  distance = 60,
  amount = 0.3,
}) {
  const prefersReduced = useReducedMotion?.();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        ease: [0.16, 1, 0.3, 1],
        duration: 0.8,
        delay,
      }}
      viewport={{ once: true, amount, margin: "0px 0px -5% 0px" }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

function AutoSwapImage({
  base,
  alt = "",
  className = "",
  positionClass = "",
  width = 800,
  height = 500,
  interval = 6000,
  initialDelay = 0,
  rotateInfinite = false,
  rotateDuration = 16,
  priority = false,
  forceShowB,
}) {
  const prefersReduced = useReducedMotion?.();
  const [internalShowB, setInternalShowB] = useState(false);
  const isControlled = forceShowB !== undefined;
  const showB = isControlled ? forceShowB : internalShowB;

  useEffect(() => {
    if (isControlled || prefersReduced) return;
    const first = setTimeout(
      () => setInternalShowB((v) => !v),
      initialDelay || interval
    );
    const timer = setInterval(() => setInternalShowB((v) => !v), interval);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [interval, initialDelay, prefersReduced, isControlled]);

  const srcA = `${base}-a.png`;
  const srcB = `${base}-b.png`;

  const content = (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={showB ? "B" : "A"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.05, ease: "easeInOut" }}
        style={{
          willChange: "opacity",
          backfaceVisibility: "hidden",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          src={showB ? srcB : srcA}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          placeholder="empty"
          className={className}
          sizes="(max-width: 1024px) 80vw, 50vw"
        />
      </motion.div>
    </AnimatePresence>
  );

  if (rotateInfinite) {
    return (
      <motion.div
        className={`absolute ${positionClass}`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: rotateDuration,
        }}
        style={{ willChange: "transform", transformOrigin: "50% 50%" }}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={`absolute ${positionClass}`}>{content}</div>;
}

function RotatingSplitImage({
  baseA,
  baseB,
  alt = "",
  className = "",
  interval = 6000,
  initialDelay = 0,
  rotateDuration = 16,
  priority = false,
  forceShowB,
}) {
  const prefersReduced = useReducedMotion?.();
  const [internalShowB, setInternalShowB] = useState(false);
  const isControlled = forceShowB !== undefined;
  const showB = isControlled ? forceShowB : internalShowB;

  useEffect(() => {
    if (isControlled || prefersReduced) return;
    const first = setTimeout(() => {
      setInternalShowB((v) => !v);
      const timer = setInterval(() => setInternalShowB((v) => !v), interval);
      return () => clearInterval(timer);
    }, initialDelay || interval);
    return () => clearTimeout(first);
  }, [interval, initialDelay, prefersReduced, isControlled]);

  const currentBase = showB ? baseB : baseA;
  const bgSrc = `${currentBase}-01.png`;
  const fgSrc = `${currentBase}-02.png`;

  const swapTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.8, ease: "easeInOut" },
  };

  return (
    <motion.div
      className={`absolute pointer-events-none aspect-square ${className}`}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 1.05,
        ease: [0.16, 1, 0.3, 1],
        delay: initialDelay / 1000,
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: rotateDuration,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={showB ? "bgB" : "bgA"}
              className="absolute inset-0 w-full h-full"
              {...swapTransition}
            >
              <Image
                src={bgSrc}
                alt={`${alt} Background`}
                width={400}
                height={400}
                className="w-full h-full object-contain"
                priority={priority}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={showB ? "fgB" : "fgA"}
              className="w-full h-full flex items-center justify-center"
              {...swapTransition}
            >
              <Image
                src={fgSrc}
                alt={`${alt} Foreground`}
                width={400}
                height={400}
                className="w-full h-full object-contain scale-90"
                priority={priority}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* =================================================================
   4. 主頁面元件
   ================================================================= */
export default function Home({ t, locale }) {
  if (!t) return null;

  const [globalIsB, setGlobalIsB] = useState(false);
  const dingingRef = useRef(null);
  useScroll({ target: dingingRef, offset: ["start 80%", "end 25%"] });

  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalIsB((prev) => !prev);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const OPTIONS = { dragFree: true, loop: true };
  const SLIDES = [
    {
      image: "/images/beer/台啤-蜂蜜.webp",
      title: t.beer.honey.title,
      description: t.beer.honey.description,
    },
    {
      image: "/images/beer/微果醺.webp",
      title: t.beer.girl.title,
      description: t.beer.girl.description,
    },
    {
      image: "/images/beer/245A4057-已增強-雜訊減少 (1).webp",
      title: t.beer.fruit.title,
      description: t.beer.fruit.description,
    },
    {
      image: "/images/beer/245A3705-已增強-雜訊減少.webp",
      title: t.beer.craft.title,
      description: t.beer.craft.description,
    },
    {
      image: "/images/beer/台啤-蜂蜜.webp",
      title: t.beer.honey.title,
      description: t.beer.honey.description,
    },
    {
      image: "/images/beer/微果醺.webp",
      title: t.beer.girl.title,
      description: t.beer.girl.description,
    },
    {
      image: "/images/beer/245A4057-已增強-雜訊減少 (1).webp",
      title: t.beer.fruit.title,
      description: t.beer.fruit.description,
    },
    {
      image: "/images/beer/245A3705-已增強-雜訊減少.webp",
      title: t.beer.craft.title,
      description: t.beer.craft.description,
    },
  ];

  /* ========== 完整結構化資料 (Structured Data) ========== */

  // 1. 網站 Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Memory Corner 有香餐飲集團",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // 2. 組織/集團 Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Memory Corner Group",
    url: SITE_URL,
    logo: `${SITE_URL}/images/index/about/有香集團-logo.png`,
    sameAs: [
      "https://www.facebook.com/MemoryCorner8",
      "https://www.instagram.com/memorycorner8",
    ],
  };

  // 3. 餐廳 (LocalBusiness) Schema - 這是實體店最重要的 SEO
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Memory Corner 有香",
    image: [
      `${SITE_URL}/images/index/banner-06-a.png`,
      `${SITE_URL}/images/index/about/DAV01683.webp`,
    ],
    priceRange: "$$",
    servesCuisine: "Taiwanese",
    address: {
      "@type": "PostalAddress",
      streetAddress: "6900 No. 3 Rd", // 範例地址，請確認正確地址
      addressLocality: "Richmond",
      addressRegion: "BC",
      postalCode: "V6Y 2C5",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 49.166, // 範例座標
      longitude: -123.13,
    },
    url: SITE_URL,
    telephone: "+16042845434", // 範例電話
  };

  // 4. 影片 Schema
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Memory Corner | 有香影片-朋友歡聚暢飲",
    description:
      "Enjoy authentic Taiwanese cuisine and beer with friends at Memory Corner.",
    thumbnailUrl: `${SITE_URL}/images/index/video/b4c86b1e81f93dc869c7923db929e811.jpg`,
    uploadDate: "2024-01-01T08:00:00+08:00",
    contentUrl: `${SITE_URL}/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4`,
    embedUrl: SITE_URL,
  };

  // 5. 網頁 Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.meta.title,
    description: t.meta.description,
    url: `${SITE_URL}${locale === "en" ? "/en" : ""}`,
    inLanguage: locale === "zh-TW" ? "zh-TW" : "en",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}${t.meta.ogImage}`,
    },
  };

  return (
    <>
      <Layout>
        <Head>
          <title>{t.meta.title}</title>
          <meta name="description" content={t.meta.description} />
          <meta name="keywords" content={t.meta.keywords} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta property="og:type" content="website" />
          <meta property="og:title" content={t.meta.title} />
          <meta property="og:description" content={t.meta.description} />
          <meta property="og:image" content={`${SITE_URL}${t.meta.ogImage}`} />
          <meta property="og:site_name" content="Memory Corner" />
          <meta
            property="og:locale"
            content={locale === "zh-TW" ? "zh_TW" : "en_US"}
          />
          <meta
            property="og:url"
            content={`${SITE_URL}${locale === "en" ? "/en" : ""}`}
          />

          <link
            rel="canonical"
            href={`${SITE_URL}${locale === "en" ? "/en" : ""}`}
          />
          <link rel="alternate" hreflang="x-default" href={SITE_URL} />
          <link rel="alternate" hreflang="zh-TW" href={SITE_URL} />
          <link rel="alternate" hreflang="en" href={`${SITE_URL}/en`} />

          {/* Inject Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(restaurantSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
          />
        </Head>

        {/* Section Hero */}
        <section className="section-hero z-[9] pt-[0px] relative md:mt-0 aspect-[16/16] md:aspect-[16/12] xl:aspect-[16/7.6] overflow-hidden">
          {/* [SEO] 隱藏的 H1，確保頁面有正確的標題層級，但不影響視覺 */}
          <h1 className="sr-only">{t.meta.title}</h1>

          <div className="relative h-full w-full">
            {/* 中央主標 */}
            <AutoSwapImage
              base="/images/index/banner-06"
              alt="Memory Corner Authentic Taiwanese Cuisine"
              positionClass="z-10 right-[-3%] top-[10%] md:top-[-10%]"
              className="w-[80vw]"
              width={1200}
              height={800}
              interval={7000}
              priority={true}
              forceShowB={globalIsB}
            />

            {/* 角色 */}
            <AutoSwapImage
              base="/images/index/banner-05"
              alt="Memory Corner Character Mascot"
              positionClass="z-20 right-[0%] bottom-[-2%]"
              className="w-[70vw] sm:w-[55vw] lg:w-[50vw] xl:w-[52vw]"
              width={800}
              height={500}
              interval={7000}
              forceShowB={globalIsB}
            />

            {/* 筷子 */}
            <AutoSwapImage
              base="/images/index/banner-02"
              alt="Taiwanese Chopsticks"
              positionClass="z-50 left-[-10%] top-[15%] rotate-[25deg] md:rotate-0 md:top-[24%]"
              className="w-[45vw] md:w-[30vw]"
              width={800}
              height={500}
              interval={7000}
              forceShowB={globalIsB}
            />

            {/* 轉動標誌 */}
            <RotatingSplitImage
              baseA="/images/index/banner-07-a"
              baseB="/images/index/banner-07-b"
              alt="Memory Corner Seal"
              className="z-30 left-[10%] md:left-[20%] bottom-[30%] md:bottom-[15%] xl:bottom-[10%] w-[16vw] sm:w-[10vw]"
              interval={7000}
              initialDelay={3600}
              rotateDuration={16}
              priority={true}
              forceShowB={globalIsB}
            />

            {/* 火鍋 */}
            <AutoSwapImage
              base="/images/index/banner-01"
              alt="Authentic Taiwanese Hot Pot"
              positionClass="z-10 left-[4%] md:left-[2%] top-[44%] sm:top-[25%] md:top-[50%] 2xl:top-[55%] -translate-y-1/2"
              className="w-[75vw] md:w-[60vw]"
              width={800}
              height={500}
              interval={7000}
              priority={true}
              forceShowB={globalIsB}
            />
          </div>
        </section>

        {/* ======= 啤酒輪播區塊 ======= */}
        <section className="section_beer overflow-hidden">
          <Carousel slides={SLIDES} options={OPTIONS} />
        </section>

        {/* ======= 零食區塊 (Variety) ======= */}
        <section
          ref={dingingRef}
          className="section_Dinging mx-auto bg-[#efefef] relative overflow-x-hidden"
        >
          <div className="mx-auto py-3 sm:py-20 max-w-[1920px] px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-center">
              {/* 左側：影片區 */}
              <div className="left w-full lg:w-1/2 overflow-hidden aspect-[3/4] sm:aspect-[4/4] relative">
                <video
                  className="w-full h-full scale-[1.5] object-cover"
                  src="/video/灶腳.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Video of Taiwanese grocery shop"
                />
              </div>
              {/* 右側：文案區 */}
              <div className="right p-7 md:p-20 w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-6 lg:px-8">
                <FadeUp amount={0.35} className="w-full max-w-[680px]">
                  <article className="flex flex-col">
                    <FadeUp>
                      <h2 className="title-large font-bold m-0 p-0 leading-none">
                        {t.variety.title}
                      </h2>
                    </FadeUp>

                    <div className="">
                      <FadeUp delay={0.06}>
                        <p className="sub_title m-0 p-0">
                          {t.variety.subtitle}
                        </p>
                      </FadeUp>
                    </div>

                    <div className="mt-3 sm:mt-4">
                      <FadeUp delay={0.08}>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc1}
                        </p>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc2}
                        </p>
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc3}
                        </p>
                      </FadeUp>
                      <FadeUp delay={0.04}>
                        <Link
                          href="/app"
                          className="group"
                          aria-label="Go to App page"
                        >
                          <Image
                            src="/images/more-btn.png"
                            width={400}
                            alt="Read more about variety products"
                            height={400}
                            loading="lazy"
                            className="w-[200px] mx-auto sm:mx-0 mt-5 group-hover:scale-105 scale-100 duration-300 h-auto"
                          />
                        </Link>
                      </FadeUp>
                    </div>
                  </article>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="section_brand_story relative">
          <div className="pointer-events-none absolute top-[7%] sm:top-[15%] left-[10%] md:translate-x-0 z-20">
            <FadeUp>
              <h2 className="font-extrabold tracking-[0.18em] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] text-[clamp(2.4rem,7vw,8.5rem)] leading-none">
                {t.about.title}
              </h2>
            </FadeUp>
          </div>

          <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* 區塊 1 */}
            <FadeUp delay={0.02} amount={0.25} className="relative">
              <Link
                href="/brand-story?tab=group"
                className="block group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]"
                aria-label="About Memory Corner Group"
              >
                <Image
                  src="/images/index/about/DAV01968.webp"
                  alt="Memory Corner Group Staff"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <Image
                      src="/images/index/about/有香集團-logo.png"
                      alt="Group Logo"
                      width={260}
                      height={120}
                      className="w-[180px] md:w-[200px] lg:w-[240px] xl:w-[300px] h-auto"
                    />
                  </div>
                  <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                    <p
                      className="text-white text-[16px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: t.about.group_desc }}
                    />
                  </div>
                </div>
              </Link>
            </FadeUp>

            {/* 區塊 2 */}
            <FadeUp delay={0.06} amount={0.25} className="relative">
              <Link
                href="/brand-story?tab=youxiang"
                className="block group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]"
                aria-label="About Memory Corner Restaurant"
              >
                <Image
                  src="/images/index/about/DAV01683.webp"
                  alt="Memory Corner Dining Environment"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <Image
                      src="/images/index/about/有香-logo.png"
                      alt="Memory Corner Logo"
                      width={260}
                      height={120}
                      className="w-[180px] md:w-[200px] lg:w-[240px] xl:w-[300px] h-auto"
                    />
                  </div>
                  <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                    <p
                      className="text-white text-[16px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: t.about.memory_desc }}
                    />
                  </div>
                </div>
              </Link>
            </FadeUp>

            {/* 區塊 3 */}
            <FadeUp delay={0.1} amount={0.25} className="relative">
              <Link
                href="/brand-story?tab=memory"
                className="block group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]"
                aria-label="About Sweet Memory"
              >
                <Image
                  src="/images/index/about/DAV01773 (1).webp"
                  alt="Sweet Memory Desserts"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <Image
                      src="/images/index/about/億點點-logo.png"
                      alt="Sweet Memory Logo"
                      width={260}
                      height={120}
                      className="w-[180px] md:w-[200px] lg:w-[240px] xl:w-[300px] h-auto"
                    />
                  </div>
                  <div className="mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out delay-75">
                    <p
                      className="text-white text-[16px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: t.about.sweet_desc }}
                    />
                  </div>
                </div>
              </Link>
            </FadeUp>
          </div>
        </section>

        {/* Video Section */}
        <section className="h-full w-full section-video relative">
          <video
            className="w-full h-full object-cover"
            src="/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/index/video/b4c86b1e81f93dc869c7923db929e811.jpg"
            aria-label="Memory Corner promotional video"
          >
            <source
              src="/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4"
              type="video/mp4"
            />
          </video>
        </section>

        {/* APP Operation Section */}
        <section className="section_app_operation bg-[#f7f7f7] flex flex-col justify-center h-screen relative overflow-hidden">
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center md:px-10 px-5 xl:px-20 md:items-stretch gap-10 md:gap-16">
            <div className="w-full md:w-[50%] flex sm:p-10 p-8 md:p-20 items-center">
              <FadeUp amount={0.35} className="w-full">
                <article className="flex flex-col justify-center items-center">
                  <FadeUp>
                    <h2 className="title-large font-bold text-[#3b2619] leading-none text-wrap">
                      {t.app.title}
                    </h2>
                  </FadeUp>

                  <div className="mt-4">
                    <FadeUp delay={0.06}>
                      <p className="text-[#3b2619] font-normal sub_title leading-relaxed">
                        {t.app.subtitle}
                      </p>
                    </FadeUp>
                    <FadeUp delay={0.04}>
                      <Link
                        href="/app"
                        className="group"
                        aria-label="Join Rewards App"
                      >
                        <Image
                          src="/images/more-btn.png"
                          width={400}
                          alt="Join App Button"
                          height={400}
                          loading="lazy"
                          className="w-[200px] mx-auto sm:mx-0 group-hover:scale-105 scale-100 duration-300 h-auto"
                        />
                      </Link>
                    </FadeUp>
                  </div>
                </article>
              </FadeUp>
            </div>

            <div className="w-full md:w-[50%] flex items-center">
              <FadeUp delay={0.1} amount={0.3} className="w-full">
                <Link href="/app" aria-label="View App details">
                  <Image
                    src="/images/app/app.png"
                    alt="Rewards App Mockup"
                    width={1700}
                    height={1700}
                    loading="lazy"
                    className="w-full h-full"
                  />
                </Link>
              </FadeUp>
            </div>
            <div className="absolute bottom-6 w-full overflow-hidden">
              <Marquee velocity={11}>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span
                      key={i}
                      className="mx-10 text-8xl font-bold text-[#ebe9ea]"
                    >
                      {t.app.marquee}
                    </span>
                  ))}
              </Marquee>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
