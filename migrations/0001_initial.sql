-- Network Cadence — Initial Schema
-- Run with: wrangler d1 execute wematat --file=migrations/0001_initial.sql

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  how_met TEXT,
  date_met TEXT,
  follow_up_days INTEGER DEFAULT 14,
  tags TEXT DEFAULT '[]',
  notes TEXT,
  snoozed_until TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  summary TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_id);
