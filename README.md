# wematat

wematat — "we met at". A contact tracker for job seekers that remembers the context behind every connection. Track contacts, log interactions, stay on top of follow-ups.

**Stack**: Cloudflare Pages + Workers + D1 + Access

## Setup

1. Create D1 database: `wrangler d1 create wematat`
2. Update `database_id` in `wrangler.toml`
3. Run migrations: `npm run db:migrate`
4. Deploy: `npm run deploy`
5. Enable Cloudflare Access on your Pages domain

## Dev

```bash
npm install
npm run dev
```
