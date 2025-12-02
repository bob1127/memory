"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Layout from "./Layout";

/* ========== 動畫設定 ========== */
const easeOut = [0.22, 1, 0.36, 1];
function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/* ========== 資料設定 ========== */

// 1. Tab 選單
const TABS = [
  { id: "group", label: "關於集團" },
  { id: "youxiang", label: "關於有香" },
  { id: "memory", label: "關於憶點點" },
  { id: "corner", label: "關於有香ㄟ灶腳" },
];

// 2. 門市資料 (側邊欄)
const STORE_BY_TAB = {
  group: [
    {
      id: "store-group-1",
      name: "Group Flagship",
      tel: "(000) 123-4567",
      addrLine1: "123 Example St",
      addrLine2: "Vancouver BC 000 000",
      hours: "11:00 AM–10:00 PM",
      img: "/images/brand-story/memory-corner-01.png",
      mapUrl: "https://www.google.com/maps",
    },
  ],
  youxiang: [
    {
      id: "store-youxiang-van",
      name: "Vancouver",
      tel: "(604) 284-5434",
      addrLine1: "1110-4651 Garden City Rd",
      addrLine2: "Richmond BC V6X 2K4",
      hours: "11:30 AM–10:30 PM",
      img: "/images/brand-story/memory-corner-01.png",
      mapUrl:
        "https://www.google.com/maps/place/1110-4651+Garden+City+Rd,+Richmond,+BC+V6X+2K4",
    },
  ],
  memory: [
    {
      id: "store-memory-1",
      name: "Sweet Memory 憶點點",
      tel: "(604) 370 - 2882",
      addrLine1: "8080 Leslie Rd",
      addrLine2: "Richmond, BC V6X 4A8",
      hours: "11:30 AM–12:30 AM",
      img: "/images/brand-story/憶點點/DSC07015.jpg", // 圖片路徑維持原樣，若有新圖請自行更換檔名
      mapUrl:
        "https://maps.google.com/?cid=11719382924442405009&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ",
    },
  ],
  corner: [], // 灶腳暫無門市資料
};

/* ========== 獨立內容組件區 ========== */

// 1. 關於集團
const ContentGroup = () => (
  <div className="space-y-8">
    <div className="border-t border-[#c9b79a] pt-6">
      <div className="mb-6 border border-[#c9b79a] flex flex-row bg-white">
        <Image
          src="/images/brand-story/集團/集團banner.png"
          alt="集團緣起"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="space-y-4 text-[16px] flex flex-col justify-center items-center max-w-[700px] mx-auto leading-8 tracking-[0.05em] text-[#3b2a1a]">
        <h1 className="mb-6 text-4xl font-bold leading-relaxed md:text-5xl">
          有香餐飲集團的緣起
        </h1>

        <p>
          有香餐飲集團的故事始於1975年台灣高雄，吳爺爺為了提升家人的生活，毅然放棄穩定高薪的工作，創立了小餐館。他每日清晨騎腳踏車跋涉三小時，拜師學習台灣傳統羊肉料理。這份對美食的執著，讓吳家羊肉鍋成為高雄饕客們心中的珍寶。
        </p>
        <p>
          隨著歲月流轉，吳爺爺將這獨特的秘方傳給了吳爸爸，餐館逐步成為高雄當地人熟知的經典小館，名聲遠播。
        </p>
        <p>
          後來，由於吳家移民加拿大，吳家餐館停業，成為吳爺爺心中難以釋懷的遺憾。然而，這份傳承並未因此終止。成長於加拿大的吳家長孫，自小立志成為廚師，對爺爺的好手藝念念不忘。經歷多年的學習和努力，他終於決心讓這份家族的味道重現異鄉，並在大溫地區創立了「有香餐飲集團」。
        </p>
        <p>
          「有香」這個名字源自爺爺與奶奶的名字，承載著對家族傳承最深的敬意與思念。這不只是名字，更是一份情感的延續，一段家的記憶。
        </p>
        <p>
          有香餐飲集團深切地希望，這份跨越時空與國界的家族風味，能溫暖每一位顧客的心，讓台灣的飲食文化在北美大地上重新綻放光芒，傳遞家的溫度與歸屬感，成為人們心中熟悉又難忘的味道。
        </p>
      </div>
    </div>
  </div>
);

