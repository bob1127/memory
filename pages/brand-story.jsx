import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./Layout"; // 請確認您的 Layout 路徑

/* ========== 1. 資料庫與翻譯內容 (i18n Data) ========== */
// 為了版面整潔，建議實際專案將此物件移至 locales/zh-TW.json 與 locales/en.json
const TRANSLATIONS = {
  "zh-TW": {
    meta: {
      title: "品牌故事 | 有香 Memory Corner",
      description:
        "有香餐飲集團始於1975年，傳承台灣經典美味。旗下包含有香 Memory Corner、Sweet Memory 憶點點等品牌，在北美傳遞家的溫度。",
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
    },
    content: {
      group: {
        bannerAlt: "集團緣起",
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
            "這些年來，有香屢獲各式獎項與肯定：從地方票選人氣餐廳、到美食媒體專題報導，每一面獎牌的背後，都是團隊在廚房裡一鍋一鍋反覆試驗的結果。",
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
    },
    // 門市資料 (建議也做多語系)
    stores: {
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
          img: "/images/brand-story/憶點點/DSC07015.jpg",
          mapUrl:
            "https://maps.google.com/?cid=11719382924442405009&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ",
        },
      ],
      corner: [],
    },
  },
  en: {
    meta: {
      title: "Brand Story | Memory Corner",
      description:
        "Established in 1975, Memory Corner Group brings authentic Taiwanese cuisine to North America. Home to Memory Corner and Sweet Memory.",
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
    },
    content: {
      group: {
        bannerAlt: "Group Origin",
        title: "The Origin of Memory Corner Group",
        paragraphs: [
          "The story of Memory Corner Group began in 1975 in Kaohsiung, Taiwan. Grandpa Wu, determined to improve his family's life, left his stable job to open a small restaurant. He cycled three hours every morning to learn traditional Taiwanese mutton cooking. His dedication made Wu's Mutton Hot Pot a treasure among Kaohsiung gourmets.",
          "As time passed, Grandpa Wu passed his unique recipe to Papa Wu, and the restaurant became a renowned classic in Kaohsiung.",
          "Later, the family immigrated to Canada, and the restaurant closed, becoming a regret for Grandpa Wu. However, the legacy didn't end there. Growing up in Canada, the eldest grandson aspired to be a chef, never forgetting his grandfather's craft. After years of hard work, he decided to revive the family flavor in North America, founding the 'Memory Corner Group'.",
          "The name 'Memory Corner' (You Xiang) comes from the names of Grandpa and Grandma, carrying deep respect and longing for family heritage. It is not just a name, but an extension of emotion and family memory.",
          "Memory Corner Group hopes this family flavor will warm every customer's heart, letting Taiwanese food culture bloom in North America, delivering the warmth of home and belonging.",
        ],
      },
      youxiang: {
        origin: {
          label: "【ORIGIN】",
          title: "The Taste of Home, A Corner of Memories",
          caption:
            "Every brick and tile in the old house inherits forty years of history.",
          paragraphs: [
            "'Memory Corner' symbolizes the scent of firewood, soy sauce, and broth on the dining table—the truest taste of family reunion. From day one, we wanted to serve not standard commercial dishes, but home-cooked meals that remind you of family.",
            "We specialize in hot pots, braised dishes, and Taiwanese sides, insisting on seasonal ingredients and family recipes. We don't pursue flashy plating; we only care that the first bite reminds you: 'Ah, this is the taste I know.'",
            "Whether you come alone for noodles or gather with friends for hot pot, Memory Corner hopes to be your second dining table away from home.",
          ],
        },
        glory: {
          label: "【GLORY】",
          caption:
            "Every award on the wall represents the heritage of the old house.",
          title: "Honoring Heritage,<br />Keeping the Passion",
          paragraphs: [
            "Over the years, Memory Corner has won various awards and recognition. Behind every medal is the team's repeated testing in the kitchen.",
            "To us, awards are not just halos, but reminders—reminders not to get lost in applause, but to keep our original persistence and passion for cooking.",
          ],
        },
        classic: {
          label: "【CLASSIC】",
          title:
            "This door is open quietly at Memory Corner,<br />Waiting for you to enter,<br />And meet the beauty of Taiwan.",
          paragraphs: [
            "The store collects various nostalgic Taiwanese items. Every display hides a common childhood memory of Taiwanese people. The retro atmosphere takes you into a time tunnel, smelling the familiar scents of old streets.",
          ],
        },
      },
      memory: {
        mainTitle: "Crossing Time, Connecting Thoughts and Happiness",
        origin: {
          label: "【ORIGIN】",
          paragraphs: [
            "The origin of 'Sweet Memory' implies those sweet moments hidden deep in the heart that last forever.",
            "In search of its Chinese name, 'Yi Dian Dian' (Reminiscing a little) emerged. Why not 'A Little Bit'? Because the power of memory is never just a little bit; it can cross time and bring infinite energy.",
            "Sweet Memory is not just a restaurant, but a time station, carrying the warm memories of Father Wu's hand-baked desserts and ancient savory dishes.",
          ],
        },
        persist: {
          label: "【PERSISTENCE】",
          caption:
            "Every brick and tile in the old house inherits forty years of history.",
          title: "Good Old Taste,<br />Starts from Preparation",
          paragraphs: [
            "Made fresh daily with heart, preserving the purest old-time flavor. Hand-made desserts and savory foods, real ingredients, tasting that bite of happiness memory.",
          ],
        },
        classic: {
          label: "【CLASSIC】",
          caption:
            "Every brick and tile in the old house inherits forty years of history.",
          title:
            "We invite you to walk into deep memory,<br />Tasting those familiar but distant childhood flavors",
          paragraphs: [
            "At Sweet Memory, we treat you with sincerity. Wherever you come from, every guest can find that warmth in memory through a bite of dessert or ancient flavor.",
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
          name: "Sweet Memory",
          tel: "(604) 370 - 2882",
          addrLine1: "8080 Leslie Rd",
          addrLine2: "Richmond, BC V6X 4A8",
          hours: "11:30 AM–12:30 AM",
          img: "/images/brand-story/憶點點/DSC07015.jpg",
          mapUrl:
            "https://maps.google.com/?cid=11719382924442405009&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ",
        },
      ],
      corner: [],
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
      viewport={{ once: true, amount: 0.1 }} // 讓滑動時觸發
      transition={{ duration: 0.8, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/* ========== 4. 內容組件 (Content Components) ========== */
const ContentGroup = ({ t }) => (
  <div className="space-y-8">
    <div className="border-t border-[#c9b79a] pt-6">
      <div className="mb-6 border border-[#c9b79a] flex flex-row bg-white">
        <Image
          src="/images/brand-story/集團/集團banner.png"
          alt={t.content.group.bannerAlt}
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="space-y-4 text-[16px] flex flex-col justify-center items-center max-w-[700px] mx-auto leading-8 tracking-[0.05em] text-[#3b2a1a]">
        <h1 className="mb-6 text-4xl font-bold leading-relaxed md:text-5xl text-center">
          {t.content.group.title}
        </h1>
        {t.content.group.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </div>
  </div>
);

const ContentYouxiang = ({ t }) => (
  <div className="space-y-10">
    {/* 緣起 */}
    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.youxiang.origin.label}
      </h2>
      <h1 className="mb-6 text-2xl font-bold leading-relaxed md:text-5xl">
        {t.content.youxiang.origin.title}
      </h1>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/DSC06790.jpg"
          alt="Origin"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <p className="mb-4 text-[11px] tracking-[0.2em] text-[#7b5b33]">
        {t.content.youxiang.origin.caption}
      </p>
      <div className="space-y-3 text-[16px] leading-relaxed tracking-[0.05em] text-[#3b2a1a]">
        {t.content.youxiang.origin.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>

    {/* 光采 */}
    <div className="border-t pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.youxiang.glory.label}
      </h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/2">
          <div className="border border-[#c9b79a] bg-white">
            <Image
              src="/images/brand-story/memory-corner-02.png"
              alt="Glory"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-3 text-[11px] tracking-[0.2em] text-[#7b5b33]">
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

    {/* 老味道 */}
    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.youxiang.classic.label}
      </h2>
      <div className="border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/DAV01968.jpg"
          alt="Classic"
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
  </div>
);

const ContentMemory = ({ t }) => (
  <div className="space-y-8">
    <div className="border-t border-[#c9b79a] pt-6">
      <h1 className="mb-6 text-3xl font-bold leading-relaxed md:text-5xl">
        {t.content.memory.mainTitle}
      </h1>

      {/* 緣起 */}
      <div className="border-b border-[#7b5b33] mb-4 mt-8">
        <h2 className="mb-4 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          {t.content.memory.origin.label}
        </h2>
      </div>
      <div className="mb-2 border border-[#c9b79a] bg-white">
        <Image
          src="/images/brand-story/憶點點/DSC07015.jpg"
          alt="Origin"
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

      {/* 堅持 */}
      <div className="border-b border-[#7b5b33] mb-4">
        <h2 className="mb-4 mt-8 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          {t.content.memory.persist.label}
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <div className="border border-[#c9b79a] bg-white">
            <Image
              src="/images/brand-story/憶點點/DSC07378.jpg"
              alt="Persist"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-2 text-[11px] tracking-[0.2em] text-[#7b5b33]">
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

      {/* 老味道 */}
      <div className="border-b border-[#7b5b33] mb-4">
        <h2 className="mb-4 mt-8 text-xl md:text-2xl font-semibold tracking-[0.4em] text-[#7b5b33]">
          {t.content.memory.classic.label}
        </h2>
      </div>
      <div>
        <div className="border border-[#c9b79a] bg-white">
          <Image
            src="/images/brand-story/憶點點/DSC06868.jpg"
            alt="Classic"
            width={880}
            height={520}
            className="h-auto w-full object-cover"
          />
        </div>
        <p className="mt-2 text-[11px] tracking-[0.2em] text-[#7b5b33]">
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
  </div>
);

const ContentCorner = ({ t }) => (
  <div className="space-y-8 min-h-[300px] flex items-center justify-center border-t border-[#c9b79a] pt-6">
    <div className="text-center">
      <h2 className="mb-4 text-xl font-bold tracking-[0.2em] text-[#7b5b33]">
        {t.ui.preparing}
      </h2>
      <p className="text-sm tracking-widest text-gray-500">{t.ui.stay_tuned}</p>
    </div>
  </div>
);

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

/* ========== 5. 主頁面元件 ========== */
export default function BrandStoryPage({ t, locale }) {
  const router = useRouter();

  // Pages Router: 使用 router.query 取得參數
  const tabFromUrl = router.query.tab;

  // 驗證 Tab 是否有效
  const activeTab = useMemo(() => {
    const defaultTab = "youxiang";
    if (!tabFromUrl) return defaultTab;
    const exists = t.tabs.some((tab) => tab.id === tabFromUrl);
    return exists ? tabFromUrl : defaultTab;
  }, [tabFromUrl, t.tabs]);

  const handleTabClick = (id) => {
    // 使用 shallow routing 切換 tab，不重新執行 getStaticProps
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

  const getFooterBg = () => "/images/brand-story/DAV01915.png";

  /* ========== SEO & Structured Data 結構化資料 ========== */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "en" ? "Home" : "首頁",
        item: `https://www.memorycorner8.com${locale === "en" ? "/en" : ""}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.meta.title,
        item: `https://www.memorycorner8.com${router.asPath}`,
      },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Memory Corner 有香餐飲集團",
    url: "https://www.memorycorner8.com",
    logo: "https://www.memorycorner8.com/logo.png", // 請替換成實際 Logo URL
    description: t.meta.description,
    foundingDate: "1975",
    sameAs: [
      "https://www.facebook.com/MemoryCorner8",
      "https://www.instagram.com/memorycorner8",
    ],
  };

  return (
    <Layout>
      {/* 1. SEO Meta Tags */}
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://www.memorycorner8.com${router.asPath}`}
        />
      </Head>

      {/* 2. Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main className="min-h-screen text-[#3b2a1a] bg-[#f0e3cd] relative ">
        {/* Header 背景圖 */}
        <div
          className="absolute top-0 opacity-15 left-0 w-full z-[1] h-[550px] bg-center bg-cover bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url('${getHeaderBg()}')` }}
        />

        <div className="mx-auto max-w-[1380px] z-50 relative px-4 pb-20 pt-[200px]">
          {/* Tabs 按鈕 */}
          <FadeUp>
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              {t.tabs.map((tab) => {
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

          {/* 品牌 Logo 區 (純視覺，不變) */}
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
                    {t.ui.salty_sweet}
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

          {/* 主要內容區 */}
          <section className="relative grid gap-10 md:grid-cols-[280px,minmax(0,1fr)] bg-[#f0e3cd]">
            {/* 左欄 Sticky 門市列表 */}
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
                    <span>{t.ui.more_info}</span>
                    <span className="inline-block h-[1px] w-24 bg-[#7b5b33]" />
                    <span className="inline-block h-2 w-2 rounded-full border border-[#7b5b33]" />
                  </button>
                </section>
              </FadeUp>
            </div>
          </section>
        </div>

        {/* Footer 背景圖 */}
        <div className=" h-[130px] lg:h-[330px]">
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
