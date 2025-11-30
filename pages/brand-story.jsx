// app/brand-story/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Layout from "./Layout";

/* ========== 共用：柔順 FadeUp ========== */
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

/* ========== Tabs 文案 (維持原樣) ========== */
const TABS = [
  {
    id: "group",
    label: "關於集團",
    title: "有家的味道，承載記憶的角落",
    paragraphs: [
      "有香，不只是一間餐館，更是一道通往「家」的門。以五十年古厝的溫度，傳承與守護最真摯的台灣古早味記憶。",
      "故事的起點，可以追溯到一九七五年的台灣高雄。老屋中的一磚一瓦，見證了數十年的歲月，更承載著阿公阿嬤那一代相傳的味道。從第一鍋熱騰騰的湯開始，我們就希望能把這份踏實、安心的家常味，帶到每一個在異鄉打拚的遊子身邊。",
      "有香餐飲集團以「家」為核心，將台灣街頭的庶民小吃、辦桌菜餚、巷口宵夜，一一整理、研究、重現，用最熟悉的味道，陪伴大家走過每一段人生旅程。期待當你推開門走進店裡的瞬間，聞到的不是陌生的餐廳氣味，而是彷彿回到老家廚房的那股暖香。",
    ],
  },
  {
    id: "youxiang",
    label: "關於有香",
    title: "在家的味道，乘載記憶的角落",
    paragraphs: [
      "「有香」象徵著餐桌上那一縷柴火香、醬油香與湯頭香，是一家人團聚時最真實的味道。從開店第一天起，我們就希望端上的不是制式料理，而是一桌足以讓人想起家人的家常菜。",
      "店內主打多款鍋物、滷味與台式小菜，堅持選用當季食材與家傳的滷汁比例，不追求浮誇的擺盤，只在乎入口後那一刻，心裡浮現的是否是「啊，這就是我熟悉的味道」。",
      "無論你是一個人來吃碗麵，還是揪三五好友圍爐，有香都希望成為你在異鄉的第二個餐桌。當燈光亮起、熱騰騰的鍋氣升起，歡笑與交談聲自然而然在空氣裡流動——這就是我們一直想守護的畫面。",
    ],
  },
  {
    id: "memory",
    label: "關於憶點點",
    title: "用甜點，把回憶變成日常儀式",
    paragraphs: [
      "「憶點點」是一間以記憶為主題的甜點空間，每一款甜點都藏著一段關於童年、街口攤販或節日餐桌的故事。我們相信，甜不只是味覺，更是一種情感的喚醒。",
      "將鳳梨酥、芋頭、花生、麥芽等台灣元素轉化成現代甜點，把大家熟悉的味道重新排列組合，讓你在忙碌的生活裡，也能替自己保留一小段專屬的儀式感。",
      "在這裡，你可以慢慢喝完一杯飲品、細細品嚐一塊蛋糕，暫時把時間放慢。那些以為早已淡去的味道與回憶，會在不經意的瞬間被輕輕翻起。",
    ],
  },
  {
    id: "corner",
    label: "關於有香ㄟ灶腳",
    title: "巷口那鍋熱湯，還在等你回來",
    paragraphs: [
      "有香ㄟ灶腳，是一間專賣台灣小吃與宵夜的「深夜食堂」。靈感來自巷口永遠燈火通明的小攤，無論多晚，只要轉進那條巷子，就知道有人在等你回家吃飯。",
      "滷肉飯、鹹酥雞、乾麵、熱湯……這些陪伴無數台灣人成長的小吃，是我們最捨不得忘記的日常滋味。試著把這些味道原汁原味帶到異地，讓每一位走進灶腳的人，都能在一碗熱湯裡，找到心安的力量。",
      "也許你下班已經很晚，也許你只是路過，但只要看見那盞還亮著的燈，我們都希望你知道：這裡永遠留著一個位置給你。",
    ],
  },
];

