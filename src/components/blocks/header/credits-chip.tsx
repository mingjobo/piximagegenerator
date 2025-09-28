"use client";

import { useAppContext } from "@/contexts/app";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CreditsChip() {
  const { user, setShowSignModal } = useAppContext();
  const t = useTranslations();

  // 未登录：显示极简勾引
  if (!user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full px-3 h-8 text-xs font-medium"
        onClick={() => setShowSignModal(true)}
      >
        {t("header.free_hook", { default: "Generate ×3" })}
      </Button>
    );
  }

  const left = user.credits?.left_credits ?? 0;
  const href = "/my-credits";

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="rounded-full px-3 h-8 text-xs font-medium"
      aria-label="credits"
    >
      <Link href={href}>{t("header.credits", { count: left })}</Link>
    </Button>
  );
}
