export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response("Network Cadence API — coming soon");
  },
};

export interface Env {
  DB: D1Database;
}
