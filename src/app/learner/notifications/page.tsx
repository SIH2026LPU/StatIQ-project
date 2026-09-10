import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { LearnerNotificationsView } from "@/components/learner/learner-notifications-view";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const notifications = db.listNotifications(session.id);

  return <LearnerNotificationsView notifications={notifications} />;
}
