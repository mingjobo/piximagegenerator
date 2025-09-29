import EmojiInput from "@/components/blocks/emoji-input";
import PixelGallery from "@/components/blocks/pixel-gallery";
import { getLandingPage } from "@/services/page";
import { setRequestLocale } from "next-intl/server";
import ClientPageContent from "./client-page-content";

// Gallery需要动态数据，不能使用force-static
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${process.env.NEXT_PUBLIC_WEB_URL}/`,
        zh: `${process.env.NEXT_PUBLIC_WEB_URL}/zh/`,
        "x-default": `${process.env.NEXT_PUBLIC_WEB_URL}/`,
      },
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getLandingPage(locale);

  return <ClientPageContent page={page} />;
}
