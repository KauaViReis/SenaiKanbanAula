import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.exec('PRAGMA foreign_keys=off;');
  
  db.transaction(() => {
    // Recreate task_tags
    db.prepare('ALTER TABLE task_tags RENAME TO task_tags_old').run();
    db.prepare(`
      CREATE TABLE task_tags (
          task_id INTEGER,
          tag_id INTEGER,
          PRIMARY KEY (task_id, tag_id),
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `).run();
    db.prepare('INSERT INTO task_tags SELECT * FROM task_tags_old').run();
    db.prepare('DROP TABLE task_tags_old').run();
  })();
  
  db.exec('PRAGMA foreign_keys=on;');
  console.log('FKs corrigidas com sucesso.');
} catch (e) {
  console.log('Erro:', e.message);
}
db.close();
