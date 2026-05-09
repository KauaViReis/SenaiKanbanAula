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
    // Recreate subtasks
    db.prepare('ALTER TABLE subtasks RENAME TO subtasks_old').run();
    db.prepare(`
      CREATE TABLE subtasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          is_completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `).run();
    
    // Check if subtasks_old had created_at
    const columns = db.prepare('PRAGMA table_info(subtasks_old)').all();
    const hasCreatedAt = columns.some(c => c.name === 'created_at');
    
    if (hasCreatedAt) {
      db.prepare('INSERT INTO subtasks SELECT * FROM subtasks_old').run();
    } else {
      db.prepare('INSERT INTO subtasks (id, task_id, title, is_completed) SELECT id, task_id, title, is_completed FROM subtasks_old').run();
    }
    
    db.prepare('DROP TABLE subtasks_old').run();
  })();
  
  db.exec('PRAGMA foreign_keys=on;');
  console.log('Subtasks corrigidas com sucesso.');
} catch (e) {
  console.log('Erro:', e.message);
}
db.close();
