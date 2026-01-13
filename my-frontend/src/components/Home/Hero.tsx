"use client";
import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { HeroSlide } from '@/types';
import { getStrapiMedia } from '@/lib/api';

export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ 
      delay: 6000, 
      stopOnInteraction: false, 
      stopOnMouseEnter: true 
    })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  return (
    <div className="relative group bg-gray-900">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => {
            // 👇 1. 先获取图片地址，并在变量里存好
            const imageUrl = getStrapiMedia(slide.Image?.url);

            return (
              <div className="relative flex-[0_0_100%] min-w-0" key={slide.id}>
                <a 
                  href={slide.LinkUrl || "#"} 
                  className={`block relative h-[450px] md:h-[600px] w-full group/slide ${!slide.LinkUrl && 'cursor-default'}`}
                >
                  {/* 👇 2. 只有当 imageUrl 存在(不为null)时，才渲染 Image 组件 */}
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={slide.Headline}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/slide:scale-105"
                      priority
                    />
                  ) : (
                    // 如果没图，显示一个深色背景兜底，防止崩坏
                    <div className="absolute inset-0 bg-gray-800" />
                  )}
                  
                  {/* 遮罩层 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                  {/* 文字内容 */}
                  <div className="absolute bottom-0 left-0 w-full p-6 md:pb-16 z-10 flex justify-center">
                    <div className="max-w-5xl w-full text-center text-white transform transition-transform duration-300 group-hover/slide:-translate-y-2">
                      <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight drop-shadow-lg">
                        {slide.Headline}
                      </h2>
                      {slide.SubHeadline && (
                        <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                          {slide.SubHeadline}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* 左右箭头 */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-primary text-white rounded-full transition-all z-20 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-primary text-white rounded-full transition-all z-20 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}