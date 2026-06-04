import crypto from "crypto";

export type ExpiryDays = 7 | 30 | 90 | null;

export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function expiresAtFromDays(days: ExpiryDays): Date | null {
  if (days === null) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function isExpired(expiresAt: Date | null): boolean {
  if (expiresAt === null) return false;
  return new Date() > expiresAt;
}

export function buildShareUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/view/${token}`;
}
