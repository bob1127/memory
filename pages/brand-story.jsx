import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link"; // 新增引用
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./Layout";

/* ========== 設定網域 (使用環境變數) ========== */
const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://memory-ozgp.vercel.app";

/* ========== 1. 資料庫與翻譯內容 (i18n Data) ========== */
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "品牌故事 | Memory Corner 有香餐飲集團",
      description:
        "有香餐飲集團始於1975年，傳承台灣經典美味。旗下包含有香 Memory Corner、Sweet Memory 憶點點等品牌，在北美傳遞家的溫度與正宗台式料理。",
      keywords:
        "有香餐飲集團, Memory Corner, 台灣料理, 溫哥華美食, 品牌故事, 憶點點",
      ogImage: "/images/brand-story/集團/集團banner.webp",
      siteName: "有香餐飲集團 Memory Corner",
      ogLocale: "zh_TW",
    },
    brandLogos: {
      group: "/images/品牌門店logo/有香logo.png",
      youxiang: "/images/品牌門店logo/有香logo.png",
      memory: "/images/品牌門店logo/憶點點logo.png",
      corner: "/images/品牌門店logo/有香ㄟ灶腳LOGO.png",
    },
    brandList: {
      title: "旗下品牌",
      desc: "有香餐飲集團匯聚多元品牌，從經典台菜、懷舊甜品到便利即時料理，用心傳承台灣飲食文化，全方位滿足您的味蕾。",
      logos: [
        {
          src: "/images/品牌門店logo/有香LOGO.png",
          alt: "Memory Corner 有香",
          width: 140,
        },
        {
          src: "/images/品牌門店logo/憶點點LOGO.png",
          alt: "Sweet Memory 憶點點",
          width: 140,
        },
        {
          src: "/images/品牌門店logo/有香ㄟ灶腳LOGO.png",
          alt: "Kitchen Corner 有香ㄟ灶腳",
          width: 140,
        },
      ],
    },
    tabs: [
      { id: "group", label: "關於集團" },
      { id: "youxiang", label: "關於有香" },
      { id: "memory", label: "關於憶點點" },
      { id: "corner", label: "關於有香ㄟ灶腳" },
    ],
    ui: {
      more_info: "更 多 訊 息",
      salty_sweet: "鹹 食 甜 食",
      taiwan_snack: "台 灣 小 吃",
      store_no_data: "此品牌目前無相關門市資訊",
      preparing: "籌備中",
      stay_tuned: "敬請期待更多美味故事...",
      home: "首頁",
      breadcrumb: "品牌故事",
      view_menu: "查看菜單",
      online_shop: "線上購物",
    },
    content: {
      group: {
        bannerAlt: "有香餐飲集團緣起 - 台灣高雄",
        title: "有香餐飲集團的緣起",
        paragraphs: [
          "有香餐飲集團的故事始於1975年台灣高雄，吳爺爺為了提升家人的生活，毅然放棄穩定高薪的工作，創立了小餐館。他每日清晨騎腳踏車跋涉三小時，拜師學習台灣傳統羊肉料理。這份對美食的執著，讓吳家羊肉鍋成為高雄饕客們心中的珍寶。",
          "隨著歲月流轉，吳爺爺將這獨特的秘方傳給了吳爸爸，餐館逐步成為高雄當地人熟知的經典小館，名聲遠播。",
          "後來，由於吳家移民加拿大，吳家餐館停業，成為吳爺爺心中難以釋懷的遺憾。然而，這份傳承並未因此終止。成長於加拿大的吳家長孫，自小立志成為廚師，對爺爺的好手藝念念不忘。經歷多年的學習和努力，他終於決心讓這份家族的味道重現異鄉，並在大溫地區創立了「有香餐飲集團」。",
          "「有香」這個名字源自爺爺與奶奶的名字，承載著對家族傳承最深的敬意與思念。這不只是名字，更是一份情感的延續，一段家的記憶。",
          "有香餐飲集團深切地希望，這份跨越時空與國界的家族風味，能溫暖每一位顧客的心，讓台灣的飲食文化在北美大地上重新綻放光芒，傳遞家的溫度與歸屬感，成為人們心中熟悉又難忘的味道。",
        ],
      },
      youxiang: {
        origin: {
          label: "【緣起】",
          title: "在家的味道，乘載記憶的角落",
          caption: "老屋中的一磚一瓦，傳承四十年的古厝。",
          paragraphs: [
            "「有香」象徵著餐桌上那一縷柴火香、醬油香與湯頭香，是一家人團聚時最真實的味道。從開店第一天起，我們就希望端上的不是制式料理，而是一桌足以讓人想起家人的家常菜。",
            "店內主打多款鍋物、滷味與台式小菜，堅持選用當季食材與家傳的滷汁比例，不追求浮誇的擺盤，只在乎入口後那一刻，心裡浮現的是否是「啊，這就是我熟悉的味道」。",
            "無論你是一個人來吃碗麵，還是揪三五好友圍爐，有香都希望成為你在異鄉的第二個餐桌。當燈光亮起、熱騰騰的鍋氣升起，歡笑與交談聲自然而然在空氣裡流動——這就是我們一直想守護的畫面。",
          ],
        },
        glory: {
          label: "【光采】",
          caption: "牆上一面面獎牌，是老屋中一磚一瓦傳承四十年的古厝。",
          title: "以榮譽為延續，<br />為熱情守初心",
          paragraphs: [
            "這些年來，有香屢獲各式獎項與肯定：從地方票選人氣餐廳、到美食媒體專題報導，每一面獎牌的背背後，都是團隊在廚房裡一鍋一鍋反覆試驗的結果。",
            "對我們來說，獎牌不只是光環，更是一種提醒——提醒自己不能被掌聲沖昏頭，仍要保有最初那份對料理的執著與熱情。",
          ],
        },
        classic: {
          label: "【老味道】",
          title:
            "這扇門，已在有香靜靜敞開，<br />只等你推門而入，<br />與台灣的美好不期而遇。",
          paragraphs: [
            "店內集結收藏台灣各種懷舊老物，每一件陳設都藏著台灣人兒時共同的回憶。復古的用餐氛圍與環境，讓人彷彿走進時光隧道，嗅到的是老街巷弄裡熟悉的香味。",
          ],
        },
      },
      memory: {
        mainTitle: "跨越時間，連接思念與幸福",
        origin: {
          label: "【緣起】",
          paragraphs: [
            "「憶點點」的由來，「Sweet Memory」一個承載美好回憶的名字，寓意著那些深藏心底、歷久彌新的甜蜜瞬間。",
            "在為它尋找中文名的過程中，經過無數次推敲與思索，一個名字如記憶般悄然浮現——「憶點點」。為什麼不是「一點點」，而是「憶點點」？因為回憶的力量，從來不只是「一點點」，它能跨越時間，帶給我們無限大的能量。",
            "「憶點點」不僅僅是一家餐廳，更像一座時光驛站，承載著伍父親手烘焙甜點、烹製古早味鹹食的溫暖回憶。",
          ],
        },
        persist: {
          label: "【堅持】",
          caption: "老屋中的一磚一瓦，傳承四十年的古厝。",
          title: "古早味的好味道，<br />從備料開始用心",
          paragraphs: [
            "每天現做、用心備料，只為保留最純粹的古早味、甜點鹹食皆手工製作，真材實料，吃到記憶中的那一口幸福溫度。",
          ],
        },
        classic: {
          label: "【老味道】",
          caption: "老屋中的一磚一瓦，傳承四十年的古厝。",
          title:
            "我們邀您一同走進記憶深處，<br />細細品嚐那些熟悉卻已久遠的兒時味道",
          paragraphs: [
            "在「憶點點」，我們真心相待，無論您來自何處，每位踏入這裡的客人，都能透過一口甜點、一份古早味，尋回記憶中的那抹溫暖，將思念化為心頭的蜂蜜。",
          ],
        },
      },
      corner: {
        origin: {
          label: "【緣起】",
          title: "台味便利店 好吃、好玩、古早味",
          caption: "台味便利店，傳遞台灣人情味。",
          paragraphs: [
            "有香ㄟ灶腳(Old Memory Kitchen)是有香餐飲集團為了嚴格控管產品製程、追求極致品質，於2022年成立。",
            "門店販售各式各樣台灣人氣零食、懷舊童玩、熱銷冷凍台味美食，讓你不用飛到台灣，在這裡就能一站買齊所有想念的台灣味！",
            "我們也打造了台味便利店網路商城，只要動動手指，台式小吃的香氣就能從冰箱復刻、童年的好玩更能輕鬆採買。用最熟悉、最療癒的台灣味，陪你過每一天。",
          ],
        },
      },
    },
    stores: {
      youxiang: [
        {
          id: "store-youxiang-van",
          name: "Memory Corner 有香 (Richmond)",
          tel: "(604) 284-5434",
          addrLine1: "1110-4651 Garden City Rd",
          addrLine2: "Richmond BC V6X 2K4",
          postalCode: "V6X 2K4",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "1110-4651 Garden City Rd",
          hours: "11:30 AM–10:30 PM",
          img: "/images/brand-story/memory-corner-01.png",
          mapUrl: "https://www.google.com/maps/place/1110-4651+Garden+City+Rd,+Richmond,+BC+V6X+2K4",
        },
        {
          id: "store-youxiang-burnaby",
          name: "Memory Corner 有香 (Burnaby)",
          tel: "(604) 000-1234",
          addrLine1: "1234 Kingsway",
          addrLine2: "Burnaby BC V5H 2E2",
          postalCode: "V5H 2E2",
          addressLocality: "Burnaby",
          addressRegion: "BC",
          streetAddress: "1234 Kingsway",
          hours: "11:30 AM–10:00 PM",
          img: "/images/brand-story/memory-corner-02.png",
          mapUrl: "https://www.google.com/maps/place/1234+Kingsway,+Burnaby,+BC",
        },
      ],
      memory: [
        {
          id: "store-memory-1",
          name: "Sweet Memory 憶點點",
          tel: "(604) 370 - 2882",
          addrLine1: "8080 Leslie Rd",
          addrLine2: "Richmond, BC V6X 4A8",
          postalCode: "V6X 4A8",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "8080 Leslie Rd",
          hours: "11:30 AM–12:30 AM",
          img: "/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp",
          mapUrl: "https://maps.google.com/?cid=11719382924442405009&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ",
        },
      ],
      corner: [
        {
          id: "store-corner-1",
          name: "Kitchen Corner 有香ㄟ灶腳",
          tel: "(604) 000 - 0000",
          addrLine1: "Coming Soon",
          addrLine2: "Vancouver, BC",
          postalCode: "",
          addressLocality: "Vancouver",
          addressRegion: "BC",
          streetAddress: "",
          hours: "11:00 AM–08:00 PM",
          img: "/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp",
          mapUrl: "#",
        },
      ],
    },
  },
  en: {
    meta: {
      title: "Brand Story | Memory Corner Group",
      description:
        "Established in 1975, Memory Corner Group brings authentic Taiwanese cuisine to North America. Home to Memory Corner and Sweet Memory.",
      keywords:
        "Memory Corner Group, Taiwanese Cuisine, Vancouver Food, Brand Story, Sweet Memory",
      ogImage: "/images/brand-story/集團/集團banner.webp",
      siteName: "Memory Corner Group",
      ogLocale: "en_US",
    },
    brandLogos: {
      group: "/images/品牌門店logo/有香logo.png",
      youxiang: "/images/品牌門店logo/有香logo.png",
      memory: "/images/品牌門店logo/憶點點logo.png",
      corner: "/images/品牌門店logo/有香ㄟ灶腳LOGO.png",
    },
    brandList: {
      title: "OUR BRANDS",
      desc: "Memory Corner Group brings together diverse brands, from classic Taiwanese cuisine and nostalgic desserts to convenient instant meals, satisfying your taste buds in every way.",
      logos: [
        {
          src: "/images/品牌門店logo/有香LOGO.png",
          alt: "Memory Corner 有香",
          width: 140,
        },
        {
          src: "/images/品牌門店logo/憶點點LOGO.png",
          alt: "Sweet Memory 憶點點",
          width: 140,
        },
        {
          src: "/images/品牌門店logo/有香ㄟ灶腳LOGO.png",
          alt: "Kitchen Corner 有香ㄟ灶腳",
          width: 140,
        },
      ],
    },
    tabs: [
      { id: "group", label: "Group" },
      { id: "youxiang", label: "Memory Corner" },
      { id: "memory", label: "Sweet Memory" },
      { id: "corner", label: "Kitchen Corner" },
    ],
    ui: {
      more_info: "MORE INFO",
      salty_sweet: "SAVORY & SWEET",
      taiwan_snack: "TAIWAN SNACKS",
      store_no_data: "No store information available yet.",
      preparing: "Coming Soon",
      stay_tuned: "Stay tuned for more delicious stories...",
      home: "Home",
      breadcrumb: "Brand Story",
      view_menu: "View Menu",
      online_shop: "Online-shop",
    },
    content: {
      group: {
        bannerAlt: "Group Origin",
        title: "The Origin of Memory Corner Group",
        paragraphs: [
          "The story of Memory Corner Group began in 1975 in Kaohsiung, Taiwan...",
          "As time passed, Grandpa Wu passed his unique recipe to Papa Wu...",
          "Later, the family immigrated to Canada, and the restaurant closed...",
          "The name 'Memory Corner' (You Xiang) comes from the names of Grandpa and Grandma...",
          "Memory Corner Group hopes this family flavor will warm every customer's heart...",
        ],
      },
      youxiang: {
        origin: {
          label: "【ORIGIN】",
          title: "The Taste of Home, A Corner of Memories",
          caption:
            "Every brick and tile in the old house inherits forty years of history.",
          paragraphs: [
            "'Memory Corner' symbolizes the scent of firewood, soy sauce...",
            "We specialize in hot pots, braised dishes, and Taiwanese sides...",
            "Whether you come alone for noodles or gather with friends for hot pot...",
          ],
        },
        glory: {
          label: "【GLORY】",
          caption:
            "Every award on the wall represents the heritage of the old house.",
          title: "Honoring Heritage,<br />Keeping the Passion",
          paragraphs: [
            "Over the years, Memory Corner has won various awards...",
            "To us, awards are not just halos, but reminders...",
          ],
        },
        classic: {
          label: "【CLASSIC】",
          title:
            "This door is open quietly at Memory Corner,<br />Waiting for you to enter,<br />And meet the beauty of Taiwan.",
          paragraphs: ["The store collects various nostalgic Taiwanese items..."],
        },
      },
      memory: {
        mainTitle: "Crossing Time, Connecting Thoughts and Happiness",
        origin: {
          label: "【ORIGIN】",
          paragraphs: [
            "The origin of 'Sweet Memory' implies those sweet moments...",
            "In search of its Chinese name, 'Yi Dian Dian' emerged...",
            "Sweet Memory is not just a restaurant, but a time station...",
          ],
        },
        persist: {
          label: "【PERSISTENCE】",
          caption:
            "Every brick and tile in the old house inherits forty years of history.",
          title: "Good Old Taste,<br />Starts from Preparation",
          paragraphs: [
            "Made fresh daily with heart, preserving the purest old-time flavor...",
          ],
        },
        classic: {
          label: "【CLASSIC】",
          caption:
            "Every brick and tile in the old house inherits forty years of history.",
          title:
            "We invite you to walk into deep memory,<br />Tasting those familiar but distant childhood flavors",
          paragraphs: ["At Sweet Memory, we treat you with sincerity..."],
        },
      },
      corner: {
        origin: {
          label: "【ORIGIN】",
          title:
            "Taiwanese Convenience Store Delicious, Fun, Old-Fashioned Flavours",
          caption:
            "Taiwanese Convenience Store, conveying the warmth of Taiwanese hospitality.",
          paragraphs: [
            "Old Memory Kitchen was established in 2022 by the Youxiang Catering Group to rigorously control product processes and pursue the highest standards of quality.",
            "Our shop stocks an array of popular Taiwanese snacks, nostalgic childhood toys, and best-selling frozen Taiwanese delicacies. No need to fly to Taiwan – find all the flavours you crave right here in one convenient location!",
            "We've also created an online Taiwanese-style convenience store. With just a few taps, the aromas of Taiwanese snacks can be recreated straight from your fridge, while the fun of childhood can be effortlessly rediscovered. Let the most familiar, most comforting flavours of Taiwan accompany you through every day.",
          ],
        },
      },
    },
    stores: {
      group: [
        {
          id: "store-group-1",
          name: "Group Flagship",
          tel: "(000) 123-4567",
          addrLine1: "123 Example St",
          addrLine2: "Vancouver BC 000 000",
          postalCode: "V0V 0V0",
          addressLocality: "Vancouver",
          addressRegion: "BC",
          streetAddress: "123 Example St",
          hours: "11:00 AM–10:00 PM",
          img: "/images/brand-story/memory-corner-01.png",
          mapUrl: "https://www.google.com/maps",
        },
      ],
      youxiang: [
        {
          id: "store-youxiang-van",
          name: "Memory Corner (Richmond)",
          tel: "(604) 284-5434",
          addrLine1: "1110-4651 Garden City Rd",
          addrLine2: "Richmond BC V6X 2K4",
          postalCode: "V6X 2K4",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "1110-4651 Garden City Rd",
          hours: "11:30 AM–10:30 PM",
          img: "/images/brand-story/memory-corner-01.png",
          mapUrl: "https://www.google.com/maps/place/1110-4651+Garden+City+Rd,+Richmond,+BC+V6X+2K4",
        },
        {
          id: "store-youxiang-burnaby",
          name: "Memory Corner (Burnaby)",
          tel: "(604) 000-1234",
          addrLine1: "1234 Kingsway",
          addrLine2: "Burnaby BC V5H 2E2",
          postalCode: "V5H 2E2",
          addressLocality: "Burnaby",
          addressRegion: "BC",
          streetAddress: "1234 Kingsway",
          hours: "11:30 AM–10:00 PM",
          img: "/images/brand-story/memory-corner-02.png",
          mapUrl: "https://www.google.com/maps/place/1234+Kingsway,+Burnaby,+BC",
        },
      ],
      memory: [
        {
          id: "store-memory-1",
          name: "Sweet Memory",
          tel: "(604) 370 - 2882",
          addrLine1: "8080 Leslie Rd",
          addrLine2: "Richmond, BC V6X 4A8",
          postalCode: "V6X 4A8",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "8080 Leslie Rd",
          hours: "11:30 AM–12:30 AM",
          img: "/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp",
          mapUrl: "https://maps.google.com/?cid=11719382924442405009&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ",
        },
      ],
      corner: [
        {
          id: "store-corner-1",
          name: "Kitchen Corner",
          tel: "(604) 000 - 0000",
          addrLine1: "Coming Soon",
          addrLine2: "Vancouver, BC",
          postalCode: "",
          addressLocality: "Vancouver",
          addressRegion: "BC",
          streetAddress: "",
          hours: "11:00 AM–08:00 PM",
          img: "/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp",
          mapUrl: "#",
        },
      ],
    },
  },
};

