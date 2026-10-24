-- Initial Schema Migration for Cloudflare D1 / SQLite
-- Project: AI Customer Support Resolution Agent

-- Drop existing tables if re-running migration
DROP TABLE IF EXISTS ticket_updates;
DROP TABLE IF EXISTS policies;
DROP TABLE IF EXISTS tickets;

-- 1. tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('Refund', 'Delivery', 'Account', 'Account Access', 'Other')),
  status TEXT NOT NULL CHECK(status IN ('Open', 'In Progress', 'Pending Customer', 'Resolved', 'Escalated')),
  order_id TEXT,
  purchase_date TEXT,
  shipping_date TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);

-- 2. policies table
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  policy_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('Refund', 'Delivery', 'Account', 'Account Access', 'Other')),
  policy_text TEXT NOT NULL,
  applicable_conditions TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_code ON policies(policy_code);

-- 3. ticket_updates table (audit trail of human-approved updates)
CREATE TABLE IF NOT EXISTS ticket_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  proposed_status TEXT NOT NULL CHECK(proposed_status IN ('Open', 'In Progress', 'Pending Customer', 'Resolved', 'Escalated')),
  approved_category TEXT NOT NULL CHECK(approved_category IN ('Refund', 'Delivery', 'Account', 'Account Access', 'Other')),
  response_draft TEXT NOT NULL,
  evidence_policy_ids TEXT NOT NULL, -- JSON array of strings e.g. ["POL-REFUND-01"]
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ticket_updates_ticket_id ON ticket_updates(ticket_id);
