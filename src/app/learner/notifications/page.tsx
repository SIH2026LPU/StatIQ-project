import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { Users, BookOpen, TrendingUp, MessageSquare } from "lucide-react";
import { NotificationsClient } from "@/components/notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = db.listNotifications(session.id);

  return (
    <div className="space-y-8 animate-fade-up max-w-3xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <MessageSquare className="w-4 h-4" />
          NOTIFICATION CENTRE
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl font-bold text-on-surface">Notifications</h1>
          <span className="px-3 py-1 rounded-full bg-surface-container-low border border-white/10 text-sm text-on-surface-variant">
            {notifications.filter((n) => !n.read).length} unread
          </span>
        </div>
        <p className="text-on-surface-variant">
          All notifications trace to real system events — score changes, course completions, new recommendations.
        </p>
      </header>
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