/* ========== 各 tab 對應門市資料 (維持原樣) ========== */
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
    {
      id: "store-youxiang-coq",
      name: "Coquitlam",
      tel: "(604) 917-0168",
      addrLine1: "345 North Rd, Coquitlam",
      addrLine2: "BC V3K 3V8",
      hours: "11:30 AM–11:00 PM",
      img: "/images/brand-story/memory-corner-01.png",
      mapUrl:
        "https://www.google.com/maps/place/345+North+Rd,+Coquitlam,+BC+V3K+3V8",
    },
  ],
  memory: [
    {
      id: "store-memory-1",
      name: "Memory Corner Cafe",
      tel: "(000) 888-8888",
      addrLine1: "88 Sweet St",
      addrLine2: "Coquitlam BC 000 000",
      hours: "12:00 PM–09:30 PM",
      img: "/images/brand-story/memory-corner-01.png",
      mapUrl: "https://www.google.com/maps",
    },
  ],
  corner: [
    {
      id: "store-corner-1",
      name: "Night Market",
      tel: "(000) 999-9999",
      addrLine1: "99 Corner Rd",
      addrLine2: "Vancouver BC 000 000",
      hours: "05:00 PM–01:00 AM",
      img: "/images/brand-story/memory-corner-01.png",
      mapUrl: "https://www.google.com/maps",
    },
  ],
};

/* 共用門市卡片元件 */
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

