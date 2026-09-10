import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types/domain";

export const SESSION_COOKIE = "statiq_session";

export function authSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-statiq-auth-secret-change-me",
  );
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(authSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
