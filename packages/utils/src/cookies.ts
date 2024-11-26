import { serverEnvs } from "@/server.env.js";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers.js";

export const AIRTOP_SESSION_COOKIE_NAME = "airtop-session";

export interface AirtopSessionCookie {
  // The API key for the user
  apiKey?: string;
}

function getCookieSettings() {
  const cookieOptions: Record<string, any> = {
    secure: true,
    sameSite: "Strict",
    httpOnly: true,
    path: "/",
  };

  if (process.env.NODE_ENV === "development") {
    cookieOptions.secure = false;
    cookieOptions.domain = "localhost";
  }

  return cookieOptions;
}

export async function getCookieSession() {
  return getIronSession<AirtopSessionCookie>(await cookies(), {
    password: serverEnvs.cookieSecret,
    cookieName: AIRTOP_SESSION_COOKIE_NAME,
    cookieOptions: getCookieSettings(),
  });
}

export async function getApiKeyFromCookie() {
  const session = await getCookieSession();

  return session.apiKey;
}
