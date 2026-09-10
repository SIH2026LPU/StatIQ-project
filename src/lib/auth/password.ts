import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";

const KEYLEN = 64;

export function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    const salt = parts[1];
    const hash = parts[2];
    if (!salt || !hash) return false;
    const test = scryptSync(password, salt, KEYLEN).toString("hex");
    if (test.length !== hash.length) return false;
    return timingSafeEqual(Buffer.from(test, "hex"), Buffer.from(hash, "hex"));
  }
  return stored === password;
}

export async function checkPassword(password: string, stored: string) {
  if (!stored) return false;
  if (stored.startsWith("$2")) {
    try {
      return await compare(password, stored);
    } catch {
      return false;
    }
  }
  return verifyPassword(password, stored);
}

/** Deterministic demo hash so seed users can sign in with demo123 */
export const DEMO_PASSWORD_HASH = hashPassword("demo123", "a1b2c3d4e5f60718a1b2c3d4e5f60718");