// 2. 關於有香
const ContentYouxiang = () => (
  <div className="space-y-10">
    {/* 緣起 */}
    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        【緣起】
      </h2>
      <h1 className="mb-6 text-2xl font-bold leading-relaxed md:text-5xl">
        在家的味道，乘載記憶的角落
      </h1>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/DSC06790.jpg"
          alt="有香緣起"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <p className="mb-4 text-[11px] tracking-[0.2em] text-[#7b5b33]">
        老屋中的一磚一瓦，傳承四十年的古厝。
      </p>
      <div className="space-y-3 text-[16px] leading-relaxed tracking-[0.05em] text-[#3b2a1a]">
        <p>
          「有香」象徵著餐桌上那一縷柴火香、醬油香與湯頭香，是一家人團聚時最真實的味道。從開店第一天起，我們就希望端上的不是制式料理，而是一桌足以讓人想起家人的家常菜。
        </p>
        <p>
          店內主打多款鍋物、滷味與台式小菜，堅持選用當季食材與家傳的滷汁比例，不追求浮誇的擺盤，只在乎入口後那一刻，心裡浮現的是否是「啊，這就是我熟悉的味道」。
        </p>
        <p>
          無論你是一個人來吃碗麵，還是揪三五好友圍爐，有香都希望成為你在異鄉的第二個餐桌。當燈光亮起、熱騰騰的鍋氣升起，歡笑與交談聲自然而然在空氣裡流動——這就是我們一直想守護的畫面。
        </p>
      </div>
    </div>

    {/* 光采 */}
    <div className="border-t pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        【光采】
      </h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/2">
          <div className="border border-[#c9b79a] bg-white">
            <Image
              src="/images/brand-story/memory-corner-02.png"
              alt="有香光采"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-3 text-[11px] tracking-[0.2em] text-[#7b5b33]">
            牆上一面面獎牌，是老屋中一磚一瓦傳承四十年的古厝。
          </p>
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h3 className="text-3xl leading-snug md:text-4xl">
            以榮譽為延續，
            <br />
            為熱情守初心
          </h3>
          <div className="mt-4 space-y-3 text-[16px] leading-relaxed tracking-[0.05em]">
            <p>
              這些年來，有香屢獲各式獎項與肯定：從地方票選人氣餐廳、到美食媒體專題報導，每一面獎牌的背後，都是團隊在廚房裡一鍋一鍋反覆試驗的結果。
            </p>
            <p>
              對我們來說，獎牌不只是光環，更是一種提醒——提醒自己不能被掌聲沖昏頭，仍要保有最初那份對料理的執著與熱情。
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* 老味道 */}
    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        【老味道】
      </h2>
      <div className="border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/DAV01968.jpg"
          alt="有香老味道"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="mt-6 space-y-3 text-[16px] leading-relaxed tracking-[0.05em]">
        <p className="text-2xl font-bold leading-relaxed md:text-3xl">
          這扇門，已在有香靜靜敞開，
          <br />
          只等你推門而入，
          <br />
          與台灣的美好不期而遇。
        </p>
        <p>
          店內集結收藏台灣各種懷舊老物，每一件陳設都藏著台灣人兒時共同的回憶。復古的用餐氛圍與環境，讓人彷彿走進時光隧道，嗅到的是老街巷弄裡熟悉的香味。
        </p>
      </div>
    </div>
  </div>
);

