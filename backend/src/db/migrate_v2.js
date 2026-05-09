import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.prepare('ALTER TABLE tasks ADD COLUMN is_archived BOOLEAN DEFAULT 0').run();
  console.log('Migração v2 concluída.');
} catch (e) {
  console.log('Coluna is_archived possivelmente já existe.', e.message);
}
db.close();
