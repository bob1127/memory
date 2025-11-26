import React, { useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarosuelDotButton"; // 注意你的檔名拼字
import { gsap } from "gsap";

const EmblaCarousel = (props) => {
  const { slides, options } = props;

  const autoplay = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options,
      loop: true,
      align: "start",
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
      className="w-full pb-12 mx-auto relative ml-8"
      style={{
        "--slide-spacing": "1rem",
        "--slide-size": "28.5%",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <style>{`
        .embla__viewport { --slide-size: 28.5%; --slide-height: 35rem; }
        @media (max-width: 1700px) { .embla__viewport { --slide-size: 30%; } }
        @media (max-width: 1200px) { .embla__viewport { --slide-size: 40%; } }
        @media (max-width: 768px)  { .embla__viewport { --slide-size: 66%; --slide-height: 30rem; } }
        @media (max-width: 550px)  { .embla__viewport { --slide-size: 85%; --slide-height: 22rem; } }
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
              <div
                className="embla__slide__card group relative overflow-hidden border-none md:border md:border-black/10 flex flex-col justify-end"
                style={{
                  borderRadius: "1.8rem",
                  height: "var(--slide-height)",
                  userSelect: "none",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <a href="/" className="block w-full h-full relative">
                  {/* 背景圖片 */}
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

                  {/* 漸層 (僅在電腦版顯示，手機版因為白底不需要漸層) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none z-10 transition-opacity duration-700 hidden md:block" />

                  {/* ✅ 內容區塊修正 */}
                  <div
                    className="absolute bottom-0 left-0 w-full z-20 overflow-hidden
                    transition-all duration-1000 ease-in-out rounded-[22px] md:rounded-none md:rounded-t-[22px]
                    
                    /* 手機版樣式 (預設) */
                    translate-y-0 bg-white/100 backdrop-blur-sm
                    
                    /* 電腦版樣式 (md:) */
                    md:translate-y-[calc(100%-30px)] 
                    md:bg-transparent 
                    md:group-hover:translate-y-0 
                    md:group-hover:bg-white"
                  >
                    <div className="p-5 md:p-8 flex flex-col gap-2 md:gap-3">
                      {/* Tag */}
                      <span
                        className="w-fit text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm transition-colors duration-1000
                            bg-[#dfcabe] text-white"
                      >
                        Featured
                      </span>

                      {/* Title: 手機版字體變小，且預設為黑色 */}
                      <b
                        className="leading-tight line-clamp-1 transition-colors duration-700
                            text-xl md:text-3xl
                            text-gray-900 md:text-white md:group-hover:text-gray-900 
                            drop-shadow-none md:drop-shadow-md md:group-hover:drop-shadow-none"
                      >
                        {slide.title}
                      </b>

                      {/* Description Wrapper: 手機版永遠顯示，電腦版 Hover 才顯示 */}
                      <div
                        className="
                          flex flex-col gap-3 md:gap-4
                          transition-opacity duration-700 delay-100
                          opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        {/* Description Text: 手機版字體變小 */}
                        <p className="font-normal leading-relaxed line-clamp-2 md:line-clamp-3 text-gray-600 text-sm md:text-[18px]">
                          {slide.description}
                        </p>

                        <button className="w-fit text-[10px] md:text-xs font-bold border border-gray-300 text-gray-800 px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-black hover:text-white transition-all duration-300">
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
