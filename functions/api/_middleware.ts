/**
 * Auth middleware — extracts userId from Cloudflare Access JWT.
 * CF-Access-JWT-Assertion header is injected automatically by Cloudflare Access.
 * All /api/* routes are protected.
 */

export interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const jwt = context.request.headers.get("CF-Access-JWT-Assertion");

  if (!jwt) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Decode JWT payload (no verification needed — Cloudflare Access already validated it)
  const payload = JSON.parse(atob(jwt.split(".")[1]));
  context.data.userId = payload.sub;

  return context.next();
};
