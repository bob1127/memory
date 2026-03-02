import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-marquee-slider";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  motion,
  AnimatePresence,
  useScroll,
  useReducedMotion,
} from "framer-motion";

// Components
import Layout from "../pages/Layout";
import Carousel from "../components/EmblaCarouselBeer/index";

// 網址設定
const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";
const SITE_URL = ensureURL(SITE_URL_RAW);

const SITE_NAME = "Memory Corner";
const BRAND_NAME = "Memory Corner Group";

// ✅ 你指定的 OG image
const OG_IMAGE_PATH = "/images/index/about/3-1.webp";

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
      title: "台味便利店",
      subtitle: "把台灣的好滋味，帶進你生活裡",
      desc1:
        "從最受喜愛的人氣零食，到熱銷的台味冷凍家常美食，把好滋味變得輕鬆簡單，隨時為你準備好。",
      desc2: "門市選購或線上購物，讓台灣的好滋味，成為你每天的日常。",

      online_shop: "線上購物",
      store_info: "門店資訊", // 新增
    },
    about: {
      title: "ABOUT US",
      group_desc:
        "始於 1975 年，從一間街角餐廳，<br/>走向三個品牌與中央廚房的餐飲集團。<br/>我們將台灣的味道帶到北美溫哥華，<br/>讓每一道料理，都承載家的溫度與歸屬。",
      memory_desc:
        "大火快炒、慢燉入味與酥香炸物，<br/>成就半世紀傳承的經典台灣料理。",
      sweet_desc:
        "細緻手作的台味甜點與鹹食，<br/>以療癒的滋味，帶來難忘的美食饗宴。",
    },
    app: {
      title: "會員回饋計畫",
      subtitle: "消費就有回饋",
      marquee: "Join Now — Start Earning Points!",
      more_info: "立即加入會員",
    },
  },
  en: {
    meta: {
      title: "Memory Corner Group | Authentic Taiwanese Cuisine in Vancouver",
      description:
        "Established in 1975, Memory Corner Group brings authentic Taiwanese flavors to Vancouver. Home to Memory Corner and Sweet Memory, serving hot pots, street snacks, crispy chicken, desserts, and craft beer.",
      keywords:
        "Vancouver Taiwanese Food, Richmond Taiwanese Restaurant, Hot Pot, Bubble Tea, Popcorn Chicken, Craft Beer",
    },
    beer: {
      honey: {
        title: "Honey-Infused Craft Beer Collection",
        description:
          "Rare, elegant longan honey perfectly blended with refreshing beer. Addictive from the first sip!",
      },
      girl: {
        title: "The Tipsy Girl Collection",
        description:
          "Cheeks blush, heart sweetens; a light buzz brings out your charm.",
      },
      fruit: {
        title: "Fruit-Infused Craft Beer Collection",
        description:
          "Direct fruit aroma, smooth and refreshing; every sip is the pure joy of fruit brewing.",
      },
      craft: {
        title: "Artisan Craft Beer Collection",
        description:
          "Award-winning smoothness. From easy-drinking to full-bodied, taste the stability, precision, and richness of the craftsman.",
      },
    },
    variety: {
      title: "TAIWANESE CONVENIENCE STORE",
      subtitle: "Bringing the flavors of Taiwan into your everyday life.",
      desc1: "From our most-loved snacks to comforting Taiwanese frozen meals,",
      desc2: "great flavors made easy — ready whenever you are.",
      desc3: "In-store or online.",
      online_shop: "Online-Shop",
      store_info: "Store Info", // 新增
    },
    about: {
      title: "ABOUT US",
      group_desc:
        "Founded in 1975,<br/>from one restaurant to three brands and a central kitchen,<br/>we bring Taiwanese food culture to life in North America,<br/>sharing the warmth and sense of home.",
      memory_desc:
        "From fiery stir-fries and slow-simmered dishes<br/>to crispy golden favourites,we craft timeless Taiwanese flavours.",
      sweet_desc:
        "Handcrafted Taiwanese desserts and savoury delights,<br/>bringing comforting flavours and unforgettable memories.",
    },
    app: {
      title: "Member Rewards",
      subtitle: "Earn Rewards with Every Purchase",
      marquee: "Join Now — Start Earning Points!",
      more_info: "Join Our Community",
    },
  },
};

