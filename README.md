# Network Cadence

A networking contact tracker for job seekers. Track contacts, log interactions, stay on top of follow-ups.

**Stack**: Cloudflare Pages + Workers + D1 + Access

## Setup

1. Create D1 database: `wrangler d1 create network-cadence`
2. Update `database_id` in `wrangler.toml`
3. Run migrations: `npm run db:migrate`
4. Deploy: `npm run deploy`
5. Enable Cloudflare Access on your Pages domain

## Dev

```bash
npm install
npm run dev
```
