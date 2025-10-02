"use client";
import Layout from "./Layout";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  LazyMotion,
  domAnimation,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";

/* ===== 假資料：自行替換 ===== */
const NEWS = [
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
  {
    img: "/images/news-01.jpg",
    title: "滿額贈送Line Pay 點數回饋，買越多賺越多",
    desc: "[Line Pay 回饋]",
  },
];

const PAGE_SIZE = 8; // ✅ 一頁 8 筆：超過 8 筆才會出現第二頁

/* ===== 更絲滑的 spring（柔順） ===== */
const spring = { type: "spring", stiffness: 70, damping: 22, mass: 0.9 };

/* 父層 variants：依序逐一進場（stagger） */
const listVariants = (reduce) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduce ? 0 : 0.085,
      delayChildren: reduce ? 0 : 0.04,
    },
  },
  exit: { opacity: 1 },
});

/* 單卡片：大位移 + 模糊 → 清晰 */
const cardVariants = {
  hidden: { opacity: 0, y: 96, filter: "blur(10px)", scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { ...spring },
  },
};

export default function News() {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(NEWS.length / PAGE_SIZE));
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return NEWS.slice(start, start + PAGE_SIZE);
  }, [page]);

  const MotionLink = motion(Link);

  return (
    <Layout>
      <LazyMotion features={domAnimation}>
        <MotionConfig transition={spring} reducedMotion="user">
          <section className="py-[150px] bg-[#e9d9be]">
            <div
              className="mx-auto w-full md:w-[90%] px-5 xl:w-[85%] max-w-[1920px]
                         grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* 父層用 stagger 控制所有卡片依序 fade-up */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${page}`}
                  className="contents"
                  variants={listVariants(reduce)}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  {currentItems.map((n, i) => (
                    <MotionLink
                      href="/awards"
                      key={`${page}-${i}-${n.title}`}
                      className="block will-change-transform"
                      whileTap={{ scale: 0.98 }}
                      style={{ transform: "translateZ(0)" }}
                      layout
                    >
                      <motion.article
                        layout
                        variants={cardVariants}
                        className="flex flex-col"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitFontSmoothing: "antialiased",
                          willChange: "transform, opacity, filter",
                        }}
                      >
                        <Link href="/news-inner">
                          <div className="relative aspect-[1/1] border-2 border-black overflow-hidden">
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              transition={spring}
                              className="w-full h-full"
                            >
                              <Image
                                src={n.img}
                                alt="news-item-img"
                                fill
                                className="object-cover w-full"
                                sizes="(max-width: 1024px) 50vw, 25vw" // ⚙️ 四欄時 25vw
                                priority={i < 4} // 首屏前 4 張優先載入
                              />
                            </motion.div>
                          </div>

                          <div className="pt-1">
                            <div className="px-3 py-5">
                              <p className="text-[14px] text-gray-600">
                                {n.desc}
                              </p>
                              <h2 className="text-[16px] font-medium leading-tight text-black">
                                {n.title}
                              </h2>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    </MotionLink>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </section>
        </MotionConfig>
      </LazyMotion>
    </Layout>
  );
}

/* ===== 分頁器：維持原設計 ===== */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const range = (s, e) => {
    for (let i = s; i <= e; i++) pages.push(i);
  };

  if (totalPages <= 7) {
    range(1, totalPages);
  } else {
    const l = Math.max(2, page - 1);
    const r = Math.min(totalPages - 1, page + 1);
    pages.push(1);
    if (l > 2) pages.push("...");
    range(l, r);
    if (r < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  const itemBase =
    "inline-flex items-center justify-center min-w-9 h-9 rounded-full text-sm transition select-none";
  const btnBase =
    "px-3 h-9 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="mt-10 flex flex-wrap gap-2 justify-center">
      <motion.button
        className={btnBase}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="上一頁"
        whileTap={{ scale: 0.96 }}
      >
        上一頁
      </motion.button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="inline-flex items-center justify-center w-9 h-9 text-gray-400"
          >
            …
          </span>
        ) : (
          <motion.button
            key={`p-${p}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            whileTap={{ scale: 0.96 }}
            className={[
              itemBase,
              p === page
                ? "bg-black text-white"
                : "border border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {p}
          </motion.button>
        )
      )}

      <motion.button
        className={btnBase}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="下一頁"
        whileTap={{ scale: 0.96 }}
      >
        下一頁
      </motion.button>
    </div>
  );
}
