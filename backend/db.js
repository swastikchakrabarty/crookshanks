import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Persistent database path check
let dbPath = process.env.DATABASE_PATH;

if (dbPath) {
  dbPath = path.resolve(dbPath);
  const parentDir = path.dirname(dbPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
    console.log(`[Database] Created database directory at ${parentDir}`);
  }
} else {
  dbPath = path.resolve(__dirname, 'database.sqlite');
}

console.log(`[Database] Connecting to SQLite database at ${dbPath}`);
const db = new DatabaseSync(dbPath);

export default db;
