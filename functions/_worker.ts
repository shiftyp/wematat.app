/**
 * wematat — Worker entry point
 * Handles /api/* routes; static assets served from ./public via [assets] binding
 */

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

function getUserId(request: Request): string | null {
  const jwt = request.headers.get("CF-Access-JWT-Assertion");
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets for non-API routes
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // Auth check
    const userId = getUserId(request);
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const path = url.pathname;
    const method = request.method;

    // GET /api/contacts
    if (path === "/api/contacts" && method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC`
      ).bind(userId).all();
      return json(results);
    }

    // POST /api/contacts
    if (path === "/api/contacts" && method === "POST") {
      const body = await request.json() as any;
      if (!body.name?.trim()) return json({ error: "name is required" }, 400);
      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO contacts (id, user_id, name, company, role, how_met, date_met, follow_up_days, tags, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, userId, body.name.trim(), body.company ?? null, body.role ?? null,
        body.how_met ?? null, body.date_met ?? null, body.follow_up_days ?? 14,
        JSON.stringify(body.tags ?? []), body.notes ?? null).run();
      const contact = await env.DB.prepare(`SELECT * FROM contacts WHERE id = ?`).bind(id).first();
      return json(contact, 201);
    }

    // /api/contacts/:id routes
    const contactMatch = path.match(/^\/api\/contacts\/([^/]+)$/);
    if (contactMatch) {
      const id = contactMatch[1];

      if (method === "GET") {
        const contact = await env.DB.prepare(
          `SELECT * FROM contacts WHERE id = ? AND user_id = ?`
        ).bind(id, userId).first();
        if (!contact) return json({ error: "Not found" }, 404);
        const { results: interactions } = await env.DB.prepare(
          `SELECT * FROM interactions WHERE contact_id = ? ORDER BY date DESC`
        ).bind(id).all();
        return json({ ...contact, interactions });
      }

      if (method === "PUT") {
        const body = await request.json() as any;
        const existing = await env.DB.prepare(
          `SELECT id FROM contacts WHERE id = ? AND user_id = ?`
        ).bind(id, userId).first();
        if (!existing) return json({ error: "Not found" }, 404);
        await env.DB.prepare(
          `UPDATE contacts SET name=?, company=?, role=?, how_met=?, date_met=?,
           follow_up_days=?, tags=?, notes=?, snoozed_until=?, updated_at=datetime('now')
           WHERE id = ? AND user_id = ?`
        ).bind(body.name, body.company ?? null, body.role ?? null,
          body.how_met ?? null, body.date_met ?? null, body.follow_up_days ?? 14,
          JSON.stringify(body.tags ?? []), body.notes ?? null,
          body.snoozed_until ?? null, id, userId).run();
        return json({ success: true });
      }

      if (method === "DELETE") {
        await env.DB.prepare(`DELETE FROM contacts WHERE id = ? AND user_id = ?`).bind(id, userId).run();
        return json({ success: true });
      }
    }

    // POST /api/contacts/:id/interactions
    const interactionMatch = path.match(/^\/api\/contacts\/([^/]+)\/interactions$/);
    if (interactionMatch && method === "POST") {
      const contactId = interactionMatch[1];
      const body = await request.json() as any;
      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO interactions (id, contact_id, user_id, date, type, summary) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, contactId, userId, body.date, body.type ?? "other", body.summary).run();
      return json({ id }, 201);
    }

    return json({ error: "Not found" }, 404);
  },
};
