import db from '../src/db/index.js';
import { db as firestore } from '../src/config/firebaseAdmin.js';

async function migrate() {
    console.log('Iniciando migração...');

    try {
        // 1. Migrar Usuários
        const users = db.prepare('SELECT * FROM users').all();
        console.log(`Migrando ${users.length} usuários...`);
        for (const user of users) {
            await firestore.collection('users').doc(user.id.toString()).set({
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at,
                legacy_id: user.id
            });
        }

        // 2. Migrar Categorias
        const categories = db.prepare('SELECT * FROM categories').all();
        console.log(`Migrando ${categories.length} categorias...`);
        for (const cat of categories) {
            await firestore.collection('categories').doc(cat.id.toString()).set({
                user_id: cat.user_id.toString(),
                name: cat.name,
                color: cat.color,
                legacy_id: cat.id
            });
        }

        // 3. Migrar Tarefas (com Subtarefas e Tags)
        const tasks = db.prepare('SELECT * FROM tasks').all();
        console.log(`Migrando ${tasks.length} tarefas...`);
        
        for (const task of tasks) {
            // Buscar subtarefas
            const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ?').all(task.id);
            
            // Buscar tags
            const tags = db.prepare(`
                SELECT t.name FROM tags t
                JOIN task_tags tt ON t.id = tt.tag_id
                WHERE tt.task_id = ?
            `).all(task.id).map(t => t.name);

            await firestore.collection('tasks').doc(task.id.toString()).set({
                user_id: task.user_id.toString(),
                category_id: task.category_id ? task.category_id.toString() : null,
                title: task.title,
                description: task.description,
                due_date: task.due_date,
                priority: task.priority,
                status: task.status,
                is_archived: !!task.is_archived,
                created_at: task.created_at,
                subtasks: subtasks.map(s => ({
                    title: s.title,
                    is_completed: !!s.is_completed
                })),
                tags: tags,
                legacy_id: task.id
            });
        }

        console.log('Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro durante a migração:', error);
        process.exit(1);
    }
}

migrate();
