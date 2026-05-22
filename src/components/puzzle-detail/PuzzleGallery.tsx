"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  altEn: string;
  order: number;
}

interface PuzzleGalleryProps {
  images: GalleryImage[];
  title: string;
  locale: string;
}

export function PuzzleGallery({ images, title, locale }: PuzzleGalleryProps) {
  const t = useTranslations("puzzleDetail");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const active = sorted[activeIndex];

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % sorted.length);
  }, [sorted.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
  }, [sorted.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-cream">
        <span className="text-6xl" aria-hidden="true">🧩</span>
      </div>
    );
  }

  const altText = (img: GalleryImage) =>
    locale === "en" ? img.altEn || title : img.alt || title;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-cream">
        <Image
          src={active.url}
          alt={altText(active)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <button
          type="button"
          className="absolute inset-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          onClick={openLightbox}
          aria-label={t("openLightbox")}
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="list"
          aria-label={t("gallery")}
        >
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              onClick={() => setActiveIndex(idx)}
              aria-label={t("thumbnailAlt", { index: idx + 1 })}
              aria-pressed={idx === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-1 ${
                idx === activeIndex
                  ? "border-sage"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={altText(img)}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-0 bg-black/95 p-0 shadow-none">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative flex items-center justify-center">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={active.url}
                alt={altText(active)}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-white hover:bg-white/20"
              onClick={closeLightbox}
              aria-label={t("closeLightbox")}
            >
              <X className="h-5 w-5" />
            </Button>

            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-10 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