/* ========== 2. SSG: 在 Build Time 抓取對應語言資料 ========== */
export async function getStaticProps({ locale }) {
  const t = TRANSLATIONS[locale] || TRANSLATIONS["zh-TW"];
  return {
    props: {
      t,
      locale,
    },
  };
}

/* ========== 3. 動畫元件 ========== */
const easeOut = [0.22, 1, 0.36, 1];
function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/* ========== 4. 內容組件 (Content Components) ========== */

// 【修改點 1】集團內容：將「旗下品牌」區塊移至此處底部
const ContentGroup = ({ t }) => (
  <div className="space-y-8">
    <div className="  pt-6">
      {/* 跑馬燈容器 */}
      <div className="mb-6 border border-[#c9b79a] bg-white overflow-hidden relative">
        <div className="w-full relative flex whitespace-nowrap overflow-hidden">
          <motion.div
            className="flex min-w-full"
            animate={{ x: "-100%" }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
          >
            <div className="min-w-full relative h-[300px] md:h-[520px]">
              <Image
                src="/images/brand-story/集團/集團banner.webp"
                alt={t.content.group.bannerAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-full relative h-[300px] md:h-[520px]">
              <Image
                src="/images/brand-story/集團/集團banner.webp"
                alt={t.content.group.bannerAlt}
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="space-y-4 text-[16px] flex flex-col justify-center items-center max-w-[700px] mx-auto leading-8 tracking-[0.05em] text-[#3b2a1a]">
        <h1 className="mb-6 text-3xl font-bold leading-relaxed md:text-4xl text-center">
          {t.content.group.title}
        </h1>
        {t.content.group.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </div>

    {/* 【移入】旗下品牌列表 (僅顯示於集團 Tab) */}
    {t.brandList && (
      <FadeUp delay={0.2}>
        <section className="mt-16 pt-16  ">
          <div className="max-w-4xl mx-auto text-center px-4">
            {/* 標題 */}
            <h3 className="text-3xl  font-bold mb-6 tracking-[0.2em] text-[#3b2a1a]">
              {t.brandList.title}
            </h3>

            {/* 文字描述 */}
            <p className="mb-12 text-[#5c4e42] text-[16px] leading-8 tracking-widest max-w-2xl mx-auto">
              {t.brandList.desc}
            </p>

            {/* 品牌 Logo 列表 */}
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
              {t.brandList.logos.map((logo, index) => (
                <div
                  key={index}
                  // 修改處：移除了 'grayscale' 和 'hover:grayscale-0'
                  className="relative w-[190px] h-[110px] transition-all duration-500  hover:scale-110"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUp>
    )}
  </div>
);

const ContentYouxiang = ({ t }) => (
  <div className="space-y-10">
    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.youxiang.origin.label}
      </h2>
      <h1 className="mb-6 text-2xl font-bold leading-relaxed md:text-5xl">
        {t.content.youxiang.origin.title}
      </h1>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/有香上方(1280 x 650 像素).webp"
          alt="Memory Corner Origin"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <p className="mb-4 text-[14px] tracking-[0.2em] text-[#7b5b33]">
        {t.content.youxiang.origin.caption}
      </p>
      <div className="space-y-3 text-[16px] leading-relaxed tracking-[0.05em] text-[#3b2a1a]">
        {t.content.youxiang.origin.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>

    <div className="border-t pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.youxiang.glory.label}
      </h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/2">
          <div className="border border-[#c9b79a] bg-white">
            <Image
              src="/images/brand-story/memory-corner-02.png"
              alt="Memory Corner Glory"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-3 text-[14px] tracking-[0.2em] text-[#7b5b33]">
            {t.content.youxiang.glory.caption}
          </p>
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h3
            className="text-3xl leading-snug md:text-4xl"
            dangerouslySetInnerHTML={{ __html: t.content.youxiang.glory.title }}
          />
          <div className="mt-4 space-y-3 text-[16px] leading-relaxed tracking-[0.05em]">
            {t.content.youxiang.glory.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.youxiang.classic.label}
      </h2>
      <div className="border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/有香下方（1400 x 700）.webp"
          alt="Memory Corner Classic"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="mt-6 space-y-3 text-[16px] leading-relaxed tracking-[0.05em]">
        <p
          className="text-2xl font-bold leading-relaxed md:text-3xl"
          dangerouslySetInnerHTML={{ __html: t.content.youxiang.classic.title }}
        />
        {t.content.youxiang.classic.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
    {/* 新增: 查看菜單按鈕 */}
    <div className="pt-8 flex justify-center border-t border-[#c9b79a]">
      <Link href="/menu01">
        <span className="inline-block bg-stone-800 text-stone-50 px-5 py-2 rounded-[3px] hover:scale-105 scale-100 tracking-widest duration-300">
          {t.ui.view_menu}
        </span>
      </Link>
    </div>
  </div>
);

const ContentMemory = ({ t }) => (
  <div className="space-y-8">
    <div className="border-t border-[#c9b79a] pt-6">
      <h1 className="mb-6 text-3xl font-bold leading-relaxed md:text-5xl">
        {t.content.memory.mainTitle}
      </h1>

      <div className="border-b border-[#7b5b33] mb-4 mt-8">
        <h2 className="mb-4 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          {t.content.memory.origin.label}
        </h2>
      </div>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp"
          alt="Sweet Memory Origin"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="space-y-4 max-w-[700px] text-[15px] md:text-[16px] leading-8 tracking-[0.05em] text-[#3b2a1a]">
        {t.content.memory.origin.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="border-b border-[#7b5b33] mb-4">
        <h2 className="mb-4 mt-8 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          {t.content.memory.persist.label}
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <div className="border border-[#c9b79a] bg-white">
            <Image
              src="/images/brand-story/憶點點/憶點點中(500 x 600 像素)拷貝.webp"
              alt="Sweet Memory Persistence"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-2 text-[14px] tracking-[0.2em] text-[#7b5b33]">
            {t.content.memory.persist.caption}
          </p>
        </div>
        <div className="md:w-1/2 md:p-5">
          <div className="space-y-4 text-[15px] md:text-[16px] leading-8 tracking-[0.05em] text-[#3b2a1a]">
            <h3
              className="text-2xl md:text-3xl font-bold"
              dangerouslySetInnerHTML={{
                __html: t.content.memory.persist.title,
              }}
            />
            {t.content.memory.persist.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-[#7b5b33] mb-4">
        <h2 className="mb-4 mt-8 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          {t.content.memory.classic.label}
        </h2>
      </div>
      <div>
        <div className="border border-[#c9b79a] bg-white">
          <Image
            src="/images/brand-story/憶點點/憶點點下方（1400 x 700）.webp"
            alt="Sweet Memory Classic"
            width={880}
            height={520}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="mt-2 text-[14px] tracking-[0.2em] text-[#7b5b33]">
          {t.content.memory.classic.caption}
        </p>
        <div className="mt-8 space-y-4 text-[15px] md:text-[16px] leading-8 tracking-[0.05em] text-[#3b2a1a]">
          <h3
            className="text-2xl md:text-3xl font-bold"
            dangerouslySetInnerHTML={{ __html: t.content.memory.classic.title }}
          />
          {t.content.memory.classic.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
    {/* 新增: 查看菜單按鈕 */}
    <div className="pt-8 flex justify-center border-t border-[#c9b79a]">
      <Link href="/menu02">
        <span className="inline-block bg-stone-800 text-stone-50 px-5 py-2 rounded-[3px] hover:scale-105 scale-100 tracking-widest duration-300">
          {t.ui.view_menu}
        </span>
      </Link>
    </div>
  </div>
);

const ContentCorner = ({ t }) => (
  <div className="space-y-10">
    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.corner.origin.label}
      </h2>
      <h1 className="mb-6 text-2xl font-bold leading-relaxed md:text-5xl">
        {t.content.corner.origin.title}
      </h1>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp"
          alt="Kitchen Corner"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <p className="mb-4 text-[14px] tracking-[0.2em] text-[#7b5b33]">
        {t.content.corner.origin.caption}
      </p>
      <div className="space-y-3 text-[16px] leading-relaxed tracking-[0.05em] text-[#3b2a1a]">
        {t.content.corner.origin.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
    {/* 新增: 線上購物按鈕 */}
    <div className="pt-8 flex justify-center border-t border-[#c9b79a]">
      <Link href="/groupBuy">
        <span className="inline-block bg-stone-800 text-stone-50 px-5 py-2 rounded-[3px] hover:scale-105 scale-100 tracking-widest duration-300">
          {t.ui.online_shop}
        </span>
      </Link>
    </div>
  </div>
);

function StoreCard({ store }) {
  return (
    <div
      className="border border-[#c9b79a] bg-[#f7ecdd]"
      itemScope
      itemType="https://schema.org/Restaurant"
    >
      <a
        href={store.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-b border-[#c9b79a]"
        itemProp="url"
      >
        <Image
          src={store.img}
          alt={store.name}
          width={400}
          height={260}
          className="h-[180px] w-full object-cover"
          itemProp="image"
        />
      </a>
      <div className="px-4 pb-4 pt-3 relative">
        <a
          href={store.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#4b2c1d] px-4 py-1 text-center text-sm font-semibold text-white hover:bg-[#613625] transition-colors"
          itemProp="name"
        >
          {store.name}
        </a>
        <div
          className="mt-3 space-y-1 text-xs leading-relaxed"
          itemProp="address"
          itemScope
          itemType="https://schema.org/PostalAddress"
        >
          <p itemProp="telephone">{store.tel}</p>
          <p>
            <span itemProp="streetAddress">{store.streetAddress}</span>
            <br />
            <span itemProp="addressLocality">
              {store.addressLocality}
            </span>, <span itemProp="addressRegion">{store.addressRegion}</span>{" "}
            <span itemProp="postalCode">{store.postalCode}</span>
          </p>
          <p itemProp="openingHours" content={store.hours}>
            {store.hours}
          </p>
        </div>

        {/* 修改處：移除背景圓圈，改為純深色 Icon，稍微加大尺寸與調整位置 */}
        <a
          href={store.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 text-[#4b2c1d] hover:text-[#2b211a] hover:scale-110 transition-all duration-300 z-10"
          title="Open in Google Maps"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ========== 5. 主頁面元件 ========== */
export default function BrandStoryPage({ t, locale }) {
  const router = useRouter();

  const currentPath = router.asPath.split("?")[0];
  const canonicalUrl = `${SITE_DOMAIN}${
    currentPath === "/" ? "" : currentPath
  }`;

  const zhUrl = `${SITE_DOMAIN}/brand-story`;
  const enUrl = `${SITE_DOMAIN}/en/brand-story`;

  const tabFromUrl = router.query.tab;
  const activeTab = useMemo(() => {
    const defaultTab = "youxiang";
    if (!tabFromUrl) return defaultTab;
    const exists = t.tabs.some((tab) => tab.id === tabFromUrl);
    return exists ? tabFromUrl : defaultTab;
  }, [tabFromUrl, t.tabs]);

  const handleTabClick = (id) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, tab: id } },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "group":
        return <ContentGroup t={t} />;
      case "youxiang":
        return <ContentYouxiang t={t} />;
      case "memory":
        return <ContentMemory t={t} />;
      case "corner":
        return <ContentCorner t={t} />;
      default:
        return <ContentYouxiang t={t} />;
    }
  };

  const brandLogos = t.brandLogos || {};
  const currentBrandLogo =
    brandLogos[activeTab] || "/images/品牌門店logo/有香ㄟ灶腳LOGO.png";

  const getHeaderBg = () => {
    switch (activeTab) {
      case "group":
        return "/images/brand-story/集團/DAV02074.jpg";
      case "youxiang":
        return "/images/index/about/DAV01968.jpg";
      case "memory":
        return "/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp";
      case "corner":
        return "/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp";
      default:
        return "/images/index/about/DAV01968.jpg";
    }
  };

  const getFooterBg = () => "/images/brand-story/DAV01915.png";

  const allStores = [
    ...t.stores.youxiang,
    ...t.stores.memory,
    ...t.stores.corner,
  ].filter((s) => s.name);

  // Schema Definitions
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.ui.home,
        item: `${SITE_DOMAIN}/${locale === "en" ? "en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.ui.breadcrumb,
        item: canonicalUrl,
      },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Memory Corner / 有香餐飲集團",
    url: SITE_DOMAIN,
    logo: `${SITE_DOMAIN}/logo.png`,
    foundingDate: "1975",
    description: t.meta.description,
    sameAs: [
      "https://www.facebook.com/MemoryCorner8",
      "https://www.instagram.com/memorycorner8",
    ],
    subOrganization: allStores.map((store) => ({
      "@type": "Restaurant",
      name: store.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: store.streetAddress,
        addressLocality: store.addressLocality,
        addressRegion: store.addressRegion,
        postalCode: store.postalCode,
        addressCountry: "CA",
      },
    })),
  };

  const storesSchemas = allStores.map((store) => ({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: store.name,
    image: `${SITE_DOMAIN}${store.img}`,
    telephone: store.tel,
    url: store.mapUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.streetAddress,
      addressLocality: store.addressLocality,
      addressRegion: store.addressRegion,
      postalCode: store.postalCode,
      addressCountry: "CA",
    },
    priceRange: "$$",
    servesCuisine: "Taiwanese",
    openingHours: store.hours,
  }));

  const jsonLdList = [breadcrumbSchema, organizationSchema, ...storesSchemas];
  const isGroup = activeTab === "group";
  return (
    <Layout>
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="keywords" content={t.meta.keywords} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hreflang="x-default" href={zhUrl} />
        <link rel="alternate" hreflang="zh-TW" href={zhUrl} />
        <link rel="alternate" hreflang="en" href={enUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:image" content={`${SITE_DOMAIN}${t.meta.ogImage}`} />
        <meta property="og:site_name" content={t.meta.siteName} />
        <meta property="og:locale" content={t.meta.ogLocale} />
        <meta property="og:url" content={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }}
        />
      </Head>

      <main className="min-h-screen text-[#3b2a1a] bg-[#f0e3cd] relative ">
        <div
          className="absolute top-0 opacity-15 left-0 w-full z-[1] h-[550px] bg-center bg-cover bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url('${getHeaderBg()}')` }}
        />

        {/* --- 這裡修改容器寬度邏輯 --- */}
        <div 
          className={`
            mx-auto z-50 relative px-4 pb-20 pt-[200px]
            ${isGroup ? "w-full max-w-none" : "max-w-[1380px]"}
          `}
        >
          <FadeUp>
            <div
              className="mb-8 flex flex-wrap justify-center gap-3"
              role="tablist"
              aria-label="Brand Stories Tabs"
            >
              {t.tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
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

          <FadeUp delay={0.05}>
            <section className="mt-10 sm:mb-[10px] mb-10 xl:mb-[10px] relative">
              <div className="absolute z-50 left-1/2 -translate-x-1/2 w-screen pointer-events-none bg-gradient-to-t from-[#f0e3cd] to-transparent h-72 bottom-[50px] sm:bottom-[-0px] md:h-52 md:bottom-[-100px]" />
              <div className="mx-auto w-full max-w-[1380px] relative z-[99999] py-6">
                <div className="space-y-[3px]">
                  <div className="h-[2px] bg-[#2b211a]" />
                  <div className="h-[2px] bg-[#2b211a]" />
                </div>
                <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:justify-between">
                  <div className="text-[15px] tracking-[0.6em] text-[#2b211a]">
                    {t.ui.salty_sweet}
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="hidden h-16 w-px bg-[#2b211a] md:block" />
                    <div className="flex flex-col items-center justify-center min-w-[200px] min-h-[80px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={currentBrandLogo}
                            alt={`${activeTab} logo`}
                            width={200}
                            height={80}
                            className="object-contain h-auto w-auto max-h-[80px]"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="hidden h-16 w-px bg-[#2b211a] md:block" />
                  </div>

                  <div className="text-[15px] tracking-[0.6em] text-[#2b211a]">
                    {t.ui.taiwan_snack}
                  </div>
                </div>
                <div className="mt-6 space-y-[3px]">
                  <div className="h-[2px] bg-[#2b211a]" />
                  <div className="h-[2px] bg-[#2b211a]" />
                </div>
              </div>
            </section>
          </FadeUp>

          <section
            className={`relative gap-10  mt-20 bg-[#f0e3cd] ${
              isGroup
                ? "grid md:grid-cols-1 justify-items-center"
                : "grid md:grid-cols-[280px,minmax(0,1fr)]"
            }`}
          >
            {/* group tab：不渲染左側門市區塊 */}
            {!isGroup && (
              <aside className="sticky md:top-28 self-start">
                <FadeUp delay={0.08}>
                  <div className="space-y-8">
                    {(t.stores[activeTab] || []).length > 0 ? (
                      t.stores[activeTab].map((store) => (
                        <StoreCard key={store.id} store={store} />
                      ))
                    ) : (
                      <div className="p-4 border border-[#c9b79a] text-center text-xs text-[#7b5b33] tracking-widest">
                        {t.ui.store_no_data}
                      </div>
                    )}
                  </div>
                </FadeUp>
              </aside>
            )}

            {/* 右側內容 */}
            <div className={`space-y-10 z-10 ${isGroup ? "w-full" : ""}`}>
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeTab}
                  role="tabpanel"
                  id={`panel-${activeTab}`}
                  aria-labelledby={`tab-${activeTab}`}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: easeOut }}
                  className={isGroup ? "w-full  mx-auto" : ""}
                >
                  {renderContent()}
                </motion.article>
              </AnimatePresence>
            </div>
          </section>
        </div>

        <div className="h-[130px] lg:h-[330px]">
          <div
            className="absolute bottom-[0px] opacity-25 left-0 w-full z-[0] h-[150px] lg:h-[350px] bg-center bg-cover bg-no-repeat transition-all duration-700 pointer-events-none"
            style={{ backgroundImage: `url('${getFooterBg()}')` }}
          >
            <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-[#f0e3cd] to-transparent"></div>
          </div>
        </div>
      </main>
    </Layout>
  );
}