import { getIronSession, type IronSessionData } from "iron-session";
import { cookies } from "next/headers";

declare module "iron-session" {
  interface IronSessionData {
    userId?: string;
    qfSub?: string;
    email?: string;
    displayName?: string;
  }
}

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "ghars_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<IronSessionData>(cookieStore, sessionOptions);
}

export async function getRequiredSession() {
  const session = await getSession();
  if (!session.userId) {
    return null;
  }
  return session;
}
