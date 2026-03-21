/**
 * Schema compatibility tests — verify TS FactStore can open and operate on
 * databases created by the Rust omegon-memory crate.
 *
 * The Rust schema is the source of truth. It may be a superset of what TS
 * needs, but TS must never fail to open a Rust-created DB. These tests
 * create minimal Rust-shaped DBs at various schema versions and verify the
 * TS migration path brings them up to a usable state.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { FactStore } from "./factstore.ts";

const __here = dirname(fileURLToPath(import.meta.url));
const CONTRACT_PATH = join(__here, "schema-contract.json");

/** Create a Rust-shaped v4 database — the schema omegon-memory wrote before
 *  the v5 alignment fix. Missing: created_session, superseded_at, archived_at,
 *  jj_change_id on facts; session_id, jj_change_id on episodes; episode_facts
 *  and episodes_vec tables. */
function createRustV4DB(dbPath: string): void {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS minds (
      name TEXT PRIMARY KEY,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      origin_type TEXT NOT NULL DEFAULT 'local',
      origin_path TEXT,
      origin_url TEXT,
      readonly INTEGER NOT NULL DEFAULT 0,
      parent TEXT,
      created_at TEXT NOT NULL,
      last_sync TEXT
    );
    INSERT INTO minds (name, created_at) VALUES ('default', datetime('now'));

    CREATE TABLE IF NOT EXISTS facts (
      id TEXT PRIMARY KEY,
      mind TEXT NOT NULL DEFAULT 'default',
      section TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      supersedes TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      content_hash TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 1.0,
      last_reinforced TEXT NOT NULL,
      reinforcement_count INTEGER NOT NULL DEFAULT 1,
      decay_rate REAL NOT NULL DEFAULT 0.05,
      decay_profile TEXT NOT NULL DEFAULT 'standard',
      version INTEGER NOT NULL DEFAULT 0,
      last_accessed TEXT,
      FOREIGN KEY (mind) REFERENCES minds(name) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_facts_active ON facts(mind, status) WHERE status = 'active';
    CREATE INDEX IF NOT EXISTS idx_facts_hash ON facts(mind, content_hash);
    CREATE INDEX IF NOT EXISTS idx_facts_section ON facts(mind, section) WHERE status = 'active';

    CREATE TABLE IF NOT EXISTS facts_vec (
      fact_id TEXT PRIMARY KEY,
      embedding BLOB NOT NULL,
      model TEXT NOT NULL,
      dims INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      model_name TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY,
      source_fact_id TEXT NOT NULL,
      target_fact_id TEXT NOT NULL,
      relation TEXT NOT NULL,
      description TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 1.0,
      last_reinforced TEXT NOT NULL,
      reinforcement_count INTEGER NOT NULL DEFAULT 1,
      decay_rate REAL NOT NULL DEFAULT 0.05,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (source_fact_id) REFERENCES facts(id) ON DELETE CASCADE,
      FOREIGN KEY (target_fact_id) REFERENCES facts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      mind TEXT NOT NULL DEFAULT 'default',
      title TEXT NOT NULL,
      narrative TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (mind) REFERENCES minds(name) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_episodes_mind ON episodes(mind, date DESC);

    CREATE TABLE IF NOT EXISTS embedding_metadata (
      model_name TEXT PRIMARY KEY,
      dims INTEGER NOT NULL,
      inserted_at TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS facts_fts USING fts5(
      id UNINDEXED, mind UNINDEXED, section UNINDEXED, content,
      content='facts', content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS episodes_fts USING fts5(
      id UNINDEXED, mind UNINDEXED, title, narrative,
      content='episodes', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
    INSERT INTO schema_version (version, applied_at) VALUES (4, datetime('now'));

    -- Insert a test fact so we can verify reads
    INSERT INTO facts (id, mind, section, content, status, created_at, source,
      content_hash, confidence, last_reinforced, reinforcement_count, decay_rate,
      decay_profile, version)
    VALUES ('rust-fact-1', 'default', 'Architecture', 'Fact created by Rust', 'active',
      datetime('now'), 'manual', 'abc123', 1.0, datetime('now'), 1, 0.05, 'standard', 1);
  `);
  db.close();
}

/** Create a Rust v5 DB — has all columns but may have been created fresh
 *  (not migrated). This is what the latest Rust binary creates. */
function createRustV5DB(dbPath: string): void {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS minds (
      name TEXT PRIMARY KEY,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      origin_type TEXT NOT NULL DEFAULT 'local',
      origin_path TEXT,
      origin_url TEXT,
      readonly INTEGER NOT NULL DEFAULT 0,
      parent TEXT,
      created_at TEXT NOT NULL,
      last_sync TEXT
    );
    INSERT INTO minds (name, created_at) VALUES ('default', datetime('now'));

    CREATE TABLE IF NOT EXISTS facts (
      id TEXT PRIMARY KEY,
      mind TEXT NOT NULL DEFAULT 'default',
      section TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      created_session TEXT,
      supersedes TEXT,
      superseded_at TEXT,
      archived_at TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      content_hash TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 1.0,
      last_reinforced TEXT NOT NULL,
      reinforcement_count INTEGER NOT NULL DEFAULT 1,
      decay_rate REAL NOT NULL DEFAULT 0.05,
      decay_profile TEXT NOT NULL DEFAULT 'standard',
      version INTEGER NOT NULL DEFAULT 0,
      last_accessed TEXT,
      jj_change_id TEXT,
      FOREIGN KEY (mind) REFERENCES minds(name) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_facts_active ON facts(mind, status) WHERE status = 'active';
    CREATE INDEX IF NOT EXISTS idx_facts_hash ON facts(mind, content_hash);
    CREATE INDEX IF NOT EXISTS idx_facts_session ON facts(created_session);
    CREATE INDEX IF NOT EXISTS idx_facts_version ON facts(version DESC);

    CREATE TABLE IF NOT EXISTS facts_vec (
      fact_id TEXT PRIMARY KEY,
      embedding BLOB NOT NULL,
      model TEXT NOT NULL,
      dims INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      model_name TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY,
      source_fact_id TEXT NOT NULL,
      target_fact_id TEXT NOT NULL,
      relation TEXT NOT NULL,
      description TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 1.0,
      last_reinforced TEXT NOT NULL,
      reinforcement_count INTEGER NOT NULL DEFAULT 1,
      decay_rate REAL NOT NULL DEFAULT 0.05,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      FOREIGN KEY (source_fact_id) REFERENCES facts(id) ON DELETE CASCADE,
      FOREIGN KEY (target_fact_id) REFERENCES facts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      mind TEXT NOT NULL DEFAULT 'default',
      title TEXT NOT NULL,
      narrative TEXT NOT NULL,
      date TEXT NOT NULL,
      session_id TEXT,
      created_at TEXT NOT NULL,
      jj_change_id TEXT,
      FOREIGN KEY (mind) REFERENCES minds(name) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS episode_facts (
      episode_id TEXT NOT NULL,
      fact_id TEXT NOT NULL,
      PRIMARY KEY (episode_id, fact_id),
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
      FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS episodes_vec (
      episode_id TEXT PRIMARY KEY,
      embedding BLOB NOT NULL,
      model_name TEXT NOT NULL DEFAULT '',
      dims INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS embedding_metadata (
      model_name TEXT PRIMARY KEY,
      dims INTEGER NOT NULL,
      inserted_at TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS facts_fts USING fts5(
      id UNINDEXED, mind UNINDEXED, section UNINDEXED, content,
      content='facts', content_rowid='rowid'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS episodes_fts USING fts5(
      id UNINDEXED, mind UNINDEXED, title, narrative,
      content='episodes', content_rowid='rowid'
    );

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
    INSERT INTO schema_version (version, applied_at) VALUES (5, datetime('now'));

    INSERT INTO facts (id, mind, section, content, status, created_at, source,
      content_hash, confidence, last_reinforced, reinforcement_count, decay_rate,
      decay_profile, version)
    VALUES ('rust-fact-1', 'default', 'Architecture', 'Fact from Rust v5', 'active',
      datetime('now'), 'manual', 'abc123', 1.0, datetime('now'), 1, 0.05, 'standard', 1);
  `);
  db.close();
}

describe("Rust schema compatibility", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "schema-compat-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe("Rust v4 DB (pre-alignment)", () => {
    it("opens without error", () => {
      createRustV4DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      store.close();
    });

    it("reads existing Rust-created facts", () => {
      createRustV4DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      const facts = store.getActiveFacts("default");
      assert.ok(facts.length >= 1, "should find the Rust-created fact");
      assert.equal(facts[0].content, "Fact created by Rust");
      store.close();
    });

    it("stores new facts into migrated DB", () => {
      createRustV4DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      const result = store.storeFact({ section: "Architecture", content: "New fact from TS" });
      assert.ok(result.id);
      assert.equal(result.duplicate, false);
      store.close();
    });

    it("migrates all tables to schema v5", () => {
      createRustV4DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      const db = (store as any).db;

      // facts columns
      const factCols = db.prepare("PRAGMA table_info(facts)").all().map((c: any) => c.name);
      for (const col of ["created_session", "superseded_at", "archived_at", "jj_change_id"]) {
        assert.ok(factCols.includes(col), `facts should have ${col} after migration`);
      }

      // edges columns
      const edgeCols = db.prepare("PRAGMA table_info(edges)").all().map((c: any) => c.name);
      for (const col of ["confidence", "last_reinforced", "reinforcement_count", "decay_rate", "status", "created_session", "source_mind", "target_mind"]) {
        assert.ok(edgeCols.includes(col), `edges should have ${col} after migration`);
      }

      // minds columns
      const mindCols = db.prepare("PRAGMA table_info(minds)").all().map((c: any) => c.name);
      for (const col of ["origin_path", "origin_url", "readonly", "parent", "last_sync"]) {
        assert.ok(mindCols.includes(col), `minds should have ${col} after migration`);
      }

      // episodes columns
      const epCols = db.prepare("PRAGMA table_info(episodes)").all().map((c: any) => c.name);
      for (const col of ["session_id", "jj_change_id"]) {
        assert.ok(epCols.includes(col), `episodes should have ${col} after migration`);
      }

      // episode_facts and episodes_vec tables exist
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t: any) => t.name);
      assert.ok(tables.includes("episode_facts"), "episode_facts table should exist");
      assert.ok(tables.includes("episodes_vec"), "episodes_vec table should exist");

      store.close();
    });

    it("can create edges after migration", () => {
      createRustV4DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      // Store two facts, then create an edge between them
      const f1 = store.storeFact({ section: "Architecture", content: "Fact A" });
      const f2 = store.storeFact({ section: "Architecture", content: "Fact B" });
      const edge = store.storeEdge({
        sourceFact: f1.id,
        targetFact: f2.id,
        relation: "depends_on",
        description: "A depends on B",
      });
      assert.ok(edge, "should create edge on migrated Rust DB");
      store.close();
    });
  });

  describe("Rust v5 DB (aligned)", () => {
    it("opens without error", () => {
      createRustV5DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      store.close();
    });

    it("reads and writes facts", () => {
      createRustV5DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      const facts = store.getActiveFacts("default");
      assert.ok(facts.length >= 1);
      const result = store.storeFact({ section: "Decisions", content: "Cross-runtime decision" });
      assert.ok(result.id);
      store.close();
    });
  });

  describe("schema contract validation", () => {
    it("TS-created DB satisfies the Rust schema contract", () => {
      // Fresh TS DB — should have ALL columns the Rust contract declares
      const store = new FactStore(dir);
      const db = (store as any).db;
      const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf-8"));

      for (const [table, expectedCols] of Object.entries(contract.tables) as [string, string[]][]) {
        if (table.endsWith("_fts")) continue;
        let actualCols: string[];
        try {
          actualCols = db.prepare(`PRAGMA table_info(${table})`).all().map((c: any) => c.name);
        } catch {
          assert.fail(`Table '${table}' required by Rust contract does not exist`);
          continue;
        }
        for (const col of expectedCols) {
          assert.ok(actualCols.includes(col),
            `Rust contract requires '${table}.${col}' but TS schema is missing it`);
        }
      }
      store.close();
    });

    it("Rust-shaped DB satisfies the contract after TS migration", () => {
      createRustV4DB(join(dir, "facts.db"));
      const store = new FactStore(dir);
      const db = (store as any).db;
      const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf-8"));

      for (const [table, expectedCols] of Object.entries(contract.tables) as [string, string[]][]) {
        if (table.endsWith("_fts")) continue;
        let actualCols: string[];
        try {
          actualCols = db.prepare(`PRAGMA table_info(${table})`).all().map((c: any) => c.name);
        } catch {
          assert.fail(`Table '${table}' required by Rust contract does not exist after migration`);
          continue;
        }
        for (const col of expectedCols) {
          assert.ok(actualCols.includes(col),
            `Rust contract requires '${table}.${col}' but it's missing after TS migration of Rust v4 DB`);
        }
      }
      store.close();
    });
  });
});