// 3. 關於憶點點
const ContentMemory = () => (
  <div className="space-y-8">
    <div className="border-t border-[#c9b79a] pt-6">
      <h1 className="mb-6 text-3xl font-bold leading-relaxed md:text-5xl">
        跨越時間，連接思念與幸福
      </h1>

      {/* 緣起區塊 */}
      <div className="border-b border-[#7b5b33] mb-4 mt-8">
        <h2 className="mb-4 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          【緣起】
        </h2>
      </div>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/憶點點/DSC07015.jpg"
          alt="憶點點緣起"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="space-y-4 max-w-[700px] text-[15px] md:text-[16px] leading-8 tracking-[0.05em] text-[#3b2a1a]">
        <p>
          「憶點點」的由來，「Sweet
          Memory」一個承載美好回憶的名字，寓意著那些深藏心底、歷久彌新的甜蜜瞬間。
        </p>
        <p>
          在為它尋找中文名的過程中，經過無數次推敲與思索，一個名字如記憶般悄然浮現——「憶點點」。為什麼不是「一點點」，而是「憶點點」？因為回憶的力量，從來不只是「一點點」，它能跨越時間，帶給我們無限大的能量。
        </p>
        <p>
          「憶點點」不僅僅是一家餐廳，更像一座時光驛站，承載著伍父親手烘焙甜點、烹製古早味鹹食的溫暖回憶。
        </p>
      </div>

      {/* 堅持區塊 */}
      <div className="border-b border-[#7b5b33] mb-4">
        <h2 className="mb-4 mt-8 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          【堅持】
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <div className="border border-[#c9b79a] bg-white">
            <Image
              src="/images/brand-story/憶點點/DSC07378.jpg"
              alt="憶點點堅持"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-2 text-[11px] tracking-[0.2em] text-[#7b5b33]">
            老屋中的一磚一瓦，傳承四十年的古厝。
          </p>
        </div>
        <div className="md:w-1/2 md:p-5">
          <div className="space-y-4 text-[15px] md:text-[16px] leading-8 tracking-[0.05em] text-[#3b2a1a]">
            <h3 className="text-2xl md:text-3xl font-bold">
              古早味的好味道，
              <br />
              從備料開始用心
            </h3>
            <p>
              每天現做、用心備料，只為保留最純粹的古早味、甜點鹹食皆手工製作，真材實料，吃到記憶中的那一口幸福溫度。
            </p>
          </div>
        </div>
      </div>

      {/* 老味道區塊 */}
      <div className="border-b border-[#7b5b33] mb-4">
        <h2 className="mb-4 mt-8 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          【老味道】
        </h2>
      </div>
      <div>
        <div className="border border-[#c9b79a] bg-white">
          <Image
            src="/images/brand-story/憶點點/DSC06868.jpg"
            alt="憶點點老味道"
            width={880}
            height={520}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="mt-2 text-[11px] tracking-[0.2em] text-[#7b5b33]">
          老屋中的一磚一瓦，傳承四十年的古厝。
        </p>

        <div className="mt-8 space-y-4 text-[15px] md:text-[16px] leading-8 tracking-[0.05em] text-[#3b2a1a]">
          <h3 className="text-2xl md:text-3xl font-bold">
            我們邀您一同走進記憶深處，
            <br />
            細細品嚐那些熟悉卻已久遠的兒時味道
          </h3>
          <p>
            在「憶點點」，我們真心相待，無論您來自何處，每位踏入這裡的客人，都能透過一口甜點、一份古早味，尋回記憶中的那抹溫暖，將思念化為心頭的蜂蜜。
          </p>
        </div>
      </div>
    </div>
  </div>
);

// 4. 關於有香ㄟ灶腳
const ContentCorner = () => (
  <div className="space-y-8 min-h-[300px] flex items-center justify-center border-t border-[#c9b79a] pt-6">
    <div className="text-center">
      <h2 className="mb-4 text-xl font-bold tracking-[0.2em] text-[#7b5b33]">
        籌備中
      </h2>
      <p className="text-sm tracking-widest text-gray-500">
        敬請期待更多美味故事...
      </p>
    </div>
  </div>
);

/* ========== 門市卡片元件 ========== */
function StoreCard({ store }) {
  return (
    <div className="border border-[#c9b79a] bg-[#f7ecdd]">
      <a
        href={store.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-b border-[#c9b79a]"
      >
        <Image
          src={store.img}
          alt={store.name}
          width={400}
          height={260}
          className="h-auto w-full object-cover"
        />
      </a>
      <div className="px-4 pb-4 pt-3">
        <a
          href={store.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#4b2c1d] px-4 py-1 text-center text-sm font-semibold text-white hover:bg-[#613625] transition-colors"
        >
          {store.name}
        </a>
        <div className="mt-3 space-y-1 text-xs leading-relaxed">
          <p>{store.tel}</p>
          <p>
            {store.addrLine1}
            <br />
            {store.addrLine2}
          </p>
          <p>{store.hours}</p>
        </div>
      </div>
    </div>
  );
}

/* ========== 主頁面 ========== */
export default function BrandStoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. 處理 URL Tab 狀態
  const tabFromUrl = useMemo(() => {
    const t = searchParams.get("tab") || "";
    const exists = TABS.some((tab) => tab.id === t);
    return exists ? t : "youxiang";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (tabFromUrl !== activeTab) setActiveTab(tabFromUrl);
  }, [tabFromUrl, activeTab]);

  const handleTabClick = (id) => {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 2. 決定要渲染哪個內容組件
  const renderContent = () => {
    switch (activeTab) {
      case "group":
        return <ContentGroup />;
      case "youxiang":
        return <ContentYouxiang />;
      case "memory":
        return <ContentMemory />;
      case "corner":
        return <ContentCorner />;
      default:
        return <ContentYouxiang />;
    }
  };

  // 3. 取得【頁首】背景圖 (上方)
  const getHeaderBg = () => {
    switch (activeTab) {
      case "group":
        return "/images/brand-story/集團/DAV02074.jpg";
      case "youxiang":
        return "/images/index/about/DAV01968.jpg";
      case "memory":
        return "/images/brand-story/憶點點/DSC07015.jpg";
      case "corner":
        return "/images/brand-story/memory-corner-01.png";
      default:
        return "/images/index/about/DAV01968.jpg";
    }
  };

  // 4. 取得【頁尾】背景圖 (下方) - 🔥 您可以在這裡設定不同的頁尾圖片
  const getFooterBg = () => {
    switch (activeTab) {
      case "group":
        return "/images/brand-story/DAV01915.png";
      case "youxiang":
        return "/images/brand-story/DAV01915.png";
      case "memory":
        return "/images/brand-story/DAV01915.png";
      case "corner":
        return "/images/brand-story/DAV01915.png";
      default:
        return "/images/brand-story/DAV01915.png";
    }
  };

  return (
    <Layout>
      <main className="min-h-screen text-[#3b2a1a] bg-[#f0e3cd] relative ">
        {/* Header 背景圖 (由下往上透明) */}
        <div
          className="absolute top-0 opacity-15 left-0 w-full z-[1] h-[550px] bg-center bg-cover bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url('${getHeaderBg()}')` }}
        ></div>

        <div className="mx-auto max-w-[1380px] z-50 relative px-4 pb-20 pt-[200px]">
          {/* 上方 Tabs 按鈕 */}
          <FadeUp>
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`
                      relative px-10 py-2.5 text-sm tracking-[0.25em]
                      border border-[#c59b63]
                      transition-all duration-500
                      ${
                        isActive
                          ? "bg-[#c2914b] text-white shadow-sm"
                          : "bg-transparent text-[#945829] hover:bg-[#e8d3b4]"
                      }
                    `}
                    style={{ letterSpacing: "0.35em" }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </FadeUp>

          {/* 品牌 Logo 區 */}
          <FadeUp delay={0.05}>
            <section className="mt-10 sm:mb-[100px] mb-10 xl:mb-[160px] relative">
              <div className="absolute z-50 left-1/2 -translate-x-1/2 w-screen pointer-events-none bg-gradient-to-t from-[#f0e3cd] to-transparent h-72 bottom-[50px] sm:bottom-[-0px] md:h-52 md:bottom-[-100px]" />
              <div className="mx-auto max-w-[960px] relative z-[99999] px-4 py-6">
                <div className="space-y-[3px]">
                  <div className="h-[2px] bg-[#2b211a]" />
                  <div className="h-[2px] bg-[#2b211a]" />
                </div>
                <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:justify-between">
                  <div className="text-[15px] tracking-[0.6em] text-[#2b211a]">
                    鹹 食 甜 食
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="hidden h-16 w-px bg-[#2b211a] md:block" />
                    <div className="flex flex-col items-center">
                      <span className="text-[34px] leading-none tracking-[0.55em] text-[#2b211a]">
                        有 香
                      </span>
                      <span className="mt-2 text-sm font-medium uppercase tracking-[0.4em] text-[#2b211a]">
                        Memory Corner
                      </span>
                    </div>
                    <div className="hidden h-16 w-px bg-[#2b211a] md:block" />
                  </div>
                  <div className="text-[15px] tracking-[0.6em] text-[#2b211a]">
                    台 灣 小 吃
                  </div>
                </div>
                <div className="mt-6 space-y-[3px]">
                  <div className="h-[2px] bg-[#2b211a]" />
                  <div className="h-[2px] bg-[#2b211a]" />
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 主要內容區 */}
          <section className="relative grid gap-10 md:grid-cols-[280px,minmax(0,1fr)] bg-[#f0e3cd]">
            {/* 左欄 Sticky 門市列表 */}
            <aside className="sticky md:top-28 self-start">
              <FadeUp delay={0.08}>
                <div className="space-y-8">
                  {(STORE_BY_TAB[activeTab] || []).length > 0 ? (
                    STORE_BY_TAB[activeTab].map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))
                  ) : (
                    <div className="p-4 border border-[#c9b79a] text-center text-xs text-[#7b5b33] tracking-widest">
                      此品牌目前無相關門市資訊
                    </div>
                  )}
                </div>
              </FadeUp>
            </aside>

            {/* 右欄 動態切換內容 */}
            <div className="space-y-10 z-10">
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeTab}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: easeOut }}
                >
                  {renderContent()}
                </motion.article>
              </AnimatePresence>

              {/* 底部「更多訊息」連結 */}
              <FadeUp delay={0.1}>
                <section className="mt-10 border-t border-[#c9b79a] pt-8">
                  <button className="flex items-center gap-3 text-sm tracking-[0.35em] text-[#7b5b33] hover:text-[#5a4225] transition-colors">
                    <span>更 多 訊 息</span>
                    <span className="inline-block h-[1px] w-24 bg-[#7b5b33]" />
                    <span className="inline-block h-2 w-2 rounded-full border border-[#7b5b33]" />
                  </button>
                </section>
              </FadeUp>
            </div>
          </section>
        </div>

        {/* Footer 背景圖 (由上往下透明) */}
        <div className=" h-[130px] lg:h-[330px]">
          <div
            className="absolute bottom-[0px] opacity-25 left-0 w-full z-[0] h-[150px] lg:h-[350px] bg-center bg-cover bg-no-repeat transition-all duration-700 pointer-events-none"
            style={{ backgroundImage: `url('${getFooterBg()}')` }} // 使用 getFooterBg()
          >
            {/* 漸層遮罩：從頂部的背景色(#f0e3cd) 漸變到透明 */}
            <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-[#f0e3cd] to-transparent"></div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
