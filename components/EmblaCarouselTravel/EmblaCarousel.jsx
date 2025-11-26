import React, { useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarosuelDotButton";
import { gsap } from "gsap";

const EmblaCarousel = (props) => {
  const { slides, options } = props;

  // ✅ 1. Autoplay 設定
  const autoplay = useRef(
    Autoplay({
      delay: 4000, // 每 4 秒換下一張
      stopOnInteraction: false, // ✅ 重點：使用者滑動後，"不要"停止自動輪播
      stopOnMouseEnter: true, // 滑鼠移上去時暫停 (閱讀卡片內容)，移開後繼續
      playOnInit: true,
    })
  );

  // ✅ 2. 啟用無限循環 (loop: true)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options, // 接收外部設定
      loop: true, // ✅ 強制開啟無限輪播 (無縫跳回第一張)
      align: "start", // 靠左對齊，配合 3.5 張的視覺效果
    },
    [autoplay.current]
  );

  const dragIndicatorRef = useRef(null);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  // 滑鼠游標互動效果
  const handleMouseEnter = () => {
    gsap.to(dragIndicatorRef.current, { opacity: 1, scale: 1, duration: 0.5 });
    document.body.style.cursor = "grab";
  };
  const handleMouseLeave = () => {
    gsap.to(dragIndicatorRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.5,
    });
    document.body.style.cursor = "default";
  };

  // 鍵盤控制
  const handleKeyDown = useCallback(
    (e) => {
      if (!emblaApi) return;
      if (e.key === "ArrowLeft") onPrevButtonClick();
      if (e.key === "ArrowRight") onNextButtonClick();
    },
    [emblaApi, onPrevButtonClick, onNextButtonClick]
  );

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi
      .on("reInit", () => {})
      .on("scroll", () => {})
      .on("slideFocus", () => {});
  }, [emblaApi]);

  return (
    <div
      className="w-full pb-12 mx-auto relative ml-8 "
      style={{
        "--slide-height": "35rem", // ✅ 高度設定 (約 560px)
        "--slide-spacing": "1rem",
        "--slide-size": "28.5%",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <style>{`
        .embla__viewport { --slide-size: 28.5%; }
        @media (max-width: 1700px) { .embla__viewport { --slide-size: 30%; } }
        @media (max-width: 1200px) { .embla__viewport { --slide-size: 40%; } }
        @media (max-width: 768px)  { .embla__viewport { --slide-size: 66%; } }
        @media (max-width: 550px)  { .embla__viewport { --slide-size: 85%; } }
      `}</style>

      <div className="embla__viewport overflow-hidden pb-10" ref={emblaRef}>
        <div
          className="embla__container flex touch-pan-y touch-pinch-zoom h-auto"
          style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}
        >
          {slides.map((slide, index) => (
            <div
              className="embla__slide transform flex-none min-w-0"
              key={index}
              style={{
                transform: "translate3d(0, 0, 0)",
                flex: "0 0 var(--slide-size)",
                paddingLeft: "var(--slide-spacing)",
              }}
            >
              {/* 卡片容器 */}
              <div
                className="embla__slide__card group relative overflow-hidden border-none md:border md:border-black/10 flex flex-col justify-end"
                style={{
                  boxShadow: "0 15px 40px -10px rgba(0,0,0,0.3)",
                  borderRadius: "1.8rem",
                  height: "var(--slide-height)",
                  userSelect: "none",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <a href="/" className="block w-full h-full relative">
                  {/* 1. 背景圖片 (滿版 + 緩慢放大效果) */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {slide.content ? (
                      slide.content
                    ) : (
                      <img
                        src={slide.image}
                        alt={slide.title || `Slide ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* 2. 靜態漸層 (未 Hover 時增加文字可讀性) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none z-10 transition-opacity duration-700" />

                  {/* 3. 內容區塊：Hover 時變白底黑字 */}
                  <div
                    className="absolute bottom-0 left-0 w-full z-20 overflow-hidden
                    transition-all duration-1000 ease-in-out rounded-[22px]
                    translate-y-[calc(100%-30px)] group-hover:translate-y-0 
                    bg-transparent group-hover:bg-white" // ✅ 關鍵：Hover 變白底
                  >
                    <div className="p-8 flex flex-col gap-3">
                      {/* 標籤 */}
                      <span
                        className="w-fit text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold backdrop-blur-md shadow-sm transition-colors duration-1000
                            bg-[#dfcabe] text-white"
                      >
                        Featured
                      </span>

                      {/* 標題：預設白色 -> Hover 變深色 */}
                      <b
                        className="text-2xl md:text-3xl leading-tight line-clamp-1 transition-colors duration-700
                            text-white group-hover:text-gray-900 drop-shadow-md group-hover:drop-shadow-none"
                      >
                        {slide.title}
                      </b>

                      {/* 描述：Hover 後浮現 (深灰色) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 flex flex-col gap-4">
                        <p className="text-[18px] font-normal leading-relaxed line-clamp-3 text-f">
                          {slide.description}
                        </p>

                        <button className="w-fit text-xs font-bold border border-gray-300 text-gray-800 px-6 py-3 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="embla__controls pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-20px] md:bottom-[-30px] flex flex-col items-center gap-3">
        <div className="embla__buttons pointer-events-auto flex items-center gap-3">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots pointer-events-auto flex items-center gap-2">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
