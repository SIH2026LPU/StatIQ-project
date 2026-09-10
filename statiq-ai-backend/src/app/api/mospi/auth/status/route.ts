import { NextResponse } from 'next/server';
import { getMospiAuthStatus } from '@/lib/integrations/mospi/mospiAuthService';

export async function GET() {
  const status = getMospiAuthStatus();
  return NextResponse.json(status);
}
