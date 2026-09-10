import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { BACKEND_URL, backendJson } from "@/lib/backend";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/token";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    const data = await backendJson<any>(`/api/tutor/conversations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = (await params).id;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/api/tutor/conversations/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
