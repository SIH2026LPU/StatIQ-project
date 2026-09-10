import { NextResponse } from "next/server";
import { getMacroIndicators } from "@/lib/integrations/esankhyiki";

export async function GET() {
  const result = await getMacroIndicators();
  return NextResponse.json({
    success: true,
    data: result,
  });
}
