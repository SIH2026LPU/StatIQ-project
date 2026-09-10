import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { BACKEND_URL } from "@/lib/backend";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/token";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/tutor/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.conversations) return NextResponse.json(data);
    }
  } catch {}

  // Fallback demo conversations
  return NextResponse.json({
    conversations: [
      { id: "conv-cpi-wpi", title: "CPI vs WPI Calculation", updatedAt: new Date().toISOString() },
      { id: "conv-plfs", title: "PLFS Multiplier Weights", updatedAt: new Date(Date.now() - 86400000).toISOString() },
    ]
  });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/tutor/conversations`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  // Instant fallback conversation
  const newId = `conv-${Date.now()}`;
  return NextResponse.json({
    conversation: {
      id: newId,
      title: "New Conversation",
      updatedAt: new Date().toISOString(),
    }
  });
}