export default function BrandStoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabFromUrl = useMemo(() => {
    const t = searchParams.get("tab") || "";
    const exists = TABS.some((tab) => tab.id === t);
    return exists ? t : "youxiang";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    if (tabFromUrl !== activeTab) setActiveTab(tabFromUrl);
  }, [tabFromUrl, activeTab]);

  const currentTab =
    TABS.find((t) => t.id === activeTab) ??
    TABS.find((t) => t.id === "youxiang");

  const handleTabClick = (id) => {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Layout>
      <main className="min-h-screen text-[#3b2a1a] bg-[#f0e3cd] relative ">
        <div className="absolute top-0 opacity-15 left-0 w-full z-[1] h-[550px] bg-[url('/images/index/about/DAV01968.jpg')] bg-center bg-cover bg-no-repeat"></div>
        <div className="mx-auto max-w-[1380px] z-50 relative px-4 pb-20 pt-[200px]">
          {/* 上方 tabs */}
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

          {/* LOGO 區：依照設計稿 */}
          <FadeUp delay={0.05}>
            <section className="mt-10  sm:mb-[100px] mb-10 xl:mb-[160px] relative">
              {/* ✅ 修正重點：使用 RWD 設定 bottom 距離，避免百分比在手機版跑掉 */}
              <div
                className="absolute z-50 left-1/2  -translate-x-1/2 w-screen pointer-events-none bg-gradient-to-t from-[#f0e3cd] to-transparent
                
             
                h-72 bottom-[50px] sm:bottom-[-0px]

                md:h-52 md:bottom-[-100px]"
              />

              <div className="mx-auto max-w-[960px] relative z-[99999] px-4 py-6">
                {/* 上方雙線 */}
                <div className="space-y-[3px]">
                  <div className="h-[2px] bg-[#2b211a]" />
                  <div className="h-[2px] bg-[#2b211a]" />
                </div>

                {/* 中間主內容 */}
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

                {/* 下方雙線 */}
                <div className="mt-6 space-y-[3px]">
                  <div className="h-[2px] bg-[#2b211a]" />
                  <div className="h-[2px] bg-[#2b211a]" />
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 兩欄 layout */}
          <section className="relative grid gap-10 md:grid-cols-[280px,minmax(0,1fr)] bg-[#f0e3cd]">
            {/* 左欄 sticky 門市 */}
            <aside className="sticky md:top-28 self-start">
              <FadeUp delay={0.08}>
                <div className="space-y-8">
                  {(STORE_BY_TAB[activeTab] ?? []).map((store) => (
                    <StoreCard key={store.id} store={store} />
                  ))}
                </div>
              </FadeUp>
            </aside>

            {/* 右欄內容 */}
            <div className="space-y-10">
              <AnimatePresence mode="wait">
                <motion.article
                  key={currentTab.id}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: easeOut }}
                  className="border-t border-[#c9b79a] pt-6"
                >
                  <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
                    【緣起】
                  </h2>
                  <h1 className="mb-6 text-2xl leading-relaxed md:text-5xl font-bold">
                    {currentTab.title}
                  </h1>

                  <div className="mb-2 border border-[#c9b79a] bg-white">
                    <Image
                      src="/images/brand-story/憶點點/DAV01773 (1).jpg"
                      alt="Memory Corner 外觀"
                      width={880}
                      height={520}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <p className="mb-4 text-[11px] tracking-[0.2em] text-[#7b5b33]">
                    老屋中的一磚一瓦，傳承四十年的古厝。
                  </p>

                  <div className="space-y-3 text-[13px] leading-relaxed tracking-[0.05em] text-[#3b2a1a]">
                    {currentTab.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </motion.article>
              </AnimatePresence>

              {/* 光采區塊 */}
              <FadeUp delay={0.05}>
                <section className="border-t pt-6">
                  <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
                    【光采】
                  </h2>
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="md:w-1/2">
                      <div className="border border-[#c9b79a] bg-white">
                        <Image
                          src="/images/brand-story/memory-corner-02.png"
                          alt="獎牌牆"
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
                      <div className="mt-4 space-y-3 text-[13px] leading-relaxed tracking-[0.05em]">
                        <p>
                          這些年來，有香屢獲各式獎項與肯定：從地方票選人氣餐廳、
                          到美食媒體專題報導，每一面獎牌的背後，都是團隊在廚房裡一鍋一鍋反覆試驗的結果。
                        </p>
                        <p>
                          對我們來說，獎牌不只是光環，更是一種提醒——提醒自己不能被掌聲沖昏頭，仍要保有最初那份對料理的執著與熱情。
                        </p>
                        <p>
                          我們期待用更創新的菜色與更細膩的服務，把這份榮耀轉化成前進的力量，與每一位支持有香的朋友一起分享。
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </FadeUp>

              {/* 老味道區塊 */}
              <FadeUp delay={0.08}>
                <section className="border-t border-[#c9b79a] pt-6">
                  <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
                    【老味道】
                  </h2>
                  <div className="border border-[#c9b79a] bg-white">
                    <Image
                      src="/images/brand-story/DAV01968.jpg"
                      alt="店內環境"
                      width={880}
                      height={520}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  {/* <div className="relative mt-[-80px] flex justify-end pr-6">
                    <div className="inline-block border border-[#c9b79a] bg-white p-1 shadow-md">
                      <Image
                        src="/images/brand-story/banner-01-a.png"
                        alt="熱騰騰的鍋物"
                        width={220}
                        height={220}
                        className="h-auto w-[180px] object-contain"
                      />
                    </div>
                  </div> */}
                  <div className="mt-6 space-y-3 text-[13px] leading-relaxed tracking-[0.05em]">
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
                    <p>
                      從木桌鐵椅、老照片到牆上的布旗，我們想保留的是那份樸實卻真切的生活感。希望每一位坐下來用餐的客人，都能在這裡找到屬於自己的那一份老味道。
                    </p>
                  </div>
                </section>
              </FadeUp>

              {/* 更多訊息 */}
              <FadeUp delay={0.1}>
                <section className="mt-10 border-t border-[#c9b79a] pt-8">
                  <button className=" flex items-center gap-3 text-sm tracking-[0.35em] text-[#7b5b33]">
                    <span>更 多 訊 息</span>
                    <span className="inline-block h-[1px] w-24 bg-[#7b5b33]" />
                    <span className="inline-block h-2 w-2 rounded-full border border-[#7b5b33]" />
                  </button>
                </section>
              </FadeUp>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
