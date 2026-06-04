import crypto from "crypto";

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function buildInviteUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/invite/${token}`;
}
