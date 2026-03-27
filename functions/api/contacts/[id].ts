/**
 * GET    /api/contacts/:id — contact + interactions
 * PUT    /api/contacts/:id — update contact
 * DELETE /api/contacts/:id — delete contact (cascades interactions)
 */

import { Env } from "../_middleware";

export const onRequestGet: PagesFunction<Env> = async ({ data, env, params }) => {
  const userId = (data as any).userId;
  const id = params.id as string;

  const contact = await env.DB.prepare(
    `SELECT * FROM contacts WHERE id = ? AND user_id = ?`
  ).bind(id, userId).first();

  if (!contact) return Response.json({ error: "Not found" }, { status: 404 });

  const { results: interactions } = await env.DB.prepare(
    `SELECT * FROM interactions WHERE contact_id = ? ORDER BY date DESC`
  ).bind(id).all();

  return Response.json({ ...contact, interactions });
};

export const onRequestPut: PagesFunction<Env> = async ({ data, env, params, request }) => {
  const userId = (data as any).userId;
  const id = params.id as string;
  const body = await request.json() as any;

  const existing = await env.DB.prepare(
    `SELECT id FROM contacts WHERE id = ? AND user_id = ?`
  ).bind(id, userId).first();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await env.DB.prepare(
    `UPDATE contacts SET name=?, company=?, role=?, how_met=?, date_met=?,
     follow_up_days=?, tags=?, notes=?, snoozed_until=?, updated_at=datetime('now')
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name, body.company ?? null, body.role ?? null,
    body.how_met ?? null, body.date_met ?? null,
    body.follow_up_days ?? 14,
    JSON.stringify(body.tags ?? []),
    body.notes ?? null, body.snoozed_until ?? null,
    id, userId
  ).run();

  return Response.json({ success: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ data, env, params }) => {
  const userId = (data as any).userId;
  const id = params.id as string;

  const existing = await env.DB.prepare(
    `SELECT id FROM contacts WHERE id = ? AND user_id = ?`
  ).bind(id, userId).first();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await env.DB.prepare(`DELETE FROM contacts WHERE id = ?`).bind(id).run();
  return Response.json({ success: true });
};