/* =================================================================
   2. SSG：這頁沒打後端，SSG 就足夠（不需要 ISR）
   ================================================================= */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: {
      t,
      locale: locale || "zh-TW",
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
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
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
  slide = "none", // "left" | "right" | "none"
}) {
  const prefersReduced = useReducedMotion?.();
  const [internalShowB, setInternalShowB] = useState(false);
  const isControlled = forceShowB !== undefined;
  const showB = isControlled ? forceShowB : internalShowB;

  useEffect(() => {
    if (isControlled || prefersReduced) return;
    const first = setTimeout(
      () => setInternalShowB((v) => !v),
      initialDelay || interval,
    );
    const timer = setInterval(() => setInternalShowB((v) => !v), interval);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [interval, initialDelay, prefersReduced, isControlled]);

  const srcA = `${base}-a.png`;
  const srcB = `${base}-b.png`;

  const offset = 60;
  const enterX = slide === "left" ? offset : slide === "right" ? -offset : 0;
  const exitX = slide === "left" ? -offset : slide === "right" ? offset : 0;

  const content = (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={showB ? "B" : "A"}
        initial={{ opacity: 0, x: prefersReduced ? 0 : enterX }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: prefersReduced ? 0 : exitX }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        style={{
          willChange: "opacity, transform",
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
  const router = useRouter();
  const activeLocale = locale || router.locale || "zh-TW";
  const isEn = activeLocale === "en";

  if (!t) return null;

  const [globalIsB, setGlobalIsB] = useState(false);
  const dingingRef = useRef(null);
  useScroll({ target: dingingRef, offset: ["start 80%", "end 25%"] });

  useEffect(() => {
    const timer = setInterval(() => setGlobalIsB((prev) => !prev), 7000);
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
    // 重複 slides（如要無限輪播）
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

  // canonical
  const canonical = `${SITE_URL}${isEn ? "/en" : ""}`;

  // hreflang
  const hrefLangZh = `${SITE_URL}/`;
  const hrefLangEn = `${SITE_URL}/en`;

  // ✅ og image 絕對路徑
  const ogImageAbs = `${SITE_URL}${OG_IMAGE_PATH}`;

  /* ========== Structured Data ========== */
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: isEn ? "en" : "zh-Hant",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/index/about/有香集團-logo.png`,
    sameAs: [
      "https://www.facebook.com/MemoryCorner8",
      "https://www.instagram.com/memorycorner8",
    ],
  };

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Memory Corner 有香",
    image: [ogImageAbs, `${SITE_URL}/images/index/about/DAV01683.webp`],
    priceRange: "$$",
    servesCuisine: "Taiwanese",
    url: SITE_URL,
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.meta.title,
    description: t.meta.description,
    url: canonical,
    inLanguage: isEn ? "en" : "zh-Hant",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: ogImageAbs,
    },
  };

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Memory Corner | 有香影片-朋友歡聚暢飲",
    description:
      "Enjoy authentic Taiwanese cuisine and beer with friends at Memory Corner.",
    thumbnailUrl: `${SITE_URL}/images/index/video/b4c86b1e81f93dc869c7923db929e811.jpg`,
    contentUrl: `${SITE_URL}/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4`,
    embedUrl: canonical,
  };

  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="theme-color" content="#ffffff" />

        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="x-default" href={hrefLangZh} />
        <link rel="alternate" hrefLang="zh-Hant" href={hrefLangZh} />
        <link rel="alternate" hrefLang="en" href={hrefLangEn} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:image" content={ogImageAbs} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={isEn ? "en_US" : "zh_TW"} />
        <meta property="og:url" content={canonical} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta name="twitter:image" content={ogImageAbs} />

        {/* JSON-LD */}
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
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

      {/* Hero */}
      <section className="section-hero z-[9] pt-[0px] relative md:mt-0 aspect-[16/16] md:aspect-[16/12] xl:aspect-[16/7.6] overflow-hidden">
        <h1 className="sr-only">{t.meta.title}</h1>

        <div className="relative h-full w-full">
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

          <AutoSwapImage
            base="/images/index/banner-05"
            alt="Memory Corner Character Mascot"
            positionClass="z-20 right-[-150px] bottom-0"
            className="w-[70vw] sm:w-[55vw] lg:w-[50vw] xl:w-[52vw]"
            width={800}
            height={500}
            interval={7000}
            forceShowB={globalIsB}
            slide="left"
          />

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
            slide="right"
          />
        </div>
      </section>

      {/* Beer Carousel */}
      <section className="section_beer overflow-hidden">
        <Carousel slides={SLIDES} options={OPTIONS} />
      </section>

      {/* Variety */}
      <section className="section_Dinging mx-auto bg-[#efefef] relative overflow-x-hidden">
        <div
          ref={dingingRef}
          className="mx-auto sm:pt-20 max-w-[1920px] px-4 sm:px-6"
        >
          <div className="flex flex-col lg:flex-row justify-center">
            <div className="left w-full lg:w-1/2 overflow-hidden aspect-[3/4] sm:aspect-[4/4] relative">
              <video
                className="w-full h-full scale-[2.1] pb-[150px] object-cover"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Video of Taiwanese grocery shop"
              >
                {/* 優先提供給 Safari 讀取的透明背景格式 */}
                <source src="/video/灶腳.mov" type="video/quicktime" />
                {/* 提供給 Chrome / Firefox 讀取的透明背景格式 */}
                <source src="/video/灶腳.webm" type="video/webm" />
                {/* 可選：加入備用文字，當瀏覽器完全不支援時顯示 */}
                您的瀏覽器不支援此影片格式。
              </video>
            </div>

            <div className="right p-7 md:p-20 w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-6 lg:px-8">
              <FadeUp amount={0.35} className="w-full max-w-[680px]">
                <article className="flex flex-col">
                  <FadeUp>
                    <h2 className="  font-extrabold m-0 p-0 leading-none">
                      {t.variety.title}
                    </h2>
                  </FadeUp>

                  <div>
                    <FadeUp delay={0.06}>
                      <p className="sub_title m-0 p-0">{t.variety.subtitle}</p>
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
                      {t.variety.desc3 && (
                        <p className="mt-2 text-[#333333] text-sm sm:text-xl leading-relaxed">
                          {t.variety.desc3}
                        </p>
                      )}
                    </FadeUp>

                    <FadeUp delay={0.04}>
                      <div className="flex flex-wrap gap-4 mt-5">
                        <Link href="/groupBuy">
                          <span className="inline-block bg-stone-800 text-stone-50 px-5 py-2 rounded-[3px] hover:scale-105 scale-100 tracking-widest duration-300">
                            {t.variety.online_shop}
                          </span>
                        </Link>
                        <Link href="/brand-story?tab=corner">
                          <span className="inline-block border border-stone-800 text-stone-800 bg-transparent px-5 py-2 rounded-[3px] hover:bg-stone-800 hover:text-stone-50 hover:scale-105 scale-100 tracking-widest duration-300">
                            {t.variety.store_info}
                          </span>
                        </Link>
                      </div>
                    </FadeUp>
                  </div>
                </article>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="section_brand_story relative">
        <div className="pointer-events-none absolute top-[7%] sm:top-[15%] left-[10%] md:translate-x-0 z-20">
          <FadeUp>
            <h2 className="font-extrabold tracking-[0.18em] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] text-[clamp(2.4rem,7vw,8.5rem)] leading-none">
              {t.about.title}
            </h2>
          </FadeUp>
        </div>

        <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-0">
          <FadeUp delay={0.02} amount={0.25} className="relative">
            <Link
              href="/brand-story?tab=group"
              className="block group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]"
              aria-label="About Memory Corner Group"
            >
              <Image
                src="/images/index/about/3-1.webp"
                alt="Memory Corner Group Staff"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
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

          <FadeUp delay={0.06} amount={0.25} className="relative">
            <Link
              href="/brand-story?tab=youxiang"
              className="block group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]"
              aria-label="About Memory Corner Restaurant"
            >
              <Image
                src="/images/index/about/3-2.webp"
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

          <FadeUp delay={0.1} amount={0.25} className="relative">
            <Link
              href="/brand-story?tab=memory"
              className="block group relative overflow-hidden aspect-[4/3] md:aspect-[9/16] lg:aspect-[10/16]"
              aria-label="About Sweet Memory"
            >
              <Image
                src="/images/index/about/3-3.webp"
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

      {/* Video */}
      <section className="h-full w-full section-video relative">
        <video
          className="w-full h-full object-cover"
          src="/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster=" "
          aria-label="Memory Corner promotional video"
        >
          <source
            src="/video/A. Memory Corner | 有香影片-朋友歡聚暢飲.mp4"
            type="video/mp4"
          />
        </video>
      </section>

      {/* APP */}
      <section className="section_app_operation bg-[#f7f7f7] flex flex-col justify-center h-screen relative overflow-hidden">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center md:px-10 px-5 xl:px-20 md:items-stretch gap-10 md:gap-16">
          <div className="w-full md:w-[50%] flex sm:p-10 p-8 md:p-20 items-center">
            <FadeUp amount={0.35} className="w-full">
              <article className="flex flex-col  ">
                <FadeUp>
                  <h2 className=" text-left font-extrabold text-7xl text-[#3b2619] leading-none text-wrap">
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
                    <Link href="/app">
                      <span className="inline-block mt-5 bg-stone-800 text-stone-50 px-5 py-2 rounded-[3px] hover:scale-105 scale-100 tracking-widest duration-300">
                        {t.app.more_info}
                      </span>
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
  );
}

/* =================================================================
   Utilities
   ================================================================= */
function ensureURL(u = "") {
  return String(u).replace(/\/+$/, "");
}
