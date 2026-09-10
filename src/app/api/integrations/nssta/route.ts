import { NextResponse } from "next/server";
import { getSourcePayload } from "@/lib/integrations/catalog";

export const revalidate = 600;

export async function GET() {
  return NextResponse.json(await getSourcePayload("nssta"));
}
