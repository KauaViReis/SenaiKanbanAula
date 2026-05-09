import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.transaction(() => {
    const tasks = db.prepare('SELECT id, is_archived, created_at FROM tasks').all();
    const updateStmt = db.prepare('UPDATE tasks SET is_archived = ?, created_at = ? WHERE id = ?');
    
    for (const task of tasks) {
      if (typeof task.is_archived === 'string' && task.is_archived.includes('-')) {
        updateStmt.run(task.created_at, task.is_archived, task.id);
      }
    }
  })();
  console.log('Dados corrigidos com sucesso.');
} catch (e) {
  console.log('Erro:', e.message);
}
db.close();
