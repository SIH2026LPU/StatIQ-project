"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/language/language-provider";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <button
      className="text-xs font-label-caps text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg border border-white/10 bg-surface-container-high transition-colors"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      {t("nav.signOut", "Sign out")}
    </button>
  );
}
