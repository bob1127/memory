import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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
    brandNames: {
      group: "有香餐飲集團",
      youxiang: "有香 Memory Corner",
      memory: "憶點點 Sweet Memory",
      corner: "有香ㄟ灶腳 Old Memory Kitchen",
    },
    brandLogos: {
      group: "/images/品牌門店logo/有香LOGO.png",
      youxiang: "/images/品牌門店logo/有香LOGO.png",
      memory: "/images/品牌門店logo/憶點點LOGO.png",
      corner: "/images/品牌門店logo/有香ㄟ灶腳LOGO.png",
    },
    brandList: {
      title: "旗下品牌",
      desc: "有香餐飲集團匯聚多元品牌，始終以料理為核心，從經典台灣料理到療癒甜點與鹹食，再到日常冷凍台式家常美味，持續傳承台灣飲食文化的深厚底蘊。凡事台味，生活更有滋味。",
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
        sections: [
          {
            heading: "有香餐飲集團",
            content:
              "<h3 class='text-xl md:text-2xl font-bold'>一味傳三代，半世紀傳承，一個不變的家味道</h3>",
          },
          {
            heading: "一切，始於 1975 年的高雄",
            content:
              "<p>有香餐飲集團的故事，始於 1975 年的台灣高雄。<br />吳爺爺為了改善家人的生活，<br />毅然放棄穩定高薪的工作，創立了一間小餐館。<br />他每日清晨騎著腳踏車跋涉數小時，<br />拜師學習台灣傳統羊肉料理。<br />這份對美食的執著，<br />讓吳家羊肉鍋成為高雄饕客心中難忘的珍味。<br />隨著歲月流轉，<br />吳爺爺將這份獨特的秘方與精神傳承給吳爸爸，<br />父子攜手經營，<br />餐館逐漸成為高雄在地人熟知的經典小館，名聲遠播。</p>",
          },
          {
            heading: "加拿大的重生",
            content:
              "<p>後來，吳家移民加拿大，<br />原本的餐館畫下句點，<br />也成為吳爺爺心中一份難以釋懷的遺憾。<br />然而，對料理的熱情與家的味道，<br />並沒有因此消失。</p>",
          },
          {
            heading: "第一家店：有香 Memory Corner",
            content:
              "<p>成長於加拿大的吳家長孫，自小立志成為廚師，<br />對爺爺的好手藝始終念念不忘。<br />歷經多年學習與磨練，<br />他決定讓這份家族的味道重現異鄉，<br />並創立第一家餐廳 —— 有香 Memory Corner，<br />象徵著家族味道在北美的重新誕生。<br />「有香」這個名字，<br />源自爺爺與奶奶的名字，<br />承載著對家族傳承最深的敬意與思念。<br />它不只是一個名字，<br />更是一份情感的延續，<br />一段家的記憶。</p>",
          },
          {
            heading: "從一家餐廳，到有香餐飲集團",
            content:
              "<p>隨著有香 Memory Corner 的成長，<br />品牌的願景也不再只限於一家餐廳。<br />因此成立了 <b>有香餐飲集團 Memory Dining Group</b>，整合多個品牌與中央廚房體系，目前涵蓋：</p><ul class='list-disc list-inside my-4 inline-block text-left'><li><b>有香 Memory Corner – 經典台灣料理</b></li><li><b>憶點點 Sweet Memory – </b>療癒甜點與鹹食</li><li><b>有香ㄟ灶腳 Old Memory Kitchen – </b>台味便利店</li><li><b>中央廚房與製作中心 – </b>Central Kitchen & Production Hub</li></ul><p>所有品牌皆源自同一份家族精神，<br />延續三代傳承的料理初心，<br />用不同形式，訴說同一個家的故事。</p>",
          },
          {
            heading: "我們相信",
            content:
              "<p>真正打動人心的，不只是味道，<br />而是那份讓人想起「家」的溫度。<br />有香餐飲集團希望，<br />這份跨越時空與國界的家族風味，<br />能溫暖每一位顧客的心。<br />讓台灣的飲食文化在北美再次綻放，<br />成為人們心中熟悉又難忘的味道。</p>",
          },
        ],
      },
      youxiang: {
        origin: {
          label: "【緣起】",
          title: "家的味道，乘載記憶的角落",
          caption:
            "有香位於大溫地區 Richmond 的 Garden City Road。等你推開門，與台灣的美好相遇。",
          paragraphs: [
            "有香從開店的第一天起，便選擇走一條不張揚卻踏實的路。",
            "我們相信，真正能留下來的味道，不靠噱頭，而是靠時間累積、反覆調整，讓每一道料理都能喚起那份熟悉與安心。",
            "「有香」象徵餐桌上的鍋氣香、飯菜香與湯頭香，是一家人圍坐時最真實、也最熟悉的味道。我們的初衷，不是端出制式化的料理，而是希望每一次上桌，都能呈現一桌讓人想起家人、想起日常的家常菜。",
            "在異鄉的城市裡，有香希望成為一張溫暖的餐桌，承載記憶，也延續家的味道。",
          ],
        },
        glory: {
          label: "【光采】",
          caption: "每一面獎牌，都是對料理初心的肯定。",
          title: "【品牌光采】<br />料理初心與承諾",
          paragraphs: [
            "有香主打多款鍋物、熱炒、慢燉料理與酥香炸物，選用當季食材，講究火候與時間的堆疊。我們不追求浮誇的擺盤，只在乎入口的那一刻，是否能讓人由衷地說出：「這就是我熟悉的味道。」",
            "大火快炒的香氣、慢燉入味的湯頭，以及樸實溫暖的經典台灣料理，共同構成有香所堅持的經典台味。",
            "多年來，有香獲得來自顧客與各界的肯定。從地方票選人氣餐廳，到美食媒體的專題報導，每一份榮耀背後，都是團隊在廚房中一鍋一鍋反覆試驗、調整與修正的成果。",
            "對有香而言，這些肯定不只是成績，更是一種提醒——提醒我們不被掌聲帶走，持續守住對料理最初的熱情與初心。",
          ],
        },
        classic: {
          label: "【老味道】",
          caption: "燈光亮起，餐桌排開，台灣日常的溫暖在有香裡悄悄展開。",
          title: "【品牌文化】推開有香這扇門<br />，與台灣的美好相遇",
          paragraphs: [
            "走進有香，映入眼簾的是來自台灣的懷舊老物與復古空間設計。每一件陳設，都承載著世代共通的生活記憶。",
            "溫暖而樸實的用餐氛圍，讓人暫時放慢腳步，在城市的一隅，感受台灣日常中那份熟悉又親切的生活風景。",
            "有香希望，不論是日常用餐或親友相聚，都能成為一張自在的餐桌。當燈光亮起、鍋氣升騰，笑聲與交談在空氣中流動，交織成屬於每一個人的生活美好片刻。",
          ],
        },
      },
      memory: {
        mainTitle: "【歡迎來到憶點點】",
        origin: {
          label:
            "憶點點位於 Richmond Leslie Road，帶來台灣北、中、南的療癒甜點與鹹食。",
          paragraphs: [
            "憶點點（Sweet Memory），是一個承載美好回憶的名字，象徵那些藏在日常裡、細細品嚐才會悄然浮現的甜蜜時刻。熟悉的滋味喚醒歲月積澱的記憶，為當下帶來慰藉。",
            "憶點點不僅是間甜點店，更是讓人駐足放慢腳步的角落。細品手作風味——無論甜鹹——勾勒出台灣生活獨有的溫柔幸福片段。",
          ],
        },
        persist: {
          label: "【堅持】",
          caption: "從甜點到鹹食，每一道料理，都是用心堆疊的美好滋味。",
          title: "【理念與風味】",
          paragraphs: [
            "憶點點匯聚台灣北部、中部與南部的經典街頭美食與甜蜜點心。每口滋味皆展現台灣飲食文化中細膩而親切的風味。",
            "所有餐點皆以手工技藝精心製作，透過講究的正宗台灣料理創作，傳遞溫馨難忘的美好記憶。",
          ],
        },
        classic: {
          label: "【老味道】",
          caption:
            "一個適合細細品嚐甜與鹹，讓自己慢慢放鬆、享受療癒片刻的地方。",
          title: "【放鬆身心的好去處】",
          paragraphs: [
            "踏入憶點點，暖意融融的樸實空間與懷舊細節交織，營造出溫馨舒適的氛圍。",
            "這裡不刻意重現過往，而是將懷舊料理的滋味編織進日常生活的節奏。",
            "無論您是獨享甜點的靜謐時光，或與摯愛共享珍貴時刻，憶點點致力於打造一個讓人放鬆身心、創造甜蜜回憶的空間。",
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
        glory: {
          label: "【品質】",
          caption: "嚴格把關，只為呈現最好的台灣味。",
          title: "從源頭到餐桌，<br />守護記憶中的味道",
          paragraphs: [
            "為了讓在異鄉的遊子能吃到最正宗的台灣味，我們成立了專屬的中央廚房與選品團隊。每一道冷凍調理包，都經過無數次還原度的測試；每一款上架的零食，都是台灣人從小吃到大的經典。",
            "我們相信，便利不代表隨便。即便是一包簡單的乾拌麵，也要有如同現煮般的靈魂與香氣。",
          ],
        },
        classic: {
          label: "【便利】",
          title: "把台灣搬進你的冰箱，<br />隨時隨地，想吃就吃。",
          paragraphs: [
            "想念台灣夜市的鹹酥雞？懷念巷口的滷肉飯？在有香ㄟ灶腳，這些都不再遙不可及。我們致力於將台灣的街頭美味，轉化為方便保存與烹調的形式。",
            "打開冰箱，加熱幾分鐘，道地的台灣味立刻上桌。這是我們給您的承諾——讓家鄉味，成為您生活中最垂手可得的幸福。",
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
          addrLine1: "4651 Garden City Rd #1110",
          addrLine2: "Richmond, BC V6X 2K4",
          postalCode: "V6X 2K4",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "4651 Garden City Rd #1110",
          hours:
            "Sun-Thur\n• 11:30 AM – 3:00 PM (Last Call: 2:45 PM)\n• 4:00 PM – 10:00 PM (Last Call: 9:15 PM)\n\nFri & Sat\n• 11:30 AM – 3:00 PM (Last Call: 2:45 PM)\n• 4:00 PM – 11:00 PM (Last Call: 10:15 PM)",
          img: "/images/brand-story/memory-corner-01.png",
          mapUrl:
            "https://maps.google.com/?q=4651+Garden+City+Rd+%231110,+Richmond,+BC+V6X+2K4",
        },
        {
          id: "store-youxiang-coquitlam",
          name: "Memory Corner 有香 (Coquitlam)",
          tel: "(604) 917-0168",
          addrLine1: "345 North Rd",
          addrLine2: "Coquitlam, BC V3K 3V8",
          postalCode: "V3K 3V8",
          addressLocality: "Coquitlam",
          addressRegion: "BC",
          streetAddress: "345 North Rd",
          hours: "Daily\n• 11:30 AM – 11:00 PM",
          img: "/images/brand-story/有香光采.webp",
          mapUrl:
            "https://maps.google.com/?q=345+North+Rd,+Coquitlam,+BC+V3K+3V8",
        },
      ],
      memory: [
        {
          id: "store-memory-1",
          name: "Sweet Memory 憶點點",
          tel: "(604) 370-2882",
          addrLine1: "8080 Leslie Rd #130",
          addrLine2: "Richmond, BC V6X 4A8",
          postalCode: "V6X 4A8",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "8080 Leslie Rd #130",
          hours:
            "Mon–Fri\n• 5:00 PM – 12:30 AM\n\nSat, Sun & All Holidays\n• 11:30 AM – 12:30 AM\n(All Holidays include school breaks)",
          img: "/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp",
          mapUrl:
            "https://maps.google.com/?q=8080+Leslie+Rd+%23130,+Richmond,+BC+V6X+4A8",
        },
      ],
      corner: [
        {
          id: "store-corner-1",
          name: "Old Memory Kitchen 有香ㄟ灶腳",
          tel: "(778) 723-1685",
          addrLine1: "8080 Leslie Rd #150",
          addrLine2: "Richmond, BC V6X 4A8",
          postalCode: "V6X 4A8",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "8080 Leslie Rd #150",
          hours: "Daily\n• 10:00 AM – 7:00 PM",
          img: "/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp",
          mapUrl:
            "https://maps.google.com/?q=8080+Leslie+Rd+%23150,+Richmond,+BC+V6X+4A8",
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
    brandNames: {
      group: "Memory Dining Group",
      youxiang: "Memory Corner",
      memory: "Sweet Memory",
      corner: "Old Memory Kitchen",
    },
    brandLogos: {
      group: "/images/品牌門店logo/有香LOGO.png",
      youxiang: "/images/品牌門店logo/有香LOGO.png",
      memory: "/images/品牌門店logo/憶點點LOGO.png",
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
      { id: "corner", label: " Old Memory Corner" },
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
        sections: [
          {
            heading: "Memory Dining Group",
            content:
              "<h3 class='text-xl md:text-2xl font-bold'>Three Generations. Half a Century. One Timeless Flavour.</h3>",
          },
          {
            heading: "It All Began in Kaohsiung, 1975",
            content:
              "<p>The story of Memory Dining Group began in 1975 in Kaohsiung, Taiwan.<br />In hopes of creating a better life for his family,<br />Grandpa Wu left behind a stable, well-paid job and opened a small local restaurant.<br />Every morning, he rode his bicycle for hours<br />to learn traditional Taiwanese lamb recipes from master chefs.<br />His dedication to authentic flavours<br />soon made Wu’s Lamb Hot Pot a beloved hidden gem among food lovers in Kaohsiung.<br />As the years passed,<br />Grandpa Wu passed down not only his secret recipes,<br />but also his values and passion for food to his son.<br />Together, father and son continued the journey,<br />and the restaurant gradually became a well-known local classic,<br />cherished by generations of customers.</p>",
          },
          {
            heading: "A New Chapter in Canada",
            content:
              "<p>Later, the Wu family immigrated to Canada.<br />The original restaurant closed its doors,<br />becoming a bittersweet chapter and a lifelong regret in Grandpa Wu’s heart.<br />Yet the family’s passion for food and tradition<br />never disappeared.</p>",
          },
          {
            heading: "The First Restaurant: Memory Corner",
            content:
              "<p>Growing up in Canada, the eldest grandson of the Wu family dreamed of becoming a chef.<br />He never forgot his grandfather’s craftsmanship and the flavours of home.<br />After years of training and experience,<br />he decided to revive the family’s legacy abroad<br />by opening the first restaurant — Memory Corner (有香),<br />marking the rebirth of the family’s flavours in North America.<br />The name Memory Corner comes from the names of Grandpa and Grandma.<br />It carries the family’s deepest respect and love across generations.<br />It is not just a name,<br />but a continuation of emotion,<br />and a living memory of home.</p>",
          },
          {
            heading: "From One Restaurant to Memory Dining Group",
            content:
              "<p>As Memory Corner continued to grow,<br />the vision expanded beyond a single restaurant.<br />This led to the establishment of <b>Memory Dining Group</b>,<br />bringing together multiple brands and a central kitchen system, including:</p><ul class='list-disc list-inside my-4 inline-block text-left'><li><b>Memory Corner – </b>Classic Taiwanese Cuisine</li><li><b>Sweet Memory – </b>Nostalgic Desserts & Savoury Dishes</li><li><b>Old Memory Kitchen – </b>Taiwanese Convenience Store</li><li><b>Central Kitchen & Production Hub</b></li></ul><p>All concepts are rooted in the same family legacy,<br />carrying forward a spirit passed down through three generations —<br />telling one story, in many forms,<br />through the taste of home.</p>",
          },
          {
            heading: "Our Belief",
            content:
              "<p>We believe that what truly touches people is not just great food,<br />but the warmth that reminds them of home.<br />Memory Dining Group hopes that this family flavour,<br />spanning time and borders,<br />can bring comfort to every guest.<br />We strive to let Taiwanese food culture shine once again in North America,<br />sharing the taste of home,<br />and creating memories that last.</p>",
          },
        ],
      },
      youxiang: {
        origin: {
          label: "【ORIGIN】",
          title: "Brand Story｜A Taste of Home, A Corner of Memories",
          caption:
            "Memory Corner | Richmond · Garden City Road Memory Corner invites you to step inside and discover the beauty of Taiwan.",
          paragraphs: [
            "From the very first day, Memory Corner chose a path that is humble, steady, and sincere.",
            "We believe that flavors that truly last are not built on gimmicks, but on time, patience, and constant refinement—so every dish can bring back a sense of familiarity and comfort.",
            "The name “Memory Corner” represents the aromas of the dining table—the fragrance of a hot wok, home-cooked dishes, and simmering broths—the most real and familiar scents when a family gathers together.",
            "Our goal has never been to serve standardized dishes, but to present a table of home-style cooking that reminds people of family, of everyday life, and of the warmth of home.",
            "In a city far from Taiwan, Memory Corner hopes to be a warm table that carries memories forward and keeps the taste of home alive.",
          ],
        },
        glory: {
          label: "【GLORY】",
          caption:
            "Every award is a reflection of our commitment to cooking with heart.",
          title: "Brand Highlights<br />｜A Commitment to Our Culinary Roots",
          paragraphs: [
            "Memory Corner offers a wide selection of hot pots, stir-fries, slow-braised dishes, and crispy fried specialties.We use seasonal ingredients and pay close attention to heat, timing, and technique.",
            "We do not chase flashy presentation. What matters most is the moment after the first bite—when someone naturally says,“This tastes just like home.”",
            "The aroma of high-heat stir-fries, the depth of slow-simmered broths, and the warmth of classic Taiwanese home-style dishes together form the timeless flavors that define Memory Corner.",
            "Over the years, Memory Corner has received recognition from guests and the community alike—from local popularity awards to features in food media.",
            "Behind every honor is a team that has spent countless hours in the kitchen, testing, adjusting, and perfecting each dish.",
            "To us, these recognitions are not just achievements, but reminders—reminders to stay grounded, and to hold on to the passion and sincerity that started it all.",
          ],
        },
        classic: {
          label: "【CLASSIC】",
          caption:
            "As the lights glow and tables fill,the warmth of everyday Taiwan gently unfolds at Memory Corner.",
          title:
            "Brand Culture｜Step Inside, and Discover the Beauty of Taiwan",
          paragraphs: [
            "Walking into Memory Corner, you will find nostalgic objects from Taiwan and retro-inspired interior design.",
            " Every detail carries shared memories across generations.",
            "The warm, unpretentious atmosphere invites guests to slow down and enjoy a moment of comfort— a glimpse into the familiar, everyday life of Taiwan, right in the corner of the city.",
            "Whether it is a casual meal or a gathering with friends and family, Memory Corner hopes to be a table where everyone feels at ease.",
            "When the lights glow, the woks heat up, and the steam rises,laughter and conversation fill the air—creating small but meaningful moments in everyday life.",
          ],
        },
      },
      memory: {
        mainTitle: "Welcome to Sweet Memory",
        origin: {
          label:
            "Sweet Memory | Richmond · Leslie RoadBringing comforting desserts and savoury delights from across Taiwan.",
          paragraphs: [
            "Sweet Memory is a name that inspires beautiful recollections,bringing sweet, meaningful moments into everyday life—revealed only when savoured slowly.",
            "Familiar flavours awaken memories built over time,bringing comfort to the present.Sweet Memory is more than a dessert shop—it is a corner where one can slow down,and enjoy handcrafted sweet and savoury delights,",
            "sketching gentle moments of happiness inspired by Taiwanese life.",
          ],
        },
        persist: {
          label: "【PERSISTENCE】",
          caption:
            "From desserts to savoury dishes, every creation is a beautiful flavour layered with care.",
          title: "Philosophy & Flavours",
          paragraphs: [
            "Sweet Memory brings together beloved street food favourites and sweet treats from Northern, Central, and Southern Taiwan. Each bite reflects the delicate and welcoming spirit of Taiwan’s culinary culture.",
            "All dishes are crafted using handmade techniques, with careful attention to authentic Taiwanese flavours, creating warm and unforgettable food memories.",
          ],
        },
        classic: {
          label: "【CLASSIC】",
          caption:
            "A place to savour sweet and savoury moments, to slow down and enjoy gentle moments of comfort.",
          title: "A Place to Relax",
          paragraphs: [
            "Step into Sweet Memory, where a warm, unpretentious space meets nostalgic details, creating a cozy and comfortable atmosphere.",
            "Rather than recreating the past, we weave the flavours of Taiwanese cuisine into the rhythm of everyday life.",
            "Whether enjoying desserts in quiet solitude, or sharing special moments with loved ones, Sweet Memory aspires to be a place where you can relax and create your own sweet memories.",
          ],
        },
      },
      corner: {
        origin: {
          label: "Bringing the taste of Taiwan into  your everyday life",
          title: "Brand Story｜Taiwanese Convenience Store",
          caption:
            "Old Memory Kitchen | Richmond · Leslie Road Everyday Taiwanese flavours, ready to go.",
          paragraphs: [
            "Old Memory Kitchen is a Taiwanese convenience store inspired by everyday food culture in Taiwan.",
            "More than just a place to shop, it’s part of daily life.",
            "A snack after school, a warm meal after work, or a comforting bite late at night.",
            "Old Memory Kitchen brings these familiar moments closer to you.",
          ],
        },
        glory: {
          label: "【QUALITY】",
          caption:
            "A wide selection of Taiwan’s most popular snacks, all in one place.",
          title: "Product Highlights",
          paragraphs: [
            "We bring together Taiwan’s most popular snacks and a wide range of best-selling frozen comfort dishes.",
            "From nostalgic treats to classic Taiwanese favorites, enjoying great flavors at home has never been easier.",
            "Just heat, serve, and enjoy anytime.",
          ],
        },
        classic: {
          label: "Leave the busy life to the day—leave the good flavors to us.",
          caption:
            "Take your time browsing in-store, and discover the everyday flavours of Taiwan.",
          title: "Convenience for Everyday Living",
          paragraphs: [
            "Whether you prefer to browse in-store at your own pace, or shop online from the comfort of home, there’s always an easy way to bring the flavors of Taiwan with you.",
            "Our online shop offers flexible pickup options: choose store pickup or home delivery,so great flavors can be part of your everyday routine.",
            "Old Memory Kitchen hopes to become a part of your daily life—bringing the taste of Taiwan into your fridge, your pantry, and naturally into the rhythm of each day.",
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
          addrLine1: "4651 Garden City Rd #1110",
          addrLine2: "Richmond, BC V6X 2K4",
          postalCode: "V6X 2K4",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "4651 Garden City Rd #1110",
          hours:
            "Sun-Thur\n• 11:30 AM – 3:00 PM (Last Call: 2:45 PM)\n• 4:00 PM – 10:00 PM (Last Call: 9:15 PM)\n\nFri & Sat\n• 11:30 AM – 3:00 PM (Last Call: 2:45 PM)\n• 4:00 PM – 11:00 PM (Last Call: 10:15 PM)",
          img: "/images/brand-story/memory-corner-01.png",
          mapUrl:
            "https://maps.google.com/?q=4651+Garden+City+Rd+%231110,+Richmond,+BC+V6X+2K4",
        },
        {
          id: "store-youxiang-coquitlam",
          name: "Memory Corner (Coquitlam)",
          tel: "(604) 917-0168",
          addrLine1: "345 North Rd",
          addrLine2: "Coquitlam, BC V3K 3V8",
          postalCode: "V3K 3V8",
          addressLocality: "Coquitlam",
          addressRegion: "BC",
          streetAddress: "345 North Rd",
          hours: "Daily\n• 11:30 AM – 11:00 PM",
          img: "/images/brand-story/有香光采.webp",
          mapUrl:
            "https://maps.google.com/?q=345+North+Rd,+Coquitlam,+BC+V3K+3V8",
        },
      ],
      memory: [
        {
          id: "store-memory-1",
          name: "Sweet Memory",
          tel: "(604) 370-2882",
          addrLine1: "8080 Leslie Rd #130",
          addrLine2: "Richmond, BC V6X 4A8",
          postalCode: "V6X 4A8",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "8080 Leslie Rd #130",
          hours:
            "Mon–Fri\n• 5:00 PM – 12:30 AM\n\nSat, Sun & All Holidays\n• 11:30 AM – 12:30 AM\n(All Holidays include school breaks)",
          img: "/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp",
          mapUrl:
            "https://maps.google.com/?q=8080+Leslie+Rd+%23130,+Richmond,+BC+V6X+4A8",
        },
      ],
      corner: [
        {
          id: "store-corner-1",
          name: "Old Memory Kitchen",
          tel: "(778) 723-1685",
          addrLine1: "8080 Leslie Rd #150",
          addrLine2: "Richmond, BC V6X 4A8",
          postalCode: "V6X 4A8",
          addressLocality: "Richmond",
          addressRegion: "BC",
          streetAddress: "8080 Leslie Rd #150",
          hours: "Daily\n• 10:00 AM – 7:00 PM",
          img: "/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp",
          mapUrl:
            "https://maps.google.com/?q=8080+Leslie+Rd+%23150,+Richmond,+BC+V6X+4A8",
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

const ContentGroup = ({ t }) => (
  <div className="space-y-8">
    <div className="pt-6">
      {/* 跑馬燈容器 */}
      <div className="mb-12 overflow-hidden relative">
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

      <div className="space-y-16 text-[16px] flex flex-col justify-center items-center max-w-[700px] mx-auto leading-8 tracking-[0.05em] text-[#3b2a1a]">
        {t.content.group.sections ? (
          t.content.group.sections.map((section, idx) => (
            <div key={idx} className="w-full text-center">
              <h2 className="mb-6 text-2xl font-bold leading-relaxed md:text-3xl text-[#7b5b33]">
                {section.heading}
              </h2>
              <div
                className="space-y-2 text-center"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))
        ) : (
          /* 英文版 fallback (雖然現在已有資料，但保留結構安全) */
          <>
            <h1 className="mb-6 text-3xl font-bold leading-relaxed md:text-4xl text-center">
              {t.content.group.title}
            </h1>
            {t.content.group.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </>
        )}
      </div>
    </div>

    {/* 旗下品牌列表 */}
    {t.brandList && (
      <FadeUp delay={0.2}>
        <section className="mt-16 pt-16 border-t border-[#c9b79a]">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h3 className="text-3xl font-bold mb-6 tracking-[0.2em] text-[#3b2a1a]">
              {t.brandList.title}
            </h3>
            <p className="mb-12 text-[#5c4e42] text-[16px] leading-8 tracking-widest max-w-2xl mx-auto">
              {t.brandList.desc}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
              {t.brandList.logos.map((logo, index) => (
                <div
                  key={index}
                  className="relative w-[230px] h-[130px] transition-all duration-500 hover:scale-110"
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
      <div className="mb-2  ">
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
          <div className=" ">
            <Image
              src="/images/brand-story/有香光采.webp"
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
      <div className=" ">
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
      <div className="mb-2  ">
        <Image
          src="/images/brand-story/憶點點/憶點點(1280 x 650 像素).webp"
          alt="Sweet Memory Origin"
          width={880}
          height={520}
          className=" w-full  "
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
          <div className=" ">
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
        <div className=" ">
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
      <div className="mb-2  ">
        <Image
          src="/images/brand-story/有香ㄟ灶腳上方(1280 x 650 像素).webp"
          alt="Kitchen Corner Origin"
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

    <div className="border-t pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.corner.glory.label}
      </h2>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/2">
          <div className=" ">
            <Image
              src="/images/brand-story/灶腳直立式小圖.webp"
              alt="Kitchen Corner Quality"
              width={880}
              height={520}
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="mt-3 text-[14px] tracking-[0.2em] text-[#7b5b33]">
            {t.content.corner.glory.caption}
          </p>
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h3
            className="text-3xl leading-snug md:text-4xl"
            dangerouslySetInnerHTML={{ __html: t.content.corner.glory.title }}
          />
          <div className="mt-4 space-y-3 text-[16px] leading-relaxed tracking-[0.05em]">
            {t.content.corner.glory.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-[#c9b79a] pt-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.4em] text-[#7b5b33]">
        {t.content.corner.classic.label}
      </h2>
      <div className=" ">
        <Image
          src="/images/brand-story/灶腳三色芋圓產品-2.webp"
          alt="Kitchen Corner Classic"
          width={880}
          height={520}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="mt-6 space-y-3 text-[16px] leading-relaxed tracking-[0.05em]">
        <p
          className="text-2xl font-bold leading-relaxed md:text-3xl"
          dangerouslySetInnerHTML={{ __html: t.content.corner.classic.title }}
        />
        {t.content.corner.classic.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>

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
      className=" bg-[#f7ecdd]"
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
          <p itemProp="telephone" className="font-bold text-[#4b2c1d]">
            {store.tel}
          </p>
          <p>
            <span itemProp="streetAddress">{store.streetAddress}</span>
            <br />
            <span itemProp="addressLocality">
              {store.addressLocality}
            </span>, <span itemProp="addressRegion">{store.addressRegion}</span>{" "}
            <span itemProp="postalCode">{store.postalCode}</span>
          </p>
          <div
            itemProp="openingHours"
            content={store.hours.replace(/\n/g, " ")}
            className="whitespace-pre-line mt-2 text-[#5c4e42]"
          >
            {store.hours}
          </div>
        </div>

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
      { shallow: true, scroll: false },
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
    ...(t.stores.youxiang || []),
    ...(t.stores.memory || []),
    ...(t.stores.corner || []),
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
    openingHours: store.hours.replace(/\n/g, " "),
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
                          // 👇 新增 flex 讓文字可以置中排在 Logo 下方
                          className="flex flex-col items-center justify-center"
                        >
                          <Image
                            src={currentBrandLogo}
                            alt={`${activeTab} logo`}
                            width={200}
                            height={80}
                            className="object-contain h-auto w-auto max-h-[80px]"
                          />
                          {/* 👇 新增這行：動態顯示各分頁對應的公司名稱 */}
                          <span className="mt-3 text-sm font-bold tracking-[0.15em] text-[#4b2c1d]">
                            {t.brandNames?.[activeTab]}
                          </span>
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
            className={`relative gap-10 mt-20 bg-[#f0e3cd] ${
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
                      <div className="p-4 text-center text-xs text-[#7b5b33] tracking-widest">
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
                  className={isGroup ? "w-full mx-auto" : ""}
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
