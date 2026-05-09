import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

try {
  // Ignora erro se as colunas já existirem
  db.prepare('ALTER TABLE users ADD COLUMN name TEXT').run();
  db.prepare('ALTER TABLE users ADD COLUMN avatar TEXT').run();
  console.log('Migração concluída.');
} catch (e) {
  console.log('Colunas possivelmente já existem.', e.message);
}
db.close();
