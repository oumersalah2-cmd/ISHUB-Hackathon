import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { Ticket, Policy, TicketUpdate } from '../types/index.js';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

// Cloudflare D1 Minimal Interface for compatibility
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: { changes: number; last_row_id: number } }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

export interface IDatabaseService {
  queryAll<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  queryFirst<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  execute(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }>;
  exec(sql: string): Promise<void>;
  resetAndSeed(): Promise<void>;
}

// Node.js SQLite Adapter using built-in node:sqlite
class NodeSqliteAdapter implements IDatabaseService {
  private db: any;
  private dbPath: string;

  constructor(dbPath?: string) {
    
    if (dbPath) {
      this.dbPath = dbPath;
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } else {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      this.dbPath = path.resolve(__dirname, '../../data/support.db');
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(this.dbPath);
    this.db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
    this.initIfEmpty();
  }

  private initIfEmpty() {
    const tableCheck = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'").get();
    if (!tableCheck) {
      this.resetAndSeedSync();
    }
  }

  public resetAndSeedSync() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.resolve(__dirname, '../../migrations/0001_initial_schema.sql');
    const seedPath = path.resolve(__dirname, '../../seed/seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schemaSql);
    }

    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      this.db.exec(seedSql);
    }
  }

  async resetAndSeed(): Promise<void> {
    this.resetAndSeedSync();
  }

  async queryAll<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  async queryFirst<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
    const stmt = this.db.prepare(sql);
    const row = stmt.get(...params);
    return (row as T) || null;
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid
    };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
}

// Cloudflare D1 Adapter
class D1Adapter implements IDatabaseService {
  constructor(private d1: D1Database) {}

  async resetAndSeed(): Promise<void> {
    // In D1, migrations are executed via wrangler d1 migrations apply
  }

  async queryAll<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const stmt = this.d1.prepare(sql).bind(...params);
    const result = await stmt.all<T>();
    return result.results || [];
  }

  async queryFirst<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
    const stmt = this.d1.prepare(sql).bind(...params);
    const result = await stmt.first<T>();
    return result;
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
    const stmt = this.d1.prepare(sql).bind(...params);
    const result = await stmt.run();
    return {
      changes: result.meta?.changes ?? 1,
      lastInsertRowid: result.meta?.last_row_id ?? 0
    };
  }

  async exec(sql: string): Promise<void> {
    await this.d1.exec(sql);
  }
}

let cachedNodeDb: NodeSqliteAdapter | null = null;

export function getDatabase(env?: { DB?: D1Database }, customDbPath?: string): IDatabaseService {
  if (env?.DB) {
    return new D1Adapter(env.DB);
  }

  if (customDbPath) {
    return new NodeSqliteAdapter(customDbPath);
  }

  if (!cachedNodeDb) {
    cachedNodeDb = new NodeSqliteAdapter();
  }
  return cachedNodeDb;
}
