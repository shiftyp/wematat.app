/**
 * GET  /api/contacts — list contacts sorted by follow-up urgency
 * POST /api/contacts — create a contact
 */

import { Env } from "../_middleware";

export const onRequestGet: PagesFunction<Env> = async ({ data, env }) => {
  const userId = (data as any).userId;
  const { results } = await env.DB.prepare(
    `SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC`
  ).bind(userId).all();
  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ data, env, request }) => {
  const userId = (data as any).userId;
  const body = await request.json() as any;

  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO contacts (id, user_id, name, company, role, how_met, date_met, follow_up_days, tags, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.name.trim(),
    body.company ?? null, body.role ?? null,
    body.how_met ?? null, body.date_met ?? null,
    body.follow_up_days ?? 14,
    JSON.stringify(body.tags ?? []),
    body.notes ?? null
  ).run();

  const contact = await env.DB.prepare(
    `SELECT * FROM contacts WHERE id = ?`
  ).bind(id).first();

  return Response.json(contact, { status: 201 });
};
