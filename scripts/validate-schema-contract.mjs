#!/usr/bin/env node
/**
 * validate-schema-contract.mjs
 *
 * Validates that the TS factstore migration produces a schema that is a
 * superset of the Rust omegon-memory schema contract.
 *
 * Usage: node scripts/validate-schema-contract.mjs <path-to-schema-contract.json>
 *
 * The script:
 *   1. Creates a minimal Rust-shaped DB at the contract's stated schema_version
 *      (simulating what the Rust binary would create)
 *   2. Opens it with FactStore (triggering TS migrations)
 *   3. Verifies every table and column from the contract exists in the result
 *
 * Exit 0 = TS is compatible. Exit 1 = drift detected.
 */

import { readFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";

const contractPath = process.argv[2];
if (!contractPath) {
  console.error("Usage: node validate-schema-contract.mjs <schema-contract.json>");
  process.exit(1);
}

const contract = JSON.parse(readFileSync(contractPath, "utf-8"));
console.log(`Schema contract: version ${contract.schema_version}, ${Object.keys(contract.tables).length} tables`);

// Step 1: Create a DB with ONLY the Rust contract's tables and columns.
// This simulates what the latest Rust binary would produce.
const dir = mkdtempSync(join(tmpdir(), "schema-validate-"));
const dbPath = join(dir, "facts.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

for (const [table, columns] of Object.entries(contract.tables)) {
  // Skip FTS virtual tables — they're created by TS initSchema
  if (table.endsWith("_fts")) continue;

  const colDefs = columns.map((col, i) => {
    // First column is PRIMARY KEY
    if (i === 0) return `${col} TEXT PRIMARY KEY`;
    // embedding columns are BLOB
    if (col === "embedding") return `${col} BLOB`;
    // integer columns
    if (["dims", "reinforcement_count", "readonly"].includes(col)) return `${col} INTEGER NOT NULL DEFAULT 0`;
    // real columns
    if (["confidence", "decay_rate"].includes(col)) return `${col} REAL NOT NULL DEFAULT 0`;
    // version column
    if (col === "version" && table === "facts") return `${col} INTEGER NOT NULL DEFAULT 0`;
    if (col === "version" && table === "schema_version") return `${col} INTEGER PRIMARY KEY`;
    // everything else is TEXT
    return `${col} TEXT`;
  });

  // episode_facts has composite PK
  if (table === "episode_facts") {
    const cols = columns.map(c => `${c} TEXT NOT NULL`).join(", ");
    db.exec(`CREATE TABLE IF NOT EXISTS ${table} (${cols}, PRIMARY KEY (${columns.join(", ")}))`);
  } else {
    db.exec(`CREATE TABLE IF NOT EXISTS ${table} (${colDefs.join(", ")})`);
  }
}

// Insert schema version
db.exec(`INSERT OR REPLACE INTO schema_version (version, applied_at) VALUES (${contract.schema_version}, datetime('now'))`);

// Insert default mind (required by TS)
try {
  db.exec(`INSERT INTO minds (name, created_at) VALUES ('default', datetime('now'))`);
} catch { /* might already exist */ }

db.close();
console.log(`Created Rust-shaped DB at ${dbPath}`);

// Step 2: Open with TS FactStore — this runs migrations
const { FactStore } = await import("../extensions/project-memory/factstore.ts");
let store;
try {
  store = new FactStore(dir);
  console.log("✓ FactStore opened Rust-shaped DB successfully");
} catch (e) {
  console.error(`✗ FactStore FAILED to open Rust-shaped DB: ${e.message}`);
  rmSync(dir, { recursive: true, force: true });
  process.exit(1);
}

// Step 3: Verify every contract table+column exists after migration
const verifyDb = store.db ?? (store)._db ?? (() => { throw new Error("Cannot access DB handle"); })();
let errors = 0;

for (const [table, expectedCols] of Object.entries(contract.tables)) {
  if (table.endsWith("_fts")) continue;

  let actualCols;
  try {
    actualCols = verifyDb.prepare(`PRAGMA table_info(${table})`).all().map(r => r.name);
  } catch {
    console.error(`✗ Table '${table}' does not exist after TS migration`);
    errors++;
    continue;
  }

  for (const col of expectedCols) {
    if (!actualCols.includes(col)) {
      console.error(`✗ Column '${table}.${col}' required by Rust contract but missing after TS migration`);
      errors++;
    }
  }
}

store.close();
rmSync(dir, { recursive: true, force: true });

if (errors > 0) {
  console.error(`\n${errors} schema drift error(s) detected. Update the TS v5 migration in factstore.ts.`);
  process.exit(1);
} else {
  console.log(`✓ All ${Object.keys(contract.tables).length} tables and columns verified — TS is compatible with Rust schema v${contract.schema_version}`);
}
