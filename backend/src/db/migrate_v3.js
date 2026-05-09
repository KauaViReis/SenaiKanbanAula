import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

try {
  // SQLite doesn't support altering CHECK constraints directly.
  // We recreate the tasks table safely.
  db.exec('PRAGMA foreign_keys=off;');
  
  db.transaction(() => {
    // 1. Rename existing tasks table
    db.prepare('ALTER TABLE tasks RENAME TO tasks_old').run();
    
    // 2. Create new tasks table with updated constraint
    db.prepare(`
      CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          due_date DATETIME,
          priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
          status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
          is_archived BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `).run();
    
    // 3. Copy data
    db.prepare('INSERT INTO tasks SELECT * FROM tasks_old').run();
    
    // 4. Drop old table
    db.prepare('DROP TABLE tasks_old').run();
    
    // 5. Create subtasks table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS subtasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          is_completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `).run();
  })();

  db.exec('PRAGMA foreign_keys=on;');
  console.log('Migração v3 (Kanban + Subtasks) concluída.');
} catch (e) {
  console.log('Erro na migração:', e.message);
  db.exec('PRAGMA foreign_keys=on;'); // Ensure it's re-enabled on error
}
db.close();
