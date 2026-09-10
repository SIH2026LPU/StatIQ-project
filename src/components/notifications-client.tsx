"use client";

import { useState } from "react";
import { CheckCheck, Bell, BookOpen, TrendingUp, Award, Info } from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const typeIcon = (type: string) => {
  switch (type) {
    case "course": return BookOpen;
    case "progress": return TrendingUp;
    case "assessment": return Award;
    case "recommendation": return Bell;
    default: return Info;
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case "course": return "text-primary-container bg-primary-container/10 border-primary-container/30";
    case "progress": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    case "assessment": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    case "recommendation": return "text-secondary-container bg-secondary-container/10 border-secondary-container/30";
    default: return "text-on-surface-variant bg-white/5 border-white/10";
  }
};

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const { t, tEntity } = useTranslation();
  const [notifications, setNotifications] = useState(initialNotifications);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PUT" })));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (notifications.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-white/10">
        <Bell className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-on-surface mb-2">
          {t("notifications.noNotifications", "No notifications yet")}
        </h3>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">
          {t("notifications.noNotificationsDesc", "Notifications appear here when you complete assessments, earn new recommendations, or finish modules.")}
        </p>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-4">
      {unread.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-xs text-primary-container hover:underline font-label-caps"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t("notifications.markAllRead", "Mark all read")}
          </button>
        </div>
      )}

      {notifications.map((n) => {
        const Icon = typeIcon(n.type);
        return (
          <div
            key={n.id}
            className={`glass-panel rounded-xl p-5 border transition-all ${
              n.read ? "border-white/5 opacity-70" : "border-primary-container/20 bg-primary-container/3"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${typeColor(n.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-bold text-sm ${n.read ? "text-on-surface-variant" : "text-on-surface"}`}>
                    {tEntity(n.title)}
                  </p>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-primary-container hover:underline font-label-caps shrink-0"
                    >
                      {t("notifications.markRead", "Mark read")}
                    </button>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{tEntity(n.body)}</p>
                <p className="text-[10px] text-on-surface-variant/50 mt-2 font-label-caps">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
