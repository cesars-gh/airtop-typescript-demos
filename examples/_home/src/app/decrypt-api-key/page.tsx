import { DecryptApiKeyContent } from "@/components/DecryptApiKeyContent";
import { getCsrfFromCookie } from "@local/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * This page is used to set the API key in the session cookie.
 * It is designed to be embedded in the Airtop Portal as an iframe,
 * where the Airtop Portal will communicate the encrypted API key to this page
 * to be submitted to the decrypt-api-key endpoint to store the API key into the
 * session cookie.
 */
export default async function ApiKeyPage() {
  const nextCookies = await cookies();
  const csrf = await getCsrfFromCookie(nextCookies);

  if (!csrf) {
    return redirect("/decrypt-api-key");
  }

  return <DecryptApiKeyContent csrf={csrf} />;
}
