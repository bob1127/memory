import { useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, useReducedMotion } from "framer-motion";
import Layout from "./Layout";
import ParallaxImage from "../components/ParallaxImage";

/* ========== 設定網域 (SEO 用) ========== */
// 請務必修改為您的實際網域 (不含結尾斜線)
const SITE_DOMAIN = "https://www.memory-dining.com";

/* ========== 1. i18n 資料 ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "加盟說明與常見問題 | 有香餐飲集團",
      description:
        "了解有香餐飲集團的加盟優勢。我們提供統一品牌形象、創新研發團隊、專業培訓與擴店經驗。查看加盟費用、食材採購等常見問題解答。",
      keywords:
        "有香餐飲集團, 加盟, 餐飲創業, 中央廚房, 台灣美食加盟, 溫哥華餐飲",
      siteName: "有香餐飲集團 Memory Dining Group", // 網站名稱中文化
      ogLocale: "zh_TW", // FB/IG 用的語系代碼
    },
    hero: {
      title: "為什麼選擇加盟有香？",
      desc: "集團擁有多年餐飲經驗，從產品研發、門市營運到行銷推廣，皆具備成熟的系統與完善資源。我們提供可複製的成功模式與完善支援，加盟主可快速上手核心營運、穩定獲利。",
      subtitle: "加盟創業首選品牌",
    },
    features: [
      {
        tag: "品牌",
        title: "品牌統一形象",
        desc: "加盟店將融入有香集團品牌形象，有助於新店建立穩固的顧客忠誠度。",
        img: "/images/participation/C0262 - frame at 0m0s.webp",
      },
      {
        tag: "研發",
        title: "研發團隊不斷創新",
        desc: "以傳統工法為基礎，融合創新思維，用心打造每一道能代表品牌精神的料理。",
        img: "/images/participation/炒菜.png",
      },
      {
        tag: "培訓",
        title: "專業員工培訓 與擴店經驗",
        desc: "提供豐富且專業的員工培訓流程，並將多年的擴店經驗完整傳授給加盟店，確保營運效率和品質。",
        img: "/images/participation/DSC06648.webp",
      },
    ],
    slogan: {
      line1: "延續台灣正宗美食的",
      line2: "傳承與創新",
      faq: "FAQ",
    },
    faq: [
      {
        q: "加盟需要花費多少錢?",
        a: [
          "加盟採取量身規劃的方式，例如加盟業者已有合適的硬體設備(例如:厨房冰箱、不锈钢壁面、吊掛招牌...等等)，討論和確認合過後，都可以物盡其用保留使用。",
          "下一步，我們會依據加盟店的規模，進一步討論需要補購買的用品、設備以及硬體裝潢，費用會分項進行報價。因此加盟費用會依據不同加盟業者是否已有合適的設備和營業場地大小，在費用上會有所差別。",
        ],
      },
      {
        q: "是否所有食材以及調味料都需要與有香餐飲集團購買?",
        a: [
          "有香餐飲集團為了嚴格控管產品製程、追求口味和品質一致性，2022年成立了有香中央厨房。在合約中，會明確就明為了保障產品口味一致性，有些品质屬於加盟店必須跟有香中央廚房購買，同時，有些品項和食品則是自由開放讓加盟店選擇自行購買或向中央府房購買。",
        ],
      },
      {
        q: "和中央廚房購買食材的優點?是否有專人配送?",
        a: [
          "有些食材在規範中必須與中央府房購買，除了確保提供的餐點品質和口味一致性，同時也能為加盟店帶來以下優點:",
        ],
        list: [
          "● 加盟店可以大大降低人員費心處理食材的時間和人力。",
          "● 中央廚房進貨量大，能幫加盟店壓低獨自進貨的成本。",
          "● 下單的方式:加盟店電話下單，即安排專人包貨且免費運送到門店。",
        ],
      },
      {
        q: "為什麼要選擇加盟有香?",
        a: [],
        list: [
          "● 有香餐飲品牌已在溫哥華地區遠近馳名。",
          "● 專人教育培訓。",
          "● 專人給予店面選址的專業市場評估。",
          "● 針對營業用硬體設備、廚房器具以及裝潢給予專業的建議。",
          "● 保障加盟店家的營業商圈。",
        ],
      },
    ],
    cta: "立即了解",
    ctaLink: "/participation-form",
    breadcrumb: "加盟說明",
  },
  en: {
    meta: {
      title: "Franchise Info & FAQ | Memory Dining Group",
      description:
        "Discover the advantages of franchising with Memory Dining Group. We offer unified branding, innovative R&D, and professional training. Find answers to FAQs about costs and supplies.",
      keywords:
        "Memory Dining Group, Franchise, Restaurant Business, Central Kitchen, Taiwanese Cuisine",
      siteName: "Memory Dining Group", // 英文網站名稱
      ogLocale: "en_US", // 英文語系代碼
    },
    hero: {
      title: "Why Choose Memory Dining Group?",
      desc: "With years of F&B experience, we possess mature systems and resources from R&D to marketing. We provide a replicable success model and comprehensive support, helping franchisees quickly master operations and achieve stable profits.",
      subtitle: "Top Choice for Franchising",
    },
    features: [
      {
        tag: "Brand",
        title: "Unified Brand Image",
        desc: "Franchise stores will integrate into the Memory Group brand image, helping new stores build solid customer loyalty.",
        img: "/images/participation/C0262 - frame at 0m0s.webp",
      },
      {
        tag: "R&D",
        title: "Innovative R&D Team",
        desc: "Based on traditional methods infused with innovative thinking, we carefully craft every dish to represent the brand spirit.",
        img: "/images/participation/炒菜.webp",
      },
      {
        tag: "Training",
        title: "Professional Training & Experience",
        desc: "We provide rich and professional staff training processes and impart years of expansion experience to franchisees to ensure operational efficiency and quality.",
        img: "/images/participation/DSC06648.webp",
      },
    ],
    slogan: {
      line1: "Continuing the Heritage and Innovation",
      line2: "of Authentic Taiwanese Cuisine",
      faq: "FAQ",
    },
    faq: [
      {
        q: "How much does it cost to franchise?",
        a: [
          "Franchising is planned on a tailored basis. If the franchisee already has suitable hardware (e.g., kitchen fridges, stainless steel walls, signage), we can discuss retaining them.",
          "Next, we will discuss necessary purchases for supplies, equipment, and decoration based on the store scale. Costs are quoted itemized, so fees vary depending on existing equipment and venue size.",
        ],
      },
      {
        q: "Do all ingredients and seasonings need to be purchased from Memory Group?",
        a: [
          "To strictly control product processes and ensure consistency, Memory Dining Group established a Central Kitchen in 2022. The contract specifies that certain items must be purchased from the Central Kitchen to guarantee taste consistency, while others are open for franchisees to purchase independently or from us.",
        ],
      },
      {
        q: "What are the benefits of purchasing from the Central Kitchen? Is there delivery?",
        a: [
          "Purchasing regulated ingredients from the Central Kitchen ensures quality and consistency, and offers the following benefits:",
        ],
        list: [
          "● Reduces time and labor for processing ingredients.",
          "● Lowers costs due to the Central Kitchen's bulk purchasing.",
          "● Ordering method: Order by phone, and we arrange dedicated packing and free delivery to the store.",
        ],
      },
      {
        q: "Why choose Memory Dining Group?",
        a: [],
        list: [
          "● A well-known brand in the Vancouver area.",
          "● Professional education and training.",
          "● Professional market assessment for store location.",
          "● Expert advice on hardware, kitchen utensils, and decoration.",
          "● Protection of the franchisee's business district.",
        ],
      },
    ],
    cta: "Learn More",
    ctaLink: "/participation-form",
    breadcrumb: "Franchise Info",
  },
};

/* ========== 2. SSG 設定 ========== */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: { t, locale },
  };
}

