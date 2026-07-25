"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { bannerService } from "@/services/banner.service";
import type { HeroBannerResponse } from "@/types/banner";

type ApiErrorResponse = {
  message?: string;
};

export function HeroBanner() {
  const [banners, setBanners] = useState<HeroBannerResponse[]>([]);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);

  const updateCurrent = useCallback((api: CarouselApi) => {
    if (api) {
      setCurrent(api.selectedScrollSnap());
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadBanners() {
      try {
        setLoading(true);
        setError("");

        const data = await bannerService.getAll();

        if (active) {
          setBanners(data);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải banner từ hệ thống.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải banner.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBanners();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    updateCurrent(carouselApi);
    carouselApi.on("select", updateCurrent);
    carouselApi.on("reInit", updateCurrent);

    return () => {
      carouselApi.off("select", updateCurrent);
      carouselApi.off("reInit", updateCurrent);
    };
  }, [carouselApi, updateCurrent]);

  useEffect(() => {
    if (!carouselApi || paused || banners.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 5_000);

    return () => window.clearInterval(timer);
  }, [banners.length, carouselApi, paused]);

  if (loading) {
    return (
      <section aria-label="Đang tải banner">
        <Skeleton className="h-[320px] w-full rounded-none sm:h-[440px] lg:h-[560px]" />
      </section>
    );
  }

  if (error || banners.length === 0) {
    return (
      <section className="grid h-[320px] place-items-center bg-slate-100 px-4 sm:h-[440px] lg:h-[560px]">
        <div className="text-center text-slate-500">
          <ImageOff className="mx-auto size-10 text-[#ff174f]" />
          <p className="mt-3 font-medium">
            {error || "Hệ thống chưa có hero banner."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Banner nổi bật"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden bg-slate-950"
    >
      <Carousel
        setApi={setCarouselApi}
        opts={{ loop: banners.length > 1 }}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner, index) => {
            const image = (
              <img
                src={banner.url}
                alt={`Hero banner ${index + 1}`}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="h-[320px] w-full object-cover sm:h-[440px] lg:h-[560px]"
              />
            );

            return (
              <CarouselItem key={banner.id} className="pl-0">
                {banner.targetUrl ? (
                  <a
                    href={banner.targetUrl}
                    aria-label={`Mở nội dung của banner ${index + 1}`}
                    className="block"
                  >
                    {image}
                  </a>
                ) : (
                  image
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-4 size-11 border-white/40 bg-white/90 text-[#073b77] shadow-lg hover:bg-white hover:text-[#ff174f] sm:left-6" />
            <CarouselNext className="right-4 size-11 border-white/40 bg-white/90 text-[#073b77] shadow-lg hover:bg-white hover:text-[#ff174f] sm:right-6" />

            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => carouselApi?.scrollTo(index)}
                  aria-label={`Chuyển đến banner ${index + 1}`}
                  aria-current={current === index ? "true" : undefined}
                  className={cn(
                    "h-2.5 rounded-full bg-white/60 shadow transition-all hover:bg-white",
                    current === index ? "w-8 bg-white" : "w-2.5",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </section>
  );
}
