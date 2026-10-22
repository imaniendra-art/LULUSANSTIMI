import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "stimi_auth_token";
const SECRET = process.env.PANDAWA_WEBHOOK_SECRET || "stimi_secret_key_2026_xyz";

export interface SessionUser {
  id: string;
  email: string;
  nim?: string;
  fullName: string;
  role: "SUPERADMIN" | "ADMIN_BAAK" | "PENGURUS_IKA" | "ALUMNI";
}

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createToken(user: SessionUser): string {
  const data = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    if (sign(data) !== signature) return null;
    const jsonStr = Buffer.from(data, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const token = createToken(user);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
