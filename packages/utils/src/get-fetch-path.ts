/**
 * Returns the base path to be used in fetch requests.
 * This is necessary for the API routes to work correctly
 * when the example site runs in a subdirectory (proxied).
 */
export function getFetchBasePath() {
  const url = new URL(window.location.href);

  if (url.pathname === "/") {
    return "";
  }

  return url.pathname;
}
