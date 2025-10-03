"use client";

import EmojiInput from "@/components/blocks/emoji-input";
import PixelGallery from "@/components/blocks/pixel-gallery";
import Feature3 from "@/components/blocks/feature3";
import Feature from "@/components/blocks/feature";
import FAQ from "@/components/blocks/faq";
import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import { Work } from "@/components/blocks/work-card";

interface ClientPageContentProps {
  page: any;
}

export default function ClientPageContent({ page }: ClientPageContentProps) {
  // 暂时简化，先让gallery正常工作
  const handleWorkCreated = (work: Work) => {
    // 将来可以在这里处理新作品创建后的逻辑
    console.log("New work created:", work);
    // TODO: 可以考虑用其他方式通知gallery刷新
  };

  return (
    <>
      {page.hero && (
        <EmojiInput
          section={page.hero}
          onWorkCreated={handleWorkCreated}
          compact
        />
      )}
      {page.gallery && <PixelGallery section={page.gallery} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {page.faq && <FAQ section={page.faq} />}
      {page.branding && <Branding section={page.branding} />}
      {page.cta && <CTA section={page.cta} />}
    </>
  );
}