/* ========== 3. 動畫組件 ========== */
function FadeUp({
  children,
  className = "",
  delay = 0,
  distance = 96,
  amount = 0.3,
}) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, filter: "blur(6px)" }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 1.05,
          delay,
        },
      }}
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

/* ========== 4. 頁面組件 ========== */
export default function FranchiseInfoPage({ t, locale }) {
  const router = useRouter();

  // 取得目前完整路徑 (Canonical URL)
  const currentPath = router.asPath; // 例如: "/franchise-info" 或 "/en/franchise-info"
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;

  // 構建不同語言版本的 URL (hreflang 用)
  // 假設 defaultLocale 是 "zh-TW" 且不顯示前綴，英文版有 "/en" 前綴
  // 實際路徑需根據您的 next.config.js 設定，這裡使用通用邏輯：
  const pathWithoutLocale = router.asPath.replace(`/${locale}`, "") || "/";
  const zhUrl = `${SITE_DOMAIN}${
    pathWithoutLocale === "/" ? "" : pathWithoutLocale
  }`; // 中文 (Default)
  const enUrl = `${SITE_DOMAIN}/en${
    pathWithoutLocale === "/" ? "" : pathWithoutLocale
  }`; // 英文

  const ogImage = `${SITE_DOMAIN}/images/participation/C0262 - frame at 0m0s.webp`;

  /* --- 結構化資料 (JSON-LD) --- */

  // 1. FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale, // 加入語言標記
    mainEntity: t.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${item.a.join(" ")} ${item.list ? item.list.join(" ") : ""}`,
      },
    })),
  };

  // 2. Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "en" ? "Home" : "首頁",
        item: `${SITE_DOMAIN}/${locale === "en" ? "en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.breadcrumb,
        item: canonicalUrl,
      },
    ],
  };

  // 3. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Memory Dining Group",
    alternateName: "有香餐飲集團",
    url: SITE_DOMAIN,
    logo: `${SITE_DOMAIN}/logo.png`,
    description: t.meta.description, // 描述也會隨語言切換
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vancouver",
      addressCountry: "CA",
    },
  };

  const jsonLd = [faqSchema, breadcrumbSchema, organizationSchema];

  return (
    <Layout>
      <Head>
        {/* --- 基本 Meta (全動態) --- */}
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        {/* --- 語言替換 (Hreflang) 關鍵 --- */}
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        {/* --- Open Graph / Facebook (全動態) --- */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:site_name" content={t.meta.siteName} />{" "}
        {/* 這裡現在會切換了 */}
        <meta property="og:locale" content={t.meta.ogLocale} />{" "}
        {/* 這裡現在會切換了 */}
        {/* 圖片通常共用，但 Alt 必須切換 */}
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={t.hero.title} />
        {/* --- Twitter Card --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <meta name="twitter:image" content={ogImage} />
        {/* --- JSON-LD 注入 --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <ReactLenis root>
        <div className="bg-[#ede5d6]">
          {/* 視覺留白 */}
          <div className="py-14 sm:py-16"></div>

          {/* ============ Why Section ============ */}
          <section className="section_why relative z-10">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
              {/* 標題區 */}
              <header className="flex flex-col items-center text-center">
                <FadeUp>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#3b2a1a]">
                    {t.hero.title}
                  </h1>
                </FadeUp>
                <FadeUp delay={0.06}>
                  <p className="mt-5 max-w-prose text-base sm:text-[17px] leading-relaxed text-stone-800/90">
                    {t.hero.desc}
                  </p>
                </FadeUp>
              </header>

              <h2 className="text-[32px] mt-20 mx-auto font-bold text-center text-[#3b2a1a]">
                {t.hero.subtitle}
              </h2>

              {/* Features List */}
              <div className="mt-16 lg:mt-20 space-y-24">
                {t.features.map((feature, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <article
                      key={index}
                      className="grid grid-cols-1 lg:grid-cols-2 items-center gap-y-10 gap-x-12"
                    >
                      {/* 文字區塊 */}
                      <div
                        className={`flex justify-center ${
                          !isEven ? "lg:order-1" : ""
                        }`}
                      >
                        <div className="flex flex-col">
                          <FadeUp
                            delay={0.04}
                            className="tag border border-black/20 bg-stone-800 text-[#efa33f] rounded-full px-3 py-1 w-auto max-w-[150px] flex justify-center mb-5 text-sm font-medium"
                          >
                            {feature.tag}
                          </FadeUp>
                          <FadeUp delay={0.08}>
                            <h3 className="text-3xl sm:text-4xl font-bold text-[#3b2a1a]">
                              {feature.title}
                            </h3>
                          </FadeUp>
                          <FadeUp delay={0.12}>
                            <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-stone-800/90">
                              {feature.desc}
                            </p>
                          </FadeUp>
                        </div>
                      </div>

                      {/* 圖片區塊 (Parallax) */}
                      <FadeUp
                        delay={0.08}
                        amount={0.25}
                        className={!isEven ? "order-1 lg:order-none" : ""}
                      >
                        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                          <ParallaxImage
                            src={feature.img}
                            alt={feature.title}
                          />
                        </div>
                      </FadeUp>
                    </article>
                  );
                })}
              </div>

              {/* Slogan & FAQ Title */}
              <div className="mt-20 lg:mt-24 flex flex-col items-center text-center">
                <FadeUp>
                  <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#3b2a1a]">
                    {t.slogan.line1}
                    <br />
                    {t.slogan.line2}
                  </p>
                  <h2 className="text-4xl mt-3 sm:text-5xl font-extrabold tracking-tight text-[#c91e1e]">
                    {t.slogan.faq}
                  </h2>
                </FadeUp>
              </div>
            </div>
          </section>

          {/* ============ FAQ Section ============ */}
          <section
            className="section_faq"
            aria-label="Frequently Asked Questions"
          >
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-6 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
                {t.faq.map((item, index) => (
                  <FadeUp key={index} delay={index * 0.06}>
                    <div className="h-full rounded-2xl bg-white/80 border border-black/5 p-8 sm:p-10 md:p-12 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[#3b2a1a]">
                        {item.q}
                      </h3>
                      <div className="leading-relaxed text-stone-800/90 space-y-4 text-base">
                        {item.a.map((ans, i) => (
                          <p key={i}>{ans}</p>
                        ))}
                        {item.list && (
                          <ul className="space-y-2 mt-4">
                            {item.list.map((li, i) => (
                              <li key={i}>{li}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

              {/* CTA Button */}
              <FadeUp delay={0.24}>
                <div className="flex justify-center mt-12">
                  <Link
                    href={t.ctaLink}
                    title={t.cta}
                    className="
                      inline-block bg-stone-800 text-[#dd8b34] rounded-full px-8 py-3 font-semibold text-lg
                      shadow-[4px_4px_0_0_#7d7d7c] 
                      transition-all duration-200 
                      hover:translate-x-[-2px] hover:translate-y-[-2px] 
                      hover:shadow-[6px_6px_0_0_#7d7d7c]
                      active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#7d7d7c]
                    "
                  >
                    {t.cta}
                  </Link>
                </div>
              </FadeUp>
            </div>
          </section>
        </div>
      </ReactLenis>
    </Layout>
  );
}
