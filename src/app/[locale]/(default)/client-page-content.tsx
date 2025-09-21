"use client";

import { useRef } from "react";
import EmojiInput from "@/components/blocks/emoji-input";
import PixelGallery from "@/components/blocks/pixel-gallery";
import { Work } from "@/components/blocks/work-card";

interface ClientPageContentProps {
  page: any;
}

export default function ClientPageContent({ page }: ClientPageContentProps) {
  const addNewWorkRef = useRef<((work: Work) => void) | null>(null);

  const handleWorkCreated = (work: Work) => {
    if (addNewWorkRef.current) {
      addNewWorkRef.current(work);
    }
  };

  // 设置 gallery section 的回调
  const gallerySection = page.gallery ? {
    ...page.gallery,
    onNewWork: (fn: (work: Work) => void) => {
      addNewWorkRef.current = fn;
    }
  } : null;

  return (
    <>
      {page.hero && <EmojiInput section={page.hero} onWorkCreated={handleWorkCreated} />}
      {gallerySection && <PixelGallery section={gallerySection} />}
    </>
  );
}