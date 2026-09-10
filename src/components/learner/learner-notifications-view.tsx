"use client";

import { useTranslation } from "@/components/language/language-provider";
import { MessageSquare } from "lucide-react";
import { NotificationsClient } from "@/components/notifications-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export function LearnerNotificationsView({
  notifications,
}: {
  notifications: Notification[];
}) {
  const { t } = useTranslation();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8 animate-fade-up max-w-3xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <MessageSquare className="w-4 h-4" />
          {t("nav.notifications", "NOTIFICATION CENTRE")}
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl font-bold text-on-surface">
            {t("notifications.title", "Notifications")}
          </h1>
          <span className="px-3 py-1 rounded-full bg-surface-container-low border border-white/10 text-sm text-on-surface-variant font-label-caps">
            {unreadCount} {t("notifications.unread", "unread")}
          </span>
        </div>
        <p className="text-on-surface-variant">
          {t("notifications.subtitle", "All notifications trace to real system events — score changes, course completions, new recommendations.")}
        </p>
      </header>
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
